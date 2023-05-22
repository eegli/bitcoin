import { RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import { transformBlockTransactions } from '../utils';
import {
  BlockTransactionData,
  RawBlockTransactionInfo,
} from '../types/transaction';
import { Pagination } from '../types/response';

type GetBlocksParams = {
  limit?: number;
  offset?: number;
  sort?: string;
};

export const getBlocks = async ({
  limit = 10,
  offset = 0,
  sort = 'desc',
}: GetBlocksParams): Promise<
  { pagination: Pagination } & { blocks: Block[] }
> => {
  let qb = `
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
    qb += ` order by height ${sort}`;
  }
  if (limit > 0) {
    limit = Math.min(limit, 100);
    qb += ` limit ${limit}`;
  }
  if (offset > 0) {
    qb += ` offset ${offset}`;
  }

  const qt = `
  select count(*) count from blocks;
  `;

  const [rows] = await db.promise().execute<RawBlock[]>(qb);
  const [count] = await db.promise().execute<RowDataPacket[]>(qt);
  return {
    pagination: {
      limit,
      offset,
      total: count[0]['count'],
      sort,
    },
    blocks: rows,
  };
};

type GetBlockParams = {
  height: number;
};

type GetBlockResponse = (Block & BlockTransactionData)[];

export const getBlock = async ({
  height,
}: GetBlockParams): Promise<GetBlockResponse> => {
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
  select hex(t1.txid)                                       curr_txid,
  hex(t1.hashPrevOut)                                       prev_txid,
  t1.indexOut                                               to_idxout,
  cast(t1.value / 100000000 AS DECIMAL(16, 8))              output_amount,
  t1.address                                                to_addr,
  coalesce(t2.indexOut, 0)                                  from_idxout,
  coalesce(cast(t2.value / 100000000 AS DECIMAL(16, 8)), 0) input_amount,
  t2.address                                                from_addr
  from trans t1
  left join
  trans t2 on t1.hashPrevOut = t2.txid
  where t1.hashBlock = x'${block.hash}'

  `;

  const [transactions] = await db
    .promise()
    .execute<RawBlockTransactionInfo[]>(tq);
  const { coinbase, tx } = transformBlockTransactions(transactions);
  return [
    {
      ...block,
      coinbase,
      tx,
    },
  ];
};
