# UZH - Blockchain Programming

This repository contains the source code for the UZH course blockchain programming with the goal of building a Blockchain explorer. In particular, it describes the steps on how to parse block data from the UZH Bitcoin network and store it in a MySQL database, from which it can be be queried using a Node.js server and displayed in a web browser.

## Prerequisites

For local development and testing, we assume that you have a running UZH Bitcoin node. If not, please follow the official course guidelines on how to compile and run the UZH Bitcoin client.

Furthermore:

- Docker
- (Optional) Node.js >= 16
- (Optional) Cargo to build Rust binaries

Initial setup:

```sh
git clone https://github.com/eegli/bitcoin
git submodule init
git submodule update
```

## Example Explorer

The block explorer we're building is inspired by https://github.com/janoside/btc-rpc-explorer. You can follow the installations instructions over there and then run it like so, assuming the Bitcoin node is running on port 7332 with username `user` and password `pass`:

```sh
btc-rpc-explorer \
   --port 8080 \
   --bitcoind-port 7332 \
   -u user -w pass
```

## Block Explorer Goals

1. List the lastest blocks of the chain. Example: https://bitcoinexplorer.org/blocks
2. Click on height of block to get its transaction info. First, display the coinbase and then the other transactions. Example: https://bitcoinexplorer.org/block-height/790323
3. In this view, click on address to get all transactions for the address. Example: https://bitcoinexplorer.org/address/39bitUyBcUu3y3hRTtYprKbTp712t4ZWqK

# Setup

There are three ways to run this project:

