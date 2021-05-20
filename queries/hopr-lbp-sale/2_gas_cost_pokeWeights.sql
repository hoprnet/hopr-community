WITH gas_cost_t AS (
SELECT t_traces.block_time, t_traces.success, t_traces.from, transactions.gas_used * 1500/1e9 * transactions.gas_price/1e9 AS cost_in_usd FROM (
    SELECT block_time, success, traces.from, tx_hash FROM ethereum."traces" AS traces
    WHERE traces.to = '\x8cacf4c0f660efdc3fd2e2266e86a9f57f794198'
    AND input = '\xe211b875' -- pokeWeights
) AS t_traces
LEFT JOIN ethereum."transactions" AS transactions
ON t_traces.tx_hash = transactions.hash
), overview AS (
SELECT gas_cost_t.from, sum(cost_in_usd),  count(cost_in_usd) FROM gas_cost_t
GROUP BY gas_cost_t.from
ORDER BY count DESC
)
-- display the summary
-- SELECT sum(sum), sum(count) FROM overview

-- Display the overview
SELECT * FROM overview