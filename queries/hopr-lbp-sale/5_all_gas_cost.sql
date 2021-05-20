/*
* xHOPR token cross chain transfer
*/
WITH trace_in AS (
    SELECT call_success, call_tx_hash, date_trunc('minute',call_block_time) AS utc_time,
          CASE
              WHEN swap_in."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN 'sell'
              ELSE 'buy'
          END AS action_type
    FROM balancer."BPool_call_swapExactAmountIn" AS swap_in -- need to check traces rather than logs  -- 0x217be03edeaf28165a3ce9212fc9d5bfaa6ffe19df5c293bc56448f12b96215d
    WHERE contract_address = '\xb249e00c0d861aaad716f46a47a340c22cd941fd'
    AND call_block_time >= '2021-02-24 12:59' -- LBP starts
    AND call_block_time <= '2021-02-28 12:36' -- LBP ends
), trace_out AS (
    SELECT call_success, call_tx_hash, date_trunc('minute',call_block_time) AS utc_time,
      CASE
          WHEN swap_out."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN 'sell'
          ELSE 'buy'
      END AS action_type
    FROM balancer."BPool_call_swapExactAmountOut" AS swap_out -- need to check traces rather than logs  -- 0x217be03edeaf28165a3ce9212fc9d5bfaa6ffe19df5c293bc56448f12b96215d
    WHERE contract_address = '\xb249e00c0d861aaad716f46a47a340c22cd941fd'
     AND call_block_time >= '2021-02-24 12:59' -- LBP starts
     AND call_block_time <= '2021-02-28 12:36' -- LBP ends
), swap_traces AS (
    SELECT * FROM trace_in
    UNION ALL 
    SELECT * FROM trace_out
), calculation_on_gas_cost AS (
    SELECT success, utc_time, action_type, gas_used * 1500 / 1e9 * gas_price / 1e9 AS cost
    FROM swap_traces
    LEFT JOIN ethereum."transactions" AS transactions
    ON swap_traces.call_tx_hash = transactions.hash
)

-- 1. show cost by success state and action type
SELECT success, action_type, sum(cost), count(cost) FROM calculation_on_gas_cost
GROUP BY success, action_type
