With Hourly_Weekday AS(
SELECT  AVG("usd_amount") AS AVG_Volume_Transactions, 
        extract(hour FROM cast(block_time as TIMESTAMP)) AS Hour
        FROM( SELECT extract(isodow FROM cast(block_time as TIMESTAMP)) AS Day,
              "usd_amount",
              "block_time"
              FROM dex."trades" 
              WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
              --Exclude the first 72 hours
              AND "block_time" > (SELECT "block_time" + '72 Hour'
                        FROM dex."trades" 
                        WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d' 
                        ORDER BY "block_time" ASC LIMIT 1)
              AND extract(isodow FROM cast(block_time as TIMESTAMP)) in ('1', '2', '3', '4', '5')) Weekday
    GROUP BY Hour),

Hourly_Weekend AS(
SELECT  AVG("usd_amount") AS AVG_Volume_Transactions, 
        extract(hour FROM cast(block_time as TIMESTAMP)) AS Hour
        FROM( SELECT extract(isodow FROM cast(block_time as TIMESTAMP)) AS Day,
              "usd_amount",
              "block_time"
              FROM dex."trades" 
              WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
              --Exclude the first 72 hours
              AND "block_time" > (SELECT "block_time" + '72 Hour'
                        FROM dex."trades" 
                        WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d' 
                        ORDER BY "block_time" ASC LIMIT 1)
              AND extract(isodow FROM cast(block_time as TIMESTAMP)) in ('6', '7')) Weekend
    GROUP BY Hour),
    
Hourly_Day AS(
SELECT  AVG("usd_amount") AS AVG_Volume_Transactions, 
        extract(hour FROM cast(block_time as TIMESTAMP)) AS Hour
        FROM dex."trades"
        WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d'
        --Exclude the first 72 hours
        AND "block_time" > (SELECT "block_time" + '72 Hour'
                            FROM dex."trades" 
                            WHERE "exchange_contract_address" = '\x92c2fc5f306405eab0ff0958f6d85d7f8892cf4d' 
                            ORDER BY "block_time" ASC LIMIT 1)
    GROUP BY Hour)
    
SELECT Hourly_Weekday.AVG_Volume_Transactions AS Weekday, 
       Hourly_Weekend.AVG_Volume_Transactions AS Weekend, 
       Hourly_Day.AVG_Volume_Transactions AS Day, 
       Hourly_Weekday.Hour
FROM (Hourly_Weekday JOIN Hourly_Weekend ON Hourly_Weekday.Hour = Hourly_Weekend.Hour)
    JOIN Hourly_Day ON Hourly_Weekday.Hour = Hourly_Day.Hour