/*
* HOPR Farm participants by period
*/

WITH open_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number from  hopr."HoprFarm_evt_TokenAdded"
), close_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number from  hopr."HoprFarm_evt_TokenRemoved"
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
    SELECT liquidity_provider, p + 1 AS season, min(seeds) AS stake FROM (
        SELECT * FROM filtered_last_period
        UNION
        SELECT * FROM filtered_cur_period
    ) t
    GROUP BY liquidity_provider, season
    ORDER BY liquidity_provider, season
)

SELECT liquidity_provider, stake AS current_stake FROM stake_per_period --Farm size (UNI staked)
WHERE season IN (
    SELECT max(period) FROM all_periods
)
ORDER BY stake DESC