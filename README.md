# Squads V4 public UI

This repository contains the code for a source available Squads V4 user interface.

# Important Changes

Configuration on cookies has been disabled.

All parameters must be written in the souce code config/params.ts.

The orignal source code of squads offical github has bugs on spl-2022 token transaction. This code has fixed the bugs!

This project must work with a proxy of solana RPC api server, because the solana RPC server rejects the request from http://localhost:3000/ !!!

So we need a proxy server: can get the RPC request from localhost, and then submit the same RPC request to solana RPC server, get the response and then send it to localhost.

Solana RPC server will allow the client application to call the RPC api, but will reject all the requests from client's browsers(with host name localhost).

I write the proxy server by using python, may upload to github at a later time.

## Usage on local device

### Requirements

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [NodeJS](https://nodejs.org/en/download)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)

### Installation

First, clone this repository to a folder on your device.

```
git clone https://github.com/Squads-Protocol/squads-v4-public-ui.git .
```

Then, install the required dependencies and build the app.

```
yarn && yarn build
```

### Start app locally

```
yarn start
```

## Configuration

There are multiple configuration options available which are stored in the cookies of the application, but can also be set via the UI.

- RPC url

Default: https://api.mainnet-beta.solana.com

Cookie name: x-rpc-url

- Multisig address

Cookie name: x-multisig

- Vault Index

Cookie name: x-vault-index


Default Program ID: SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf

## Disclaimer

Use this code at your own risk. 

By using the provided code, you agree that the maintainer of this repository will not be help responsible for any type of issue that may have occured.
