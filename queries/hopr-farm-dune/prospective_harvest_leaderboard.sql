/*
* HOPR Farm participants by period
*/

WITH open_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number, evt_block_time as utc_time from  hopr."HoprFarm_evt_TokenAdded"
), close_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number, evt_block_time as utc_time from  hopr."HoprFarm_evt_TokenRemoved"
), all_tx_until_current_period AS (
    SELECT *,
        SUM(amount) OVER(PARTITION BY liquidity_provider ORDER BY block_number, index ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_seeds 
    FROM (
        SELECT period, liquidity_provider, amount, block_number, index FROM open_farm
        UNION
        SELECT period, liquidity_provider, amount, block_number, index FROM close_farm
    ) AS all_farm_events
    ORDER BY block_number, index
), all_periods AS (
    SELECT DISTINCT period FROM all_tx_until_current_period
    ORDER BY period
), last_value_per_period AS (
    SELECT *,
        last_value(cumulative_seeds) over (partition by liquidity_provider, period order by block_number, index ASC RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_value
    FROM all_tx_until_current_period
), snapshots AS (
    SELECT period, liquidity_provider, min(cumulative_seeds) AS minimum_value_per_period, min(last_value_per_period) AS last_value_per_period
    FROM (
        SELECT *,
            last_value(cumulative_seeds) over (partition by liquidity_provider, period order by block_number, index ASC RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_value_per_period
        FROM all_tx_until_current_period
    ) AS all_tx_until_current_period_with_last_value
    GROUP BY liquidity_provider, period
), aggr AS (
    SELECT UNNEST(ARRAY(SELECT period FROM all_periods)) AS p, * FROM snapshots
    ORDER BY liquidity_provider, p, period
), filtered_last_period_index AS (
    SELECT * FROM aggr WHERE period <= p
), filtered_last_period AS (
    SELECT filtered_last_period_index.p, period, filtered_last_period_index.liquidity_provider, last_value_per_period AS seeds FROM (
        SELECT p, max(period) AS p_index, liquidity_provider FROM filtered_last_period_index
        GROUP BY liquidity_provider, p
        -- HAVING liquidity_provider = '\x4ac4ab29f4a87150d89d3fdd5cbc46112606e5e8'
    ) AS indexed_for_last_value
    LEFT JOIN filtered_last_period_index
    ON indexed_for_last_value.p = filtered_last_period_index.p 
    AND indexed_for_last_value.p_index = filtered_last_period_index.period 
    AND indexed_for_last_value.liquidity_provider = filtered_last_period_index.liquidity_provider
    UNION
    SELECT generate_series(0, min(p)-1) AS p, 0 as period, liquidity_provider, 0 AS seeds FROM filtered_last_period_index
    GROUP BY liquidity_provider
), filtered_cur_period AS (
    SELECT p, period, liquidity_provider, minimum_value_per_period AS seeds FROM (
        SELECT * FROM aggr WHERE period = p + 1
    ) AS filtered_cur_period_index
), stake_per_period AS (
    SELECT liquidity_provider, p + 1 AS season, min(seeds) AS stake, 
        (SELECT max(period) FROM all_periods) + 1 AS max_season 
    FROM (
        SELECT * FROM filtered_last_period
        UNION
        SELECT * FROM filtered_cur_period
    ) t
    GROUP BY liquidity_provider, season
    ORDER BY liquidity_provider, season
), until_ongoing_period AS (
    SELECT *, 384615384615384615384615/eligible_seeds/1e18 AS payout_per_uni FROM (
        SELECT season, sum(stake) AS eligible_seeds FROM stake_per_period
        GROUP BY season
    ) t
    ORDER BY season
)

SELECT liquidity_provider, sum(prosp_gain) AS prospective_harvest FROM (
SELECT *, 
    CASE
        WHEN stake_per_period.season <> max_season THEN stake * payout_per_uni
        ELSE stake * payout_per_uni * (14 - stake_per_period.season)
    END AS prosp_gain 
FROM stake_per_period
LEFT JOIN until_ongoing_period
ON stake_per_period.season = until_ongoing_period.season
) t
GROUP BY liquidity_provider
ORDER BY prospective_harvest DESC
LIMIT 10