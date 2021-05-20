/*
* Token price of LBP
*/ 
WITH parsed AS (
SELECT *,
          t.spot_price * t.volume_in_hopr AS p_v_product
   FROM
     (SELECT evt_block_number,
             date_trunc('minute',evt_block_time) AS utc_time,
             CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN pool."tokenAmountOut"/pool."tokenAmountIn"
                 ELSE pool."tokenAmountIn"/pool."tokenAmountOut"
             END AS spot_price,
             CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN pool."tokenAmountOut"/1e18
                 ELSE pool."tokenAmountIn"/1e18
             END AS volume_in_hopr,
             CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN 'sell'
                 ELSE 'buy'
             END AS action_type
      FROM balancer."BPool_evt_LOG_SWAP" AS pool
      WHERE contract_address = '\xb249e00c0d861aaad716f46a47a340c22cd941fd' /* AND evt_block_time >= '2021-02-24 12:59' AND evt_block_time <= '2021-02-28 12:34' */ 
      ) AS t)
SELECT utc_time,
       (2431799570000000000000000 * h_weight) / ((1 - h_weight) * 31381117575462226290727604) AS no_order_price, -- https://etherscan.io/tx/0xf51d0187798de3394c2f005cb33b8c70896278f9ca411c5de8a364946b6d2352
       avg_price,
       min_price,
       max_price,
       cumulative_product/cumulative_volume AS weighted_price,  -- volume weighted price
       SUM(volume) OVER(PARTITION BY date_trunc('hour',utc_time)) AS volume_per_hour    -- 
FROM
  (-- cumulative price * volume
SELECT *,
       SUM(sum_product) OVER(
                             ORDER BY utc_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_product,
       SUM(volume) OVER(
                        ORDER BY utc_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_volume
   FROM
     (-- value grouped by minute
SELECT
       utc_time,
       11919970 * 0.56/196440 -0.56/196440 * max(evt_block_number) + 0.96 AS h_weight,
       avg(spot_price) AS avg_price,
       min(spot_price) AS min_price,
       max(spot_price) AS max_price,
       sum(volume_in_hopr) AS volume,
       sum(p_v_product) AS sum_product
      FROM parsed
      GROUP BY utc_time
      ORDER BY 1) AS c
   ORDER BY utc_time) AS RESULT