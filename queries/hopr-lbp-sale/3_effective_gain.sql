/*
* xHOPR token cross chain transfer
*/
WITH swap_between_presale_claim_and_lbp_end AS (
SELECT evt_tx_hash, date_trunc('minute',evt_block_time) AS utc_time,
            CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN pool."tokenAmountIn"/1e18
                 ELSE pool."tokenAmountOut"/1e18
             END AS volume_in_hopr,
             CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN pool."tokenAmountOut"/1e18
                 ELSE pool."tokenAmountIn"/1e18
             END AS volume_in_dai,
             CASE
                 WHEN pool."tokenIn" = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' THEN 'sell'
                 ELSE 'buy'
             END AS action_type
      FROM balancer."BPool_evt_LOG_SWAP" AS pool
      WHERE contract_address = '\xb249e00c0d861aaad716f46a47a340c22cd941fd' -- entire LBP
      ORDER BY evt_block_time, evt_index
), lbp_tx AS (
    SELECT evt_tx_hash, utc_time, volume_in_dai, volume_in_hopr, action_type, index, gas_used, nonce, value, gas_price, transactions.from, transactions.to, gas_limit
    FROM swap_between_presale_claim_and_lbp_end
    LEFT JOIN ethereum."transactions" AS transactions
    ON transactions.hash = swap_between_presale_claim_and_lbp_end.evt_tx_hash
), lbp_agg AS (
    SELECT * FROM (
        SELECT lbp_tx.from AS account, 
            action_type, 
            sum(volume_in_dai) AS dai_sum, 
            sum(volume_in_hopr) AS hopr_sum, 
            sum(gas_price/1e9 * gas_used * 1500/1e9 ) AS trading_cost, 
            count(action_type) AS tx_count,
            count(*) OVER(PARTITION BY lbp_tx.from) AS trade_count
        FROM lbp_tx
        GROUP BY account, action_type
        ORDER BY account
    ) AS t
    WHERE trade_count>1
), effective_buy_sell_price AS (
    SELECT account,
        max(CASE WHEN action_type = 'buy' THEN (dai_sum+trading_cost)/hopr_sum END) AS avg_buy,
        max(CASE WHEN action_type = 'sell' THEN (dai_sum-trading_cost)/hopr_sum END) AS avg_sell,
        sum(CASE WHEN action_type = 'buy' THEN hopr_sum ELSE 0 END) AS total_buy_amount,
        sum(CASE WHEN action_type = 'sell' THEN hopr_sum ELSE 0 END) AS total_sell_amount
    FROM lbp_agg
    GROUP BY account
)

SELECT *, net_gain * effective_volume AS effective_gain FROM (
    SELECT *, (avg_sell-avg_buy) AS net_gain, 
    CASE WHEN total_buy_amount > total_sell_amount THEN total_sell_amount ELSE total_buy_amount END AS effective_volume
    FROM effective_buy_sell_price
) AS effective
WHERE avg_buy<3
ORDER BY effective_gain
