/*
* xHOPR token transfer, from presale contract to end accounts
*/

WITH special_address AS (
    SELECT * FROM unnest(ARRAY[
        '097707143e01318734535676cfe2e5cf8b656ae8', -- xHOPR <> wxHOPR wrapper
        'f6a78083ca3e2a662d6dd1703c939c8ace2e268d', -- omni bridge on xDai chain
        '9fea9a2f645d08866e972935595f393bddff0749'  -- HOPR presale
        ]) AS list
), xhopr_transfer AS (
SELECT tokens.from, tokens.to, value/1e18 as amount, evt_tx_hash, evt_block_number, date_trunc('minute',evt_block_time) AS utc_time
   FROM erc20."ERC20_evt_Transfer" AS tokens
   WHERE contract_address = '\xd057604a14982fe8d88c5fc25aac3267ea142a08'
   /* AND evt_block_time >= '2021-02-24 12:59'  -- LBP starts */
   /* AND evt_block_time >= '2021-02-27 13:01'  -- presale unlocks */
    ORDER BY utc_time ASC, evt_index ASC
), presale_outgoing AS (
    SELECT * FROM xhopr_transfer
    WHERE utc_time >= '2021-02-27 13:01'    -- presale claimable
    AND utc_time <= '2021-02-28 12:36'      -- LBP ends
    AND amount > 0                          -- no empty transfer
), first_deg AS ( -- 2684 aggregated rows
    SELECT 1 as stage, presale_outgoing.from AS sender, amount As value, presale_outgoing.to AS recipient, evt_tx_hash FROM presale_outgoing
    --SELECT 1 as stage, presale_outgoing.to AS recipient, sum(amount) AS total_amount, count(utc_time), min(utc_time) AS first_received, max(utc_time) AS last_received FROM presale_outgoing
    WHERE presale_outgoing.from = '\x9fea9a2f645d08866e972935595f393bddff0749'
    --GROUP BY recipient
    --ORDER BY count DESC
), second_deg AS ( -- 296 aggregated rows
    SELECT 2 as stage, presale_outgoing.from AS sender, amount As value, presale_outgoing.to AS recipient, evt_tx_hash FROM presale_outgoing
    --SELECT 2 as stage, presale_outgoing.from AS sender, presale_outgoing.to AS recipient, sum(amount) AS total_amount, count(utc_time), min(utc_time) AS first_received, max(utc_time) AS last_received FROM presale_outgoing
    WHERE presale_outgoing.from IN (
        SELECT DISTINCT recipient FROM first_deg
    )
    --GROUP BY recipient
    --ORDER BY count DESC
), third_deg AS ( -- 33 aggregated rows
    SELECT 3 as stage, presale_outgoing.from AS sender, amount As value, presale_outgoing.to AS recipient, evt_tx_hash FROM presale_outgoing
    --SELECT 3 as stage, presale_outgoing.from AS sender, presale_outgoing.to AS recipient, sum(amount) AS total_amount, count(utc_time), min(utc_time) AS first_received, max(utc_time) AS last_received FROM presale_outgoing
    WHERE presale_outgoing.from IN (
        -- unique column for 3rd_deg
        SELECT DISTINCT second_deg.recipient FROM second_deg
        LEFT JOIN first_deg
        ON first_deg.recipient = second_deg.recipient
        WHERE first_deg.recipient IS NULL
        AND second_deg.recipient NOT IN (
            -- when previous recipient is one of those special addresses, do not count those addresses
            SELECT decode(list, 'hex') FROM special_address
        )
    )
    --GROUP BY recipient
    --ORDER BY count DESC
), fourth_deg AS ( -- 5 aggregated rows
    SELECT 4 as stage, presale_outgoing.from AS sender, amount As value, presale_outgoing.to AS recipient, evt_tx_hash FROM presale_outgoing
    --SELECT 4 as stage, presale_outgoing.from AS sender, presale_outgoing.to AS recipient, sum(amount) AS total_amount, count(utc_time), min(utc_time) AS first_received, max(utc_time) AS last_received FROM presale_outgoing
    WHERE presale_outgoing.from IN (
        -- unique column for 4th_deg
        SELECT DISTINCT third_deg.recipient FROM third_deg
        LEFT JOIN (
            SELECT * FROM first_deg
            UNION
            SELECT * FROM second_deg
        ) AS past_result
        ON past_result.recipient = third_deg.recipient
        WHERE past_result.recipient IS NULL
        AND third_deg.recipient NOT IN (
            -- when previous recipient is one of those special addresses, do not count those addresses
            SELECT decode(list, 'hex') FROM special_address
        )
    )
    --GROUP BY recipient
    --ORDER BY count DESC
), fifth_deg AS ( -- 0 aggregated rows
    SELECT 5 as stage, presale_outgoing.from AS sender, amount As value, presale_outgoing.to AS recipient, evt_tx_hash FROM presale_outgoing
    --SELECT 5 as stage, presale_outgoing.from AS sender, presale_outgoing.to AS recipient, sum(amount) AS total_amount, count(utc_time), min(utc_time) AS first_received, max(utc_time) AS last_received FROM presale_outgoing
    WHERE presale_outgoing.from IN (
        -- unique column for 4th_deg
        SELECT DISTINCT fourth_deg.recipient FROM fourth_deg
        LEFT JOIN (
            SELECT * FROM first_deg
            UNION
            SELECT * FROM second_deg
            UNION
            SELECT * FROM third_deg
        ) AS past_result
        ON past_result.recipient = fourth_deg.recipient
        WHERE past_result.recipient IS NULL
        AND fourth_deg.recipient NOT IN (
            -- when previous recipient is one of those special addresses, do not count those addresses
            SELECT decode(list, 'hex') FROM special_address
        )
    )
    --GROUP BY recipient
    --ORDER BY count DESC
), fourth_deg_to_omni AS ( -- 1 row
    SELECT * FROM fourth_deg
    WHERE recipient = '\xf6a78083ca3e2a662d6dd1703c939c8ace2e268d'
), third_deg_to_omni AS ( -- 42 rows
    SELECT * FROM third_deg
    WHERE recipient = '\xf6a78083ca3e2a662d6dd1703c939c8ace2e268d'
    UNION
    SELECT * FROM third_deg
    WHERE recipient IN (
        SELECT DISTINCT sender FROM fourth_deg_to_omni
    )
), second_deg_to_omni AS ( -- 1341 rows
    SELECT * FROM second_deg
    WHERE recipient = '\xf6a78083ca3e2a662d6dd1703c939c8ace2e268d'
    UNION
    SELECT * FROM second_deg
    WHERE recipient IN (
        SELECT DISTINCT sender FROM third_deg_to_omni
        UNION 
        SELECT DISTINCT sender FROM fourth_deg_to_omni
    )
), first_deg_to_omni AS ( -- 1256 rows
SELECT * FROM first_deg
    WHERE recipient = '\xf6a78083ca3e2a662d6dd1703c939c8ace2e268d'
    UNION
    SELECT * FROM first_deg
    WHERE recipient IN (
        SELECT DISTINCT sender FROM second_deg_to_omni
        UNION
        SELECT DISTINCT sender FROM third_deg_to_omni
        UNION 
        SELECT DISTINCT sender FROM fourth_deg_to_omni
    )
), backward_tx_list AS ( --2641 rows
    SELECT * FROM first_deg_to_omni
    UNION
    SELECT * FROM second_deg_to_omni
    UNION
    SELECT * FROM third_deg_to_omni
    UNION            
    SELECT * FROM fourth_deg_to_omni
), unique_addresses_to_omni AS (-- 1296 unique addresses
    SELECT DISTINCT agents.sender FROM (
        SELECT sender FROM backward_tx_list
        UNION
        SELECT decode(list, 'hex') FROM (
            SELECT * FROM unnest(ARRAY[
            'f6a78083ca3e2a662d6dd1703c939c8ace2e268d' -- omni bridge on xDai chain
            ]) AS list
        ) AS bridge_list
    ) AS agents
/*), sankey_stage_1 AS (
    SELECT sender, 
        CASE WHEN sum > 0 THEN sum
        ELSE 0
        END AS stage1
    FROM unique_addresses_to_omni
    LEFT JOIN (
        SELECT address, sum(amount) FROM ( -- degree 0
            -- credits
            SELECT sender AS address, value AS amount
            from first_deg_to_omni
            UNION
            -- debits
            SELECT recipient AS address, -value AS amount
            from first_deg_to_omni
        ) AS double_entry_degree_0_details
        GROUP BY address
    ) double_entry_degree_0
    ON unique_addresses_to_omni.sender = double_entry_degree_0.address
    ORDER BY stage1 DESC
), sankey_stage_2 AS (
    SELECT sender, 
        CASE WHEN sum > 0 THEN sum
        ELSE 0
        END AS stage2
    FROM unique_addresses_to_omni
    LEFT JOIN (
        SELECT address, sum(amount) FROM ( -- degree 0
            -- credits
            SELECT sender AS address, value AS amount
            from second_deg_to_omni
            UNION
            -- debits
            SELECT recipient AS address, -value AS amount
            from second_deg_to_omni
        ) AS double_entry_degree_1_details
        GROUP BY address
    ) double_entry_degree_1
    ON unique_addresses_to_omni.sender = double_entry_degree_1.address
    ORDER BY stage2 DESC
*/
)

/*
-- get some presale accounts that received tokens from other presale accounts.
SELECT * FROM second_deg
WHERE recipient IN (
  SELECT DISTINCT recipient FROM first_deg
)
*/

-- shows all the transactions by degree 
SELECT sender AS source, recipient AS target, value FROM (
    SELECT * FROM first_deg
    UNION
    SELECT * FROM second_deg
    UNION
    SELECT * FROM third_deg
    UNION            
    SELECT * FROM fourth_deg
    UNION
    SELECT * FROM fifth_deg
) AS agents

/*
-- sybils? 
SELECT DISTINCT sender AS source FROM (
    SELECT * FROM first_deg
    UNION
    SELECT * FROM second_deg
    UNION
    SELECT * FROM third_deg
    UNION            
    SELECT * FROM fourth_deg
    UNION
    SELECT * FROM fifth_deg
) AS agents
WHERE recipient <> '\xf6a78083ca3e2a662d6dd1703c939c8ace2e268d' -- not to bridge.
*/
/* 
-- attemp to plot sankey diagram
SELECT sankey_stage_1.sender, stage1, stage2, 2 AS value FROM sankey_stage_1
LEFT JOIN sankey_stage_2
ON sankey_stage_1.sender = sankey_stage_2.sender
*/
