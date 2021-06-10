SELECT 
CASE WHEN labels.get(trader_a,'project') IS NULL THEN '{Other}'
            ELSE labels.get(trader_a,'project')
END AS platform
, COUNT(*)
FROM dex."trades"
WHERE project = 'Uniswap'
AND version = '2'
AND ((token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR') OR (token_a_symbol = 'DAI' AND token_b_symbol = 'HOPR'))
GROUP BY platform