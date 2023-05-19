# UZH - Blockchain Programming

This repository contains the source code for the UZH course blockchain programming with the goal of building a Blockchain explorer. In particular, it describes the steps on how to parse block data from the UZH Bitcoin network and store it in a MySQL database, from which it can be be queried using a Node.js server and displayed in a web browser.

## Prerequisites

For local development and testing, we assume that you have a running UZH Bitcoin node. If not, please follow the official course guidelines on how to compile and run the UZH Bitcoin client.

Furthermore:

- Docker
- A somewhat recent version of Node.js (> 14)
- (Optional) Cargo to build Rust binaries

## Example Explorer

The block explorer we're building is inspired by https://github.com/janoside/btc-rpc-explorer. You can follow the installations instructions over there and then run it like so, assuming the node is running on port 7332 with username `user` and password `pass`:

```sh
btc-rpc-explorer --port 8080 --bitcoind-port 7332 -u user -w pass
```

## Project Goals

1. List the lastest blocks of the chain. Example: https://bitcoinexplorer.org/blocks
2. Click on height of block to get its transaction info. First, display the coinbase and then the other transactions. Example: https://bitcoinexplorer.org/block-height/790323
3. In this view, click on address to get all transactions for the address. Example: https://bitcoinexplorer.org/address/39bitUyBcUu3y3hRTtYprKbTp712t4ZWqK

# Setup

If you want to use the existing image that includes the SQL server, you can skip most of the setup:

1. Pull the image from https://drive.google.com/file/d/1DsuGMAHw7bJ3slW8XGrhotWZoZoAhmOU/view?usp=sharing
2. Navigate to the folder where the image named is located and run sequentially:

```sh
docker load < btcsql.tar
docker run --name=btcsql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pw -d btcsql
```

3. Start the Node.js server in the `server` folder (see later instructions)

For the full setup, proceed with the following steps.

## Exporting Chain Data

This step requires a synchronized

```sh
bash scripts/dump_chain.sh
```

## SQL Server Setup

1. Create (or start) container

```sh
docker run --name=btcsql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pw -d mysql/mysql-server:latest
```

```sh
docker start btcsql
```

3. Prepare MySQL for local data loading

```sh
docker exec -it btcsql mysql -uroot -p
```

Enter pw

```sh
SET GLOBAL local_infile=1;
exit # this will exit docker
```

4. Copy chain data to the container

```sh
bash copy_chain.sh
docker exec -it btcsql ls -l1 sql
```

5. Access container to load data and create user

```sh
docker exec -it btcsql bash
cd sql
mysql -uroot -p --local-infile=1
```

In mysql:

```sql
source schema.sql;
source views.sql;
source user.sql;

# to verify
select * from blocks limit 10;
```

# Webserver Setup

## API Routes

| Resource         | Path                | Description                | Example response                                                                                             |
| ---------------- | ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Block data       | `/blocks`           | General                    | [Sample JSON](client/mock-data/block.json)                                                                   |
| Transaction data | `/blocks/:height`   | Transaction data per block | [Sample JSON 1](client/mock-data/block.height.1.json), [Sample JSON 2](client/mock-data/block.height.2.json) |
| Address data     | `/address/:address` | Address history            | [Sample JSON 1](client/mock-data/address.1.json), [Sample JSON 2](client/mock-data/address.2.json)           |

## Filtering

Both `/address/:address` and `/blocks` support basic filtering and pagination. The following query parameters are supported:

- `limit` (int), `offset` (int), `sort` ("asc" or "desc")

Both endpoints have sensible defaults and do not support a limit > 100.

## Test Addresses (With Some History)

| Height | Transactions |
| ------ | ------------ |
| 51376  | 18           |
| 10571  | 6            |
| 14505  | 6            |
| 14513  | 4            |
| 17076  | 3            |
