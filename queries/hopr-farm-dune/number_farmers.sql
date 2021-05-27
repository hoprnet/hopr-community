/*
* HOPR Farm participants by period
*/

WITH open_farm AS (
    SELECT provider from  hopr."HoprFarm_evt_TokenAdded"
), close_farm AS (
    SELECT provider from  hopr."HoprFarm_evt_TokenRemoved"
), open_and_close_farm AS (
    SELECT provider FROM open_farm
    UNION
    SELECT provider FROM close_farm
)

SELECT count(DISTINCT provider) FROM open_and_close_farm