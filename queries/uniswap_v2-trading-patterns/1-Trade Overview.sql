SELECT "block_time", extract(isodow FROM cast("block_time" as TIMESTAMP)) AS Weekday,
    "token_a_symbol", "token_b_symbol",
    "token_a_amount", "token_b_amount",
    "usd_amount"
    FROM dex."trades" 
    WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
    -- All records
    /*AND "block_time" > (SELECT "block_time" + '72 Hour'
                        FROM dex."trades" 
                        WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d' 
                        ORDER BY "block_time" ASC LIMIT 1)*/
    ORDER BY "block_time" DESC



