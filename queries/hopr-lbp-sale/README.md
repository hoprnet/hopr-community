# HOPR Sale on LBP

This repo saves queries used in the DuneAnalytics dashboard: ["LBP-sale"](https://duneanalytics.com/qyuqianchen/lbp-sale), which provide insights for ["The HOPR Sale on LBP: Analytics and Reflections" blog post](https://medium.com/hoprnet/the-hopr-sale-on-lbp-8bed992d058c).

# Queries
1. [LBP spot price/volume](https://duneanalytics.com/queries/22754/47099): Spot token price, weighted average price, and hourly volume of HOPR token during the public distribution on Balancer LBP.
2. [Cost on calling "pokeWeights"](https://duneanalytics.com/queries/23187/48079): Distribution of gas cost spent on calling `pokeWeights` function during Balancer LBP.
3. [Effective gain over entire LBP](https://duneanalytics.com/queries/23630/48992): The scattered chart above illustrates the profit and loss of LBP traders. Dots above the 45° line represent cases where effective sell price was greater than effective buy price, so the trader made a profit. Bubbles below the line represent accounts that made a loss. These effective prices consider gas costs. 
4. [Failed LBP transactions with EVM error messages](https://duneanalytics.com/queries/23217/48149): A table of error messages for all the failed transctions during LBP.
5. [Gas cost associated with failed/successful swap transaction in LBP](https://duneanalytics.com/queries/23228/48169): Total gas cost associated with all the failed and successful swap transactions in LBP.
6. [HOPR token flow across bridge ("+" to xDai and "-" to mainnet)](https://duneanalytics.com/queries/23015/47647): Amount of HOPR tokens being transferred through OmniBridge.
7. [Change of recipient over bridge](https://duneanalytics.com/queries/23018/47649): Accounts whose tokens have switched hands over OmniBridge.
8. [Balance of presale contract](https://duneanalytics.com/queries/22959/47533): A waterfall that shows the change of balance of presale contract over time.
9. [xHOPR transfer by degree](https://duneanalytics.com/queries/22978/47560): A table that shows xHOPR transfers by degree.