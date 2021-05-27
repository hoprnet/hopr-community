/*
* HOPR Farm participants by period
*/

WITH open_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number, evt_block_time as utc_time from  hopr."HoprFarm_evt_TokenAdded"
), close_farm AS (
    SELECT provider as liquidity_provider, amount/1e18 as amount, period, evt_index as index, evt_block_number as block_number, evt_block_time as utc_time from  hopr."HoprFarm_evt_TokenRemoved"
), open_and_close_farm AS (
    SELECT sum(amount) AS change_in_seeds, utc_time FROM (
        SELECT amount, utc_time FROM open_farm
        UNION
        SELECT amount, utc_time FROM close_farm
    ) t2
    GROUP BY utc_time
    ORDER BY utc_time
), over_time AS (
    SELECT *,
    SUM(change_in_seeds) OVER(ORDER BY utc_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_seeds
    FROM open_and_close_farm
)

SELECT * FROM over_time