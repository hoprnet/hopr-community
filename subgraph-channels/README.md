# Subgraph for HoprChannels


## How to run
### Run local network
First, make sure you are running [hoprnet/hoprnet](https://github.com/hoprnet/hoprnet)
local network via `yarn run:network`. Update your `.env` with your network address,
likely `http://localhost:8545` within your workstation, or a public URL like
`https://8545-amber-cod-wcakvqd8.ws-eu11.gitpod.io/` if you are using Gitpod.

### Update graph configuration for local use

Run `yarn prepare-local` so your `sugraph.yaml` is automatically generated for local
use with the adequate configuration.

### Start Subgraph node via docker-compose

Since a subgraph relies on an IPFS daemon and a PostgreSQL database to run, we will
now run `docker-compose up` to kickstar the adequate services. This data will be stored
locally under your `./data` folder. If you find any errors, you can always `rm -rf data`
to restart the bootstrap process and interact with the ethereum network. This is likely
in the case of long running nodes.

### Create subgraph configuration in local node

`yarn create-local`