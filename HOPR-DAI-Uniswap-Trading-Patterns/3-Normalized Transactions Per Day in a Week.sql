SELECT SUM("usd_amount") / COUNT(DISTINCT DATE(block_time)) AS AVG_Volume_Transactions, 
    COUNT(*) / COUNT(DISTINCT DATE(block_time)) AS AVG_Num_Transactions,
    extract(isodow FROM cast(block_time as TIMESTAMP)) AS Day
    FROM dex."trades" 
    WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
    --Exclude the first 72 hours
    AND "block_time" > (SELECT "block_time" + '72 Hour'
                        FROM dex."trades" 
                        WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d' 
                        ORDER BY "block_time" ASC LIMIT 1)    
    GROUP BY Day
