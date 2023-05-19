import { RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import {
  transformBlock,
  transformBlocks,
  transformTransactions,
} from '../utils';
import {
  RawTransaction,
  RawTransactionInfo,
  WithTransactions,
} from '../types/transaction';

const getBlockCount = async (): Promise<number> => {
  const [rows] = await db
    .promise()
    .execute<RowDataPacket[]>('select count(*) as cnt from blocks');
  return rows[0]['cnt'];
};

type GetBlocksParams = {
  limit?: number;
  offset?: number;
  sort?: string;
};

export const getBlocks = async ({
  limit = 10,
  offset = 0,
  sort = 'desc',
}: GetBlocksParams): Promise<Block[]> => {
  let q = 'select * from blocks ';
  if (sort === 'asc' || sort === 'desc') {
    q += ` order by height ${sort}`;
  }
  if (limit > 0) {
    limit = Math.min(limit, 100);
    q += ` limit ${limit}`;
  }
  if (offset > 0) {
    q += ` offset ${offset}`;
  }

  const [rows] = await db.promise().execute<RawBlock[]>(q);
  return transformBlocks(rows);
};

type GetBlockParams = {
  height: number;
};

export const getBlock = async ({ height }: GetBlockParams): Promise<any> => {
  const bq = `select * from blocks where height = ${height}`;
  const [blocks] = await db.promise().execute<RawBlock[]>(bq);
  if (blocks.length === 0) {
    return [];
  }
  const block: any = transformBlock(blocks[0]);

  const tq = `
    with trans as (select t.hashBlock, t.txid, i.hashPrevOut, o.indexOut, o.value, o.address
      from transactions t
              join tx_in i on t.txid = i.txid
              join tx_out o on t.txid = o.txid)

  select t.hashBlock   as blockhash,
  t.txid        as curr_txid,
  t.address     as to_addr,
  t.value       as output_amount,
  t.indexOut    as to_idxout,
  t.hashPrevOut as prev_txid,
  null          as from_addr,
  0             as from_idxout,
  t.value       as input_amount
  from trans t,
  tx_out o
  where t.hashBlock = x'${block.hash}'
  and t.hashPrevOut = x'0000000000000000000000000000000000000000000000000000000000000000'
  union
  select t.hashBlock as blockhash,
  t.txid      as curr_txid,
  t.address   as to_addr,
  t.value     as output_amount,
  t.indexOut  as to_idxout,
  o.txid      as prev_txid,
  o.address   as from_addr,
  o.indexOut  as from_idxout,
  o.value     as input_amount
  from trans t,
  tx_out o
  where t.hashBlock = x'${block.hash}'
  and o.txid = t.hashPrevOut


  `;
  const [transactions] = await db.promise().execute<RawTransactionInfo[]>(tq);
  console.log(transactions);
  const { coinbase, tx } = transformTransactions(transactions);
  block.coinbase = coinbase;
  block.tx = tx;

  return [block];
};
