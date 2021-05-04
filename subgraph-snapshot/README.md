# Subgraph for HOPR balance on xDAI chain

## Deploy
A test subgraph is deployed at https://thegraph.com/explorer/subgraph/qyuqianchen/presale
The product subgraph will be deployed under `hoprnet`

## Query
A sample query of getting the xHOPR + wxHOPR balance at a given block is:
```
{
  accountSnapshots(first: 1, orderBy: blockNumber, orderDirection: desc, where: {account: "0x000000359d837dbc86ffcb8be6057062bf1fc1ff", blockNumber_lte: 14874135}) {
    id
    account {
      id
    }
    xHoprBalance
    wxHoprBalance
    totalBalance
    blockNumber
  }
}
```