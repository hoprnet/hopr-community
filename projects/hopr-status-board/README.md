# Hopr Status Board

## Introduction

Status Board is a dashboard app made in react. It shows the status of the nodes in the Hopr network.

## Gitpod Setup

The easiest way to launch StatusBoard and setup a cluster of HOPR nodes to start testing it is via [Gitpod.io](https://gitpod.io). It will automatically fetch and install all the required dependencies and spin up the needed services for you to start tweaking StatusBoard.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hoprnet/hopr-status-board)

Once the application launches in your browser set a `nodeHost` and press `enter`. You will see the nodes details in the dashboard.

You an also pass it as url params.

- **nodeHost**: Use `gp url` to get it. e.g. https://hoprnet-hoprstatusboard-9s40xydfvct.ws-us46.gitpod.io
- **securityToken**: Use `^^LOCAL-testing-123^^` as a development API Token.

## Local Setup

First you need to [setup a cluster of HOPR nodes](https://docs.hoprnet.org/developers/starting-local-cluster#local-setup)

This project requires [`node.js`](https://nodejs.org/en/), ideally `v14` onwards.

**Install dependencies**

```
npm install
```

**Start application**

```
npm run dev
```

See application running in `http://localhost:3000`

## Demo

https://user-images.githubusercontent.com/94027312/172292858-67b0c08c-a036-4aa7-a4b3-3471eb4347c8.mov
