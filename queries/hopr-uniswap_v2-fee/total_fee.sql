WITH pair AS (
    -- token 0 DAI
    -- token 1 HOPR
    SELECT * FROM uniswap_v2."Factory_evt_PairCreated"
    WHERE "pair" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
), swap_fee AS (
    -- https://uniswap.org/docs/v2/advanced-topics/fees/#:~:text=There%20is%20a%200.3%25%20fee,immediately%20deposited%20into%20liquidity%20reserves.
    -- 0.3% fee 
    -- swap fee v. timestamp
    SELECT "amount0In" *0.003/1e18 AS IN0, "amount1In"*0.003/1e18 AS IN1, evt_block_time, evt_block_number, evt_index, evt_tx_hash FROM uniswap_v2."Pair_evt_Swap"
    WHERE "contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
), liquidity_change AS (
    -- liquidity provider v. timestamp
    SELECT * FROM (
        SELECT "from", "to", "value"/1e18 AS lp_token_amount, evt_block_time, evt_block_number, evt_index, evt_tx_hash FROM uniswap_v2."Pair_evt_Transfer"
        WHERE "contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
        AND "from" = '\x0000000000000000000000000000000000000000' -- Mint. Add liquidity
    ) add_liquidity
    UNION
    SELECT * FROM (
        SELECT "from", "to", -"value"/1e18 AS lp_token_amount, evt_block_time, evt_block_number, evt_index, evt_tx_hash FROM uniswap_v2."Pair_evt_Transfer"
        WHERE "contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
        AND "to" = '\x0000000000000000000000000000000000000000' -- Burn. Remove liquidity
    ) remove_liquidity
    ORDER BY evt_block_number, evt_index ASC
), provider AS (
    -- using SQL window
    -- DAO had 17985508.973142352 UNI-V2 liqudity-provider token
    SELECT * FROM (
        SELECT *,
        CASE
            WHEN sum(lp_token_amount) OVER(ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) > 0 THEN 17985508.973142352/sum(lp_token_amount) OVER(ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
            ELSE 0
        END AS liquidity_percentage,
        ROW_NUMBER() OVER(ORDER BY evt_block_number, evt_index ASC) AS rn
        FROM liquidity_change
    ) t
    WHERE rn >=3
), time_series AS (
    SELECT evt_block_time, evt_block_number, evt_index, evt_tx_hash FROM provider
    UNION
    SELECT evt_block_time, evt_block_number, evt_index, evt_tx_hash FROM swap_fee
    ORDER BY evt_block_number, evt_index ASC
), partition AS(
SELECT 
    time_series.evt_block_time, time_series.evt_block_number, time_series.evt_index, time_series.evt_tx_hash,
    provider.liquidity_percentage,
    -- https://stackoverflow.com/questions/18987791/how-do-i-efficiently-select-the-previous-non-null-value 
    sum(case when liquidity_percentage is null then 0 else 1 end) over (ORDER BY time_series.evt_block_number, time_series.evt_index ASC) as value_partition
FROM time_series
LEFT JOIN provider
ON time_series.evt_tx_hash = provider.evt_tx_hash
), fee_per_period AS
(SELECT SUM(IN0_fee) AS total_IN0_fee, SUM(IN1_fee) AS total_In1_fee, value_partition 
    FROM(
        SELECT swap_fee.In0 AS In0_fee, swap_fee.IN1 AS IN1_fee, 
        partition.value_partition
        FROM swap_fee JOIN partition
        ON swap_fee.evt_tx_hash = partition.evt_tx_hash) fee_partition
    GROUP BY value_partition), fee_calculation AS(
--hour    
SELECT  partition.value_partition AS period_number,
        partition.evt_block_time,
        (fee_per_period.total_IN0_fee * partition.liquidity_percentage) AS accrued_IN0_fee,
        (fee_per_period.total_IN1_fee * partition.liquidity_percentage) AS accrued_IN1_fee,
        partition.liquidity_percentage
FROM fee_per_period JOIN partition 
    ON fee_per_period.value_partition = partition.value_partition 
    WHERE partition.liquidity_percentage IS NOT NULL)
    
SELECT SUM(accrued_in0_fee) AS total_in0_fee, SUM(accrued_in1_fee) AS total_in1_fee 
    FROM fee_calculation
        