/*
* xHOPR token transfer
*/

WITH xhopr_transfer AS (
SELECT tokens.from, tokens.to, value/1e18 as amount, evt_tx_hash, evt_block_number, date_trunc('minute',evt_block_time) AS utc_time
   FROM erc20."ERC20_evt_Transfer" AS tokens
   WHERE contract_address = '\xd057604a14982fe8d88c5fc25aac3267ea142a08'
   /* AND evt_block_time >= '2021-02-24 12:59'  -- LBP starts */
   /* AND evt_block_time >= '2021-02-27 13:01'  -- presale unlocks */
    ORDER BY utc_time ASC, evt_index ASC
), double_entry AS (
    -- credits
    SELECT xhopr_transfer.to AS address, xhopr_transfer.from AS counterpart, amount AS amount, utc_time
    from xhopr_transfer
    UNION ALL
    -- debits
    SELECT xhopr_transfer.from AS address, xhopr_transfer.to AS counterpart, -amount AS amount, utc_time
    from xhopr_transfer
), presale_double_entry AS (
    SELECT * FROM double_entry
    WHERE address = '\x9fea9a2f645d08866e972935595f393bddff0749'
    AND utc_time <= '2021-02-28 12:36'      -- LBP ends
), waterfall_inc_dec AS (
SELECT utc_time,
    CASE WHEN xhopr_transfer.to = '\x9fea9a2f645d08866e972935595f393bddff0749' THEN xhopr_transfer.from
    ELSE xhopr_transfer.to
    END AS account,
    CASE WHEN xhopr_transfer.to = '\x9fea9a2f645d08866e972935595f393bddff0749' THEN amount
    ELSE 0
    END AS increase,
    CASE WHEN xhopr_transfer.from = '\x9fea9a2f645d08866e972935595f393bddff0749' THEN amount
    ELSE 0
    END AS decrease
FROM xhopr_transfer
WHERE xhopr_transfer.to = '\x9fea9a2f645d08866e972935595f393bddff0749'
OR xhopr_transfer.from = '\x9fea9a2f645d08866e972935595f393bddff0749'
)

SELECT time, inflow, outflow, 
    CASE WHEN diff = 50000000 THEN 0
    ELSE SUM(diff) OVER(ORDER BY time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
    END AS remaining
FROM (
SELECT date_trunc('day',utc_time) AS time, sum(increase) AS inflow, sum(decrease) AS outflow, sum(increase)-sum(decrease) as diff
FROM waterfall_inc_dec
GROUP BY date_trunc('day',utc_time)
ORDER BY date_trunc('day',utc_time) ASC
) AS wf_cumu

/*
-- get remaining balance
SELECT address, sum(amount) AS balance, max(utc_time) as time
FROM double_entry
WHERE address = '\x9fea9a2f645d08866e972935595f393bddff0749'
AND utc_time <= '2021-02-28 12:36'
GROUP BY address
-- UNION ALL
-- SELECT counterpart, -sum(amount) AS balance
*/