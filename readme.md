# UZH - Blockchain Programming

This repository contains the source code for the UZH course blockchain programming. In particular, it describes the steps how (a) a mining pool admin can setup a mining pool on the UZH Bitcoin network and (b) how individual miners can connect to the pool and start mining.

## Prerequisites

For local development and testing, we assume that you have a running UZH Bitcoin node. If not, please follow the official course guidelines on how to compile and run the UZH Bitcoin client.

## Requirements

Throghout this tutorial, we are going to use the following tools:

1. [eloipool](https://github.com/luke-jr/eloipool) - The Bitcoin mining pool server
2. [cpuminer](https://github.com/pooler/cpuminer) - A CPU mining client

## Mining Pool Setup

script to export snapshot of blocks, query using rpc
store transactions in database
webserver to query transactions
address based index
transactions for each address

goal: reindex existing database
foreach address, index transactions (coinbase addresses)

1. Create database

```sh
bash dump_chain.sh
```

2. Create (or start) container

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
source user.sql;

# to verify
select * from blocks limit 10;
```

\_good to know:

- `SHOW GLOBAL VARIABLES LIKE 'PORT';`
- exit
- SHOW VARIABLES LIKE "secure\*file_priv";

```

```
