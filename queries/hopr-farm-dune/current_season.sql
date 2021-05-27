WITH current_block AS (
    SELECT blocks."number" AS latest FROM ethereum."blocks" AS blocks
    ORDER BY blocks."number" DESC
    LIMIT 1
)

SELECT CASE 
    WHEN latest<=12141500 THEN cast(0 AS varchar)
    WHEN latest>12141500+44800*13 THEN 'Ended'
    ELSE cast(CEILING((latest-12141500)/44800) AS varchar)
    END AS count_down
FROM current_block