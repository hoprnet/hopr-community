/*
* xHOPR token cross chain transfer
*/

WITH special_address AS (
    SELECT * FROM unnest(ARRAY[
        '097707143e01318734535676cfe2e5cf8b656ae8', -- xHOPR <> wxHOPR wrapper
        'f6a78083ca3e2a662d6dd1703c939c8ace2e268d', -- omni bridge on xDai chain
        '9fea9a2f645d08866e972935595f393bddff0749'  -- HOPR presale
        -- '0000000000000000000000000000000000000000'  -- address zero
        ]) AS list
), xhopr_transfer AS (
SELECT tokens.from, tokens.to, value/1e18 as amount, evt_tx_hash, evt_block_number, date_trunc('minute',evt_block_time) AS utc_time
   FROM erc20."ERC20_evt_Transfer" AS tokens
   WHERE contract_address = '\xd057604a14982fe8d88c5fc25aac3267ea142a08'
   /* AND evt_block_time >= '2021-02-24 12:59'  -- LBP starts */
    ORDER BY utc_time ASC, evt_index ASC
), bridge_from_foreign AS (
    SELECT xhopr_transfer.to AS address, amount, utc_time, CASE 
        WHEN utc_time < '2021-02-24 12:59' THEN '1. before LBP'                             -- LBP start time
        WHEN utc_time < '2021-02-27 13:01' THEN '2. during LBP, before presale unlock'      -- Presale unlock time
        WHEN utc_time < '2021-02-28 12:36' THEN '3. unlocked presale and before LBP ends'   -- LBP end time
        ELSE '4. After LBP'
        END AS phase
    FROM xhopr_transfer
    WHERE xhopr_transfer.from = decode('0000000000000000000000000000000000000000', 'hex')   -- address zero
), bridge_to_foreign AS (
    SELECT xhopr_transfer.from AS address, -amount AS amount, utc_time, CASE 
        WHEN utc_time < '2021-02-24 12:59' THEN '1. before LBP'
        WHEN utc_time < '2021-02-27 13:01' THEN '2. during LBP, before presale unlock'
        WHEN utc_time < '2021-02-28 12:36' THEN '3. unlocked presale and before LBP ends'
        ELSE '4. After LBP'
        END AS phase FROM xhopr_transfer
    WHERE xhopr_transfer.to = decode('f6a78083ca3e2a662d6dd1703c939c8ace2e268d', 'hex')      -- address bridge
)

SELECT * FROM bridge_from_foreign
UNION 
SELECT * FROM bridge_to_foreign
