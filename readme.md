# UZH - Blockchain Programming

This repository contains the source code for the UZH course blockchain programming. In particular, it describes the steps how (a) a mining pool admin can setup a mining pool on the UZH Bitcoin network and (b) how individual miners can connect to the pool and start mining.

## Prerequisites

For local development and testing, we assume that you have a running UZH Bitcoin node. If not, please follow the official course guidelines on how to compile and run the UZH Bitcoin client.

## TODO / Goal

1. list of lastest blocks --> /blocks (https://bitcoinexplorer.org/blocks)
2. click on height of block to get transaction info --> /blocks/height (https://bitcoinexplorer.org/block-height/790323)

- first transaction is coinbase transaction
- other transactions in the block

3. click on address to get all transactions for address --> /address (https://bitcoinexplorer.org/address/39bitUyBcUu3y3hRTtYprKbTp712t4ZWqK)

By instructors:
script to export snapshot of blocks, query using rpc
store transactions in database
webserver to query transactions
address based index
transactions for each address

goal: reindex existing database
foreach address, index transactions (coinbase addresses)

Our inspiration: [rpc-block-explorer](https://github.com/janoside/btc-rpc-explorer). In order to run locally with our Bitcoin config:

```sh
btc-rpc-explorer --port 8080 --bitcoind-port 7332 -u user -w pass
```

# Exporting Chain Data

```sh
bash scripts/dump_chain.sh
```

# SQL Server Setup

## Using An Existing Image

Note: If you want to use the existing image that includes the SQL server, do the following:

1. Pull the image from https://drive.google.com/file/d/1DsuGMAHw7bJ3slW8XGrhotWZoZoAhmOU/view?usp=sharing
2. Navigate to the folder where the image named is located and run sequentially:

```sh
docker load < btcsql.tar
docker run --name=btcsql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pw -d btcsql
```

3. Start the Node.js server in the `server` folder

## Full Setup

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
