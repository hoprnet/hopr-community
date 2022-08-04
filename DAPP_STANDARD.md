# Introduction

One ways we can improve and grow the HOPR ecosystem is to ensure that dApps running on HOPR have a standarized way of running.
This is especially important if you would like to make your dApp compatible with [playground](https://github.com/hoprnet/playground) or be part of [hopr-community](https://github.com/hoprnet/hopr-community).

### Endpoint Configuration

HOPR dApps need to connect to [HOPRd API](https://docs.hoprnet.org/developers/rest-api) in order to interact with HOPR.
It's ideal to be able to specify the endpoint URL and token via URL parameters (query strings).

For example: `http://localhost:3000/?apiEndpoint=http://localhost:3001&apiToken=^^LOCAL-testing-123^^`

| Target  | Query |
| ------------- | ------------- |
| API endpoint URL  | apiEndpoint  |
| API authentication token  | apiToken  |

### README.md

A `README.md` page must be included that includes:

- introduction to dApp
- short technical explanation
- DEMO showcase (short video of it working)

### Other

- the dApp must use API `v2` of HOPRd
- building dApp with environment CI=true should build successfully
- package.json should specify the node.js version the dApp was tested on
