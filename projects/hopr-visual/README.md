# React Hopr Visualizer based on Sigma.js
## Aim of this project
Provide a visual representation of the Hopr Network and allow developers to easily draw a local cluster
## Methodology
We can divide the application in 2 parts, as prescribed by `Sigma.js` documentation:
- Dataset building
- Graphical representation of the dataset

The latter is taken care by Sigma.js so we only needed to implement the logic to compute nodes and edges of the network.
We divided this logic in two sections:
- `TheGraph` dataset
- `Local Cluster` dataset

For the first, having to deal with thousands of nodes and edges, we decided to leave all the computation to `TheGraph` which provides us with the computed Hopr Accounts and Channels, properly filtered (we only take nodes that have > 1 edge) and included of all the necessary information (addresses, balances, ...). The implementation of this part can be found on https://github.com/eliaxie/hopr-community.

In `local clusters`, dealing with a much smaller volume, we could tackle the problem directly. In this case, we apply an iterative approach where we ask the user for the `endpoint`  and `token` of one node of the cluster and via [Hopr REST APIs](https://docs.hoprnet.org/developers/rest-api) we make a series of calls to the local node and all the peers connected, trying to find all the announced nodes of the network. Once we have all the nodes, we ask each node for its balance informations and all the outgoing channels. At this point, the only thing remaining is to connect the nodes together and give the dataset to the graph engine to be drawn on the screen.

You can use `?mode=api` to load directly into `local cluster` mode

## Usage
Opening the page will show the composition of the Hopr Network, from there you can use the search bar to focus on one particular node or hover a node to show the address and the balances of its channels. By clicking on it, you will open Blockscout on its address.\
Clicking on the last button on the left, you'll go in local cluster mode, there you'll be able to input a node address (in the format IP:PORT or localhost:PORT or PORT-hoprnet-[..].gitpod.io) and the cluster's token. By then pressing Enter the graph will be drawn on the screen.
### Video Demo: https://www.dropbox.com/s/rfnaum3tppiyg87/Hopr%20Visual.mkv?dl=0


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
