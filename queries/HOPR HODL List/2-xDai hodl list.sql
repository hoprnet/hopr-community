With In_Transactions AS (
SELECT "to" AS address,
        value,
        evt_block_time AS time,
        evt_block_number,
        row_number() over (partition by "to" order by evt_block_time ASC) as group_index 
FROM erc20."ERC20_evt_Transfer"
WHERE contract_address = '\xD057604A14982FE8D88c5fC25Aac3267eA142a08' -- xHOPR
ORDER BY evt_block_time ASC
)

SELECT address, value, time, evt_block_number 
FROM In_Transactions 
WHERE group_index = 1
ORDER BY time ASC
