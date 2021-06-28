# HOPR HODL List

This repo saves queries and python script used for HOPR HODL List.

# Queries

Please choose the right chain for query.

1. [main net hodl list](https://duneanalytics.com/queries/66536):  all accounts that ever got HOPR tokens onto their balance (for each address, only the first transaction is considered) - it's the hodl list
2. [xDai hodl list](https://duneanalytics.com/queries/66627): all accounts that ever got xHOPR tokens onto their balance
3. [main net outgoing transfers](https://duneanalytics.com/queries/70345): sum of all the HOPR outgoing transfers of each account in the hodl list (for each address, we get the sum value of outgoing transfers to calculate its balance; the time and the block number of the last transfer is also recorded)
4. [xDai outgoing transfers](https://duneanalytics.com/queries/67670): sum of all the HOPR outgoing transfers of each account in the hodl list



Unfortunately, in DuneAnalytics we cannot perform cross-chain queries. So we have to export the four data sheets above and merge them in Python to get the final result. Please have a look at the folder "python script for merging" of this process.