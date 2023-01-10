# Subgraph for HoprToken on Mainnet

## Installation
```sh
yarn
```

## Build

```sh
yarn codegen
yarn build
```

## Deployment
### Decentralized network

Create a subgraph on [TheGraph's subgraph studio](https://thegraph.com/studio/). 

Take the "subgraph slug" and "deploy key" and save them as environment variables:
```sh
export DEPLOY_KEY=<deploy key>
export SUBGRAPH_SLUG=<subgraph slug>
```

Authenticate and deploy to studio
```sh
yarn auth && yarn deploy:studio
```

Test the deployed subgraph [on the playground](https://thegraph.com/studio/subgraph/hopr-token-on-mainnet/playground). 
A development query URL can be found on the dashboard.

After thorough tests, hit the "Publish" button on the studio UI to deploy the subgraph to production.

### Hosted service (deprecated)
Get an access token from the hosted service dashboard
```sh
export ACCESS_TOKEN=<access token>
yarn deploy:hosted-prod
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/hopr-on-mainnet

Query to https://api.thegraph.com/subgraphs/name/hoprnet/hopr-on-mainnet
