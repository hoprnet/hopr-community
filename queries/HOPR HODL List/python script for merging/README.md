# Python Script
1. [main net hodl list](https://duneanalytics.com/queries/66536) and [xDai hodl list](https://duneanalytics.com/queries/66627) are merged together. If an account is on both lists (so it received both HOPR and xHOPR), we use only the earlier one. This is what we call the hodl list.
2. [main net outgoing transfers ](https://duneanalytics.com/queries/70345)and [xDai outgoing transfers](https://duneanalytics.com/queries/67670) are merged together. Here we add them all to get the total value of outgoing transfers. And we record the time and the block number of the last transfer. This is what we call the withdrawl list.
3. We substract the withdrawl value from the starting balance of each account, and update the last time and block number.
