SELECT eth.day,
   openFarm.count "Farm Opened", openFarm.amount "Open amount",
   0 - closeFarm.count "Farm Closed", closeFarm.amount "Closed amount" FROM (
SELECT date_trunc('day', evt_block_time) as day, COUNT(*) as count
FROM ethereumnameservice.view_registrations WHERE evt_block_time BETWEEN (now() - interval '60 days') AND date_trunc('day', now())
GROUP BY 1
) as eth
LEFT JOIN 
(
    SELECT date_trunc('day', evt_block_time) as day, COUNT(*) as count, sum(amount)/1e18 as amount
    FROM hopr."HoprFarm_evt_TokenAdded" WHERE evt_block_time > now() - interval '60 days'
    GROUP BY 1
) as openFarm ON eth.day = openFarm.day
LEFT JOIN(
    SELECT date_trunc('day', evt_block_time) as day, COUNT(*) as count, 0-sum(amount)/1e18 as amount
    FROM hopr."HoprFarm_evt_TokenRemoved" WHERE evt_block_time > now() - interval '60 days'
    GROUP BY 1
) as closeFarm ON eth.day = closeFarm.day
ORDER BY 1 DESC
