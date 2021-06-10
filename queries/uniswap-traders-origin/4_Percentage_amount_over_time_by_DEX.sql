WITH totalCount AS (
    SELECT 
    date_trunc('day', block_time) as day,
    SUM(token_a_amount) as total
    FROM dex."trades"
    WHERE project = 'Uniswap'
    AND version = '2'
    AND ((token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR') OR (token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR'))
    GROUP BY date_trunc('day', block_time) 
)

SELECT 
CASE WHEN labels.get(trader_a,'project') IS NULL THEN '{Other}'
            ELSE labels.get(trader_a,'project')
END AS platform,
date_trunc('day', block_time) as day,
(SUM(token_a_amount)/totalCount.total::float)*100 as percentage
FROM dex."trades" AS trades
LEFT JOIN totalCount 
ON totalCount.day = date_trunc('day', block_time)
WHERE project = 'Uniswap'
AND version = '2'
AND ((token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR') OR (token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR'))
GROUP BY platform, date_trunc('day', block_time), totalCount.total