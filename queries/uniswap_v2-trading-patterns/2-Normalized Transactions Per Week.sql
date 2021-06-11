SELECT EXTRACT(WEEK FROM block_time) AS Week,
    SUM("usd_amount") AS Volume_Transactions,
    COUNT(*) AS Num_Transactions
    FROM dex."trades" 
    WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
    GROUP BY Week
    ORDER BY Week ASC

