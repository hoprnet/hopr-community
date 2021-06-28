With In_Transactions AS (
SELECT "to" AS address,
       value,
       evt_block_time AS time,
       evt_block_number,
       row_number() over (partition by "to" order by evt_block_time ASC) as group_index 
FROM erc20."ERC20_evt_Transfer"
WHERE contract_address = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' -- HOPR
ORDER BY evt_block_time ASC
)

SELECT address, value, time, evt_block_number 
FROM In_Transactions 
WHERE group_index = 1 
AND address != '\x0000000000000000000000000000000000000000'
ORDER BY time ASC