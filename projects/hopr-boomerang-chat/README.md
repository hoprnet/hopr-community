<!-- INTRODUCTION -->
<p align="center">
  <a href="https://hoprnet.org" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://github.com/hoprnet/hopr-assets/blob/master/v1/logo/hopr_logo_padded.png?raw=true" alt="HOPR Logo">
  </a>
  
  <!-- Title Placeholder -->
  <h3 align="center">HOPR BoomerangChat</h3>
  <p align="center">
    <code>A project by the HOPR Association</code>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod" alt="Gitpod">
  </p>
</p>





## Introduction

Boomerang Chat is a simple app which sends a message to the HOPR Network which then returns it to the sender. Because nodes in the network have no idea who sent the message and who’s the final recipient, a node can always send a message to itself and no other node would be any the wiser. HOPR nodes only know who to forward the message to next.


## Gitpod Setup

The easiest way to launch BoomerangChat and setup a cluster of HOPR nodes to start testing it is via [Gitpod.io](https://gitpod.io). It will automatically fetch and install all the required dependencies and spin up the needed services for you to start tweaking BoomerangChat.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/hoprnet/hopr-boomerang-chat)


Once the application launches in your browser set the params and send a boomerang message:
- Run `gp url 13301` in order to get an Hoprd API endpoint.
- Use `^^LOCAL-testing-123^^` as a development API Token.



## Local Setup

First you need to [setup a cluster of HOPR nodes](https://docs.hoprnet.org/developers/starting-local-cluster#local-setup)

This project requires [`node.js`](https://nodejs.org/en/), ideally `v14` onwards.

**Install dependencies**

```
npm install
```

**Build application**

```
npm run build
```

**Start application**

```
npm run start
```

See application running in `http://localhost:8080`

## Demo

https://user-images.githubusercontent.com/94027312/171310118-ef23bb7b-cd45-4227-95dc-c75714c1ae43.mov


