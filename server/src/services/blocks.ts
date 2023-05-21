import { RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import { transformTransactions } from '../utils';
import { BlockTransactionData, RawTransactionInfo } from '../types/transaction';

// Maybe TODO
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
  let q = `
  select b.id,
    hex(hash) hash,
    height,
    b.version,
    blocksize,
    hex(hashPrev) hashPrev,
    hex(hashMerkleRoot) hashMerkleRoot,
    count(t.txid) txCnt,
    nTime,
    nBits,
    nNonce
  from blocks b left outer join transactions t on b.hash = t.hashBlock
  group by hash
`;
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
  return rows;
};

type GetBlockParams = {
  height: number;
};

export const getBlock = async ({
  height,
}: GetBlockParams): Promise<(Block & BlockTransactionData)[]> => {
  const bq = `
  select id,
    hex(hash) hash,
    height,
    version,
    blocksize,
    hex(hashPrev) hashPrev,
    hex(hashMerkleRoot) hashMerkleRoot,
    nTime,
    nBits,
    nNonce
  from blocks
  where height = ${height}
  `;
  const [blocks] = await db.promise().execute<RawBlock[]>(bq);
  if (blocks.length === 0) {
    return [];
  }
  const block = blocks[0];
  const tq = `
  with trans as (select t.hashBlock, t.txid, i.hashPrevOut, o.indexOut, o.value, o.address
    from transactions t
             join tx_in i on t.txid = i.txid
             join tx_out o on t.txid = o.txid)

  select hex(t.hashBlock)                     as block_hash,
  hex(t.txid)                                 as curr_txid,
  t.address                                   as to_addr,
  cast(t.value / 100000000 AS DECIMAL(16, 8)) as output_amount,
  t.indexOut                                  as to_idxout,
  hex(t.hashPrevOut)                          as prev_txid,
  null                                        as from_addr,
  0                                           as from_idxout,
  cast(t.value / 100000000 AS DECIMAL(16, 8)) as input_amount
  from trans t,
  tx_out o
  where t.hashBlock = x'${block.hash}'
  and t.hashPrevOut = x'0000000000000000000000000000000000000000000000000000000000000000'
  union
  select hex(t.hashBlock)                            as block_hash,
  hex(t.txid)                                 as curr_txid,
  t.address                                   as to_addr,
  cast(t.value / 100000000 AS DECIMAL(16, 8)) as output_amount,
  t.indexOut                                  as to_idxout,
  hex(o.txid)                                 as prev_txid,
  o.address                                   as from_addr,
  o.indexOut                                  as from_idxout,
  cast(o.value / 100000000 AS DECIMAL(16, 8)) as input_amount
  from trans t,
  tx_out o
  where t.hashBlock = x'${block.hash}'
  and o.txid = t.hashPrevOut
  `;

  const [transactions] = await db.promise().execute<RawTransactionInfo[]>(tq);
  const { coinbase, tx } = transformTransactions(transactions);
  return [
    {
      ...block,
      coinbase,
      tx,
    },
  ];
};
