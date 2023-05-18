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

docker run --name=btcsql -p 3306:3306 -d mysql/mysql-server:latest
(docker start btcsql)
docker logs btcsql
docker logs btcsql 2>&1 | grep GENERATED

docker exec -it btcsql mysql -uroot -p
enter pw (#m0^g32Yqp8&//,%9ygd_Jep7O7jT7eu)

\_in mysql:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'pw';
SET GLOBAL local_infile=1;
exit (goes back out of docker)

\_acces bash

docker exec -it btcsql bash
mysql -uroot -p

SHOW VARIABLES LIKE "secure\*file_priv";
docker cp /mnt/c/github/uzh-blockchain/data btcsql:/sql
docker cp /mnt/c/github/uzh-blockchain/sql/schema.sql btcsql:/sql
\_verify
ls -l1 sql

\_in bash
cd sql
mysql -uroot -p --local-infile=1
source schema.sql;

select user from mysql.user;
CREATE USER 'usr'@'localhost' IDENTIFIED BY 'pw';
GRANT SELECT ON btc_blockchain.\* TO 'usr'@'localhost';

SHOW GLOBAL VARIABLES LIKE 'PORT';

\_good to know:
exit
