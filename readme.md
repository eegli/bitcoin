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

cargo build --release

make sure target exists
./target/release/rusty-blockparser --blockchain-dir ~/.uzhbitcoin/blocks csvdump /mnt/c/github/uzh-blockchain/data

rename files

docker run --name=btcsql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pw -d mysql/mysql-server:latest
docker start btcsql

docker exec -it btcsql mysql -uroot -p
enter "pw"

\_in mysql:
SET GLOBAL local_infile=1;
exit (goes back out of docker)

\second terminal window in this directory

`docker cp data/. btcsql:/sql`
`docker cp blockparser/sql/. btcsql:/sql`

\_verify and access bash
docker exec -it btcsql bash
ls -l1 sql

\_in bash
cd sql
mysql -uroot -p --local-infile=1
source schema.sql;
source user.sql;
`select * from blocks limit 10;` (to verify)

\_good to know:

- `SHOW GLOBAL VARIABLES LIKE 'PORT';`
- exit
- SHOW VARIABLES LIKE "secure\*file_priv";
