With In_Transactions AS (
    SELECT "to" AS address,
           value,
           evt_block_time AS time,
           evt_block_number,
           row_number() over (partition by "to" order by evt_block_time ASC) as group_index 
    FROM erc20."ERC20_evt_Transfer"
    WHERE contract_address = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da' -- HOPR
    ORDER BY evt_block_time ASC
),
--"to" is the receipt; use row_number() as index so that we can get the earliest transaction

HODL_List AS(
    SELECT address, value, time, evt_block_number
    FROM In_Transactions 
    WHERE group_index = 1 
    AND address != '\x0000000000000000000000000000000000000000'
    ORDER BY time ASC),
--get the earliest one    
    
Out_Transactions AS(
    SELECT transfer."from" AS address, 
           transfer."value" * (-1) AS value, 
           transfer."evt_block_time" AS time,
           transfer."evt_block_number" AS evt_block_number
    FROM erc20."ERC20_evt_Transfer" AS transfer 
    JOIN HODL_List ON transfer."from" = HODL_List.address
    WHERE contract_address = '\xf5581dfefd8fb0e4aec526be659cfab1f8c781da'
    AND transfer."from" != '\x0000000000000000000000000000000000000000'),
--get the outgoing transfers for those account in initial hodl_list; take the minus of them

SUM_Transactions AS(
    SELECT address, value, time, evt_block_number FROM In_Transactions
    UNION 
    SELECT address, value, time, evt_block_number FROM Out_Transactions),

Out_Number AS (
    SELECT address, value, time, evt_block_number,
           row_number() over (partition by address order by time DESC) as group_index
    FROM Out_Transactions),
--use row_number() to get the latest time for outgoing transaction, which is also the time for final balance

Get_Lastday AS(
    SELECT address, value, time, evt_block_number
    FROM Out_Number
    WHERE group_index = 1
),
--get the latest time 

Get_sum_out AS(
    SELECT address, SUM(value) AS sum_out
    FROM Out_Number
    GROUP BY address)
--get the sum value of outgoing transfers (<0)

SELECT Get_sum_out.address AS address, Get_sum_out.sum_out AS value, Get_Lastday.time AS time,
Get_Lastday.evt_block_number AS evt_block_number
FROM Get_sum_out 
JOIN Get_Lastday ON Get_sum_out.address = Get_Lastday.address
--JOIN two tables with address, get both sum value and the latest time
ORDER BY time ASC


    