1. [All-in-one (Docker)](#all-in-one-docker-setup) [_recommended_]
2. [Pre-built database](#pre-built-database-setup)
3. [Manually](#manual-setup)

## All-In-One Docker Setup

This allows you to run everything (MySQL DB, REST API, FE client) at once using a multi-container setup with Docker Compose.

In the root directory, run:

```sh
docker-compose up
```

With the default environment variables (in `.env`), this will:

1. Start a MySQL server on port 3306 with the block data
2. Start a Node.js REST API on port 8000
3. Start a Vue client on port 3000

All three ports are exposed to the host machine, so you can access them directly. The database user credentials and table name can be seen in the environment variables file (`.env`). Using any MySQL client, you can connect to the database, play with the API at, e.g., [`http://localhost:8000/blocks`](http://localhost:8000/blocks) and access the client at [`http://localhost:3000`](http://localhost:3000).

## Pre-Built Database Setup

This setup is especially useful for development since the database is static (no updates atm) but the API and client are not (during development).

If you want to use the existing image that includes **only** the MySQL database, populated with block data, you can still skip most of the setup and pull/run the pre-built Docker image directly:

```sh
docker run --name=btcsql \
   -p 3306:3306 \
   -d eegli/btcsql:0.0.2
```

Note that only running only the database will require you to compile and run the API and FE client locally using Node.js. Once the database is running, you can skip to the [Webserver Setup](#webserver-setup) and [Client Setup](#client-setup) sections.

## Manual Setup

For the full setup from scratch, proceed with the following steps.

## Exporting Chain Data

This step requires a synchronized UZH Bitcoin node. If you don't have one, you can skip this step and use the parsed csv data in `blocks/parsed` directly in the next step.

Otherwise, this step further requires Cargo to build the Rust binary that parses the block data.

1. Copy the `blocks` directory from the UZH Bitcoin node to the `blocks/raw` folder
2. From the root of this repository, run:

```sh
cd blockparser

cargo build --release

./target/release/rusty-blockparser \
   --blockchain-dir ../blocks/raw \
   csvdump ../blocks/parsed
```

This will output block data in CSV format into the `blocks/parsed` folder.

## SQL Server Setup

In the next section, we will use the mysql docker image to setup a local SQL server. This is not required if you want to use the existing image.

1. Create the container:

   ```sh
   docker run --name=btcsql -p 3306:3306 \
      -e MYSQL_ROOT_PASSWORD=pw
      -d mysql/mysql-server:latest
   ```

   If you've already created the container, you can start it with:

   ```sh
   docker start btcsql
   ```

2. Prepare MySQL for local data loading

   We need to bypass the default security settings of MySQL to allow local data loading.

   ```sh
   docker exec -it btcsql mysql -uroot -p
   ```

   Enter the password ("pw")

   ```sh
   SET GLOBAL local_infile=1;
   exit
   ```

   You should now be back in your terminal.

3. Copy chain data to the container

   Do this from the root folder of this repository.

   ```sh
   docker cp blocks/parsed/. btcsql:/sql
   docker cp blockparser/sql/. btcsql:/sql
   docker exec -it btcsql ls -l1 sql
   ```

   You should now see the csv along with some sql files.

4. Access container to load data and create user

   ```sh
   docker exec -it btcsql bash
   cd sql
   mysql -uroot -p --local-infile=1
   ```

   Now, in the mysql shell, we create the schema, views and user to access the data:

   ```sql
   source schema.sql;
   source views.sql;
   source user.sql;
   ```

   In order to verify that everything has been loaded, you can run the following query:

   ```sql
   select * from blocks limit 10;
   ```

## Webserver Setup

The webserver is a simple Node.js Express server. It requires a running MySQL server with the block data.

### Installation

```sh
cd server && npm install
```

To start the server (in the `server` directory):

```sh
npm run dev
```

### API Routes

| Resource         | Path                | Description                | Example response                                                                        |
| ---------------- | ------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| Block data       | `/blocks`           | General                    | [Sample JSON](client/mock-data/blocks.json)                                             |
| Transaction data | `/blocks/:height`   | Transaction data per block | [Sample JSON](client/mock-data/blocks/77487.json)                                       |
| Address data     | `/address/:address` | Address history            | [Sample JSON](client/mock-data/address/bc1qyqqlm0t2y2kguyle8efadrxvqe2hsedc7s8kep.json) |

### Filtering

Both `/address/:address` and `/blocks` support basic filtering and pagination. The following query parameters are supported:

- `limit` (int) [how many items to fetch]
- `offset` (int) [how many items to skip]
- `sort` ("asc" or "desc") [sort order]

Both endpoints have sensible defaults (`asc` sort, limit `30`, offset `0`) and do not support a limit > 100.

In addition, `/address/:address` supports the following two query parameters:

- `role` ("sender" or "receiver") [filter by transaction role for this address]
- `no_coinbase` (boolean) [exclude coinbase transactions]

As of now, there's no pagination for the transactions of a block (`/blocks/:height`). For the UZH blockchain, this is not an issue since the blocks are rather small (all less than 18 transactions) but a real implementation would need to account for this.

### Testing

Since the UZH blockchain is rather sparse in terms of transactions, the following (rich) blocks can be used to test the API:

| Height | Transaction count   |
| ------ | ------------------- |
| 51376  | 18                  |
| 10571  | 6                   |
| 14505  | 6                   |
| 14513  | 4                   |
| 17076  | 3                   |
| 10600  | 2 (multiple inputs) |

Along with the following addresses:

- `bc1q39waylre62fwrnff7n637c9yyh0jdaealr9d3g`
- `bc1q9ef0gsfjwy0cllfvxrtnc0w9j6sxvakjtekmjk`
- `bc1qdfvx7x0d4hxmwsndr4xvykv08exlfdz05lgz34qggl`
- `bc1qzf5tqh0kaqnv4859k28axyqlc7j57z5ngshzua`
- `bc1quwf6mgkug469jgzm8flrz39c7d3uqr6wseuh6w`

E.g., with a running server (and Python installed for pretty-printing):

```sh
# get the latest block
curl -G http://localhost:8000/blocks/latest | python -mjson.tool

# get the genesis block
curl -G http://localhost:8000/blocks \
   -d 'limit=1' -d 'sort=asc' | python -mjson.tool

# get the block with height 51376
curl -G http://localhost:8000/blocks/51376 | python -mjson.tool

# get latest 5 transactions for an addres and balance info
curl -G http://localhost:8000/address/bc1q9ef0gsfjwy0cllfvxrtnc0w9j6sxvakjtekmjk \
   -d 'limit=5' -d 'sort=desc' \
   | python -mjson.tool
```

## Client Setup
This setup is help to build and initialize a vue3 framewoork and open our website on your computer.
## Frontend Framework
Vue3: An approachable, performant and versatile framework for building web user interfaces.
## Prerequisites
- Node.js version 16.0 or later installed
- "dependencies": {
      "axios": "^1.4.0",
      "element-plus": "^2.3.5",
      "swiper": "^8.1.6",
      "vue": "^3.3.2",
      "vue-router": "^4.2.1",
      "vue-loading-overlay"
   }

  ```sh
  npm install -save packagename
  ```

## Explorer Setup
```sh
cd explorer \
npm install \ 
npm run dev
```
Then copy the web link to any explorer. Usually it is http://localhost:5173/. 

The configuration is necessary when making cross-origin requests from a web application to a server, add the below code in server route files:
```sh
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```
## Description of Folder Contents
- /public: store test data.
- /src/api: store router and address, handle system corresponding.
- /src/assets: store open source resource(existing when download)
- /src/components: store main father webpages.
- /src/pages: store child pages, the components of father pages.
- /App.vue: the root component.
- /main.js: is responsible for initializing the Vue application and mounting it to the DOM.
