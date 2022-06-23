# Subgraph for HoprChannels


## How to run

Here's the _tl;dr_ version:

```bash
// Using hoprnet/hoprnet
$ yarn run:network
// Inside this repo
$ pbpaste | xargs -I {} echo "ETHEREUM_NETWORK=localhost\nETHEREUM_ENDPOINT={}" > .env
$ yarn prepare-local
$ yarn codegen
$ yarn pre-build
$ yarn build
$ docker-compose up
$ yarn create-local
$ yarn deploy-local
// Back to hoprnet/hoprnet
$ DEBUG=hopr* yarn run:hoprd:alice
$ yarn run:faucet:alice
```
### 1. Run local network
First, make sure you are running [hoprnet/hoprnet](https://github.com/hoprnet/hoprnet)
local network via `yarn run:network`. Update your `.env` with your network address,
likely `http://localhost:8545` within your workstation, or a public URL like
`https://8545-amber-cod-wcakvqd8.ws-eu11.gitpod.io/` if you are using Gitpod.

### 2. Update graph configuration for local use

Run `yarn prepare-local` so your `subgraph.yaml` is automatically generated for local
use with the adequate configuration.

### 3. Generate the graph web assembly code

Run `yarn codegen` which will parse your `subgraph.yaml` file
into types ready to be imported for your `mappings.ts`. You
are now ready to modify your `mappings.ts` as needed based on
the handlers you described previously in your graph.

### 4. Build your project mappings into wasm

Run `yarn build`, which will compile everything for the
`graph-node` to use in `wasm` format. Any AssemblyScript
errors will be shown there.

### 5. Start Subgraph node via docker-compose

Since a subgraph relies on an IPFS daemon and a PostgreSQL database to run, we
will now run `docker-compose up` to kickstart the adequate services. This data
will be stored locally under your `./data` folder.

If you find any errors, you can always `rm -rf data` to restart the bootstrap
process and interact with the ethereum network. This is likely in the case of
long running nodes.

### 6. Create subgraph configuration in local node

Run `yarn create-local` to deploy your subgraph configuration to the local
graph node, which should be shown in your logs.

### 7. Deploy your subgraph configuraiton

Run `yarn deploy-local` to deploy your actual subgraph mappings code to the
local graph node, which will start fetching events from your network. You will
see a URL available under `${url}/subgraphs/name/hoprnet/hopr-channels/graphql`

### 8. Interact with your network to allow event fetching

From the `hoprnet/hoprnet` project, start running nodes in the network to see
events showing up in your query indexer. Go to your GraphQLi instance to start
interacting with your GraphQL endpoint via queries.