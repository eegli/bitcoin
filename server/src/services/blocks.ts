import { RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import { mapBlockTransactions } from '../utils';
import { BlockTransactions, RawBlockTransactionInfo } from '../types/block';
import { Pagination } from '../types/response';

type GetBlocksParams = {
  limit?: number;
  offset?: number;
  sort?: string;
};

export const getBlocks = async ({
  limit = 30,
  offset = 0,
  sort = 'desc',
}: GetBlocksParams): Promise<
  { pagination: Pagination } & { blocks: Block[] }
> => {
  let qb = `
  SELECT b.id,
    Hex(hash)           hash,
    height,
    b.version,
    blocksize,
    Hex(hashprev)       hashPrev,
    Hex(hashmerkleroot) hashMerkleRoot,
    Count(t.txid)       txCnt,
    ntime,
    nbits,
    nnonce
  FROM   blocks b
    LEFT OUTER JOIN transactions t
                ON b.hash = t.hashblock
  GROUP  BY hash  
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

type GetBlockResponse = (Block & BlockTransactions)[];

export const getBlock = async ({
  height,
}: GetBlockParams): Promise<GetBlockResponse> => {
  const bq = `
  SELECT id,
    Hex(hash) hash,
    height,
    version,
    blocksize,
    Hex(hashprev)       hashprev,
    Hex(hashmerkleroot) hashmerkleroot,
    ntime,
    nbits,
    nnonce
  FROM   blocks
  WHERE  height = ${height} 
  `;
  const [blocks] = await db.promise().execute<RawBlock[]>(bq);
  if (blocks.length === 0) {
    return [];
  }
  const block = blocks[0];
  const tq = `
  WITH trans
  AS (SELECT t.hashblock,
             t.txid,
             i.hashprevout,
             o.indexout,
             o.VALUE,
             o.address
      FROM   transactions t
             JOIN tx_in i
               ON t.txid = i.txid
             JOIN tx_out o
               ON t.txid = o.txid)
  SELECT Hex(t1.txid)                                              curr_txid,
      Hex(t1.hashprevout)                                       prev_txid,
      t1.indexout                                               to_idxout,
      CAST(t1.VALUE / 100000000 AS DECIMAL(16, 8))              output_amount,
      t1.address                                                to_addr,
      Coalesce(t2.indexout, 0)                                  from_idxout,
      Coalesce(CAST(t2.VALUE / 100000000 AS DECIMAL(16, 8)), 0) input_amount,
      t2.address                                                from_addr
  FROM   trans t1
      LEFT JOIN trans t2
            ON t1.hashprevout = t2.txid
  WHERE  t1.hashblock = x'${block.hash}'  
  `;

  const [_transactions] = await db
    .promise()
    .execute<RawBlockTransactionInfo[]>(tq);
  const { coinbase, transactions } = mapBlockTransactions(_transactions);
  return [
    {
      ...block,
      coinbase,
      transactions,
    },
  ];
};
