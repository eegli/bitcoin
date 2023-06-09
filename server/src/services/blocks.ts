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
    LOWER(HEX(hash))           hash,
    height,
    b.version,
    blocksize,
    LOWER(HEX(hashprev))       hashPrev,
    LOWER(HEX(hashmerkleroot)) hashMerkleRoot,
    COUNT(t.txid)              txCnt,
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
  SELECT Max(height) count
  FROM   blocks;  
  `;
  const [[rows], [count]] = await Promise.all([
    db.promise().execute<RawBlock[]>(qb),
    db.promise().execute<RowDataPacket[]>(qt),
  ]);

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
    Lower(HEX(hash)) hash,
    height,
    version,
    blocksize,
    Lower(HEX(hashprev))       hashprev,
    Lower(HEX(hashmerkleroot)) hashmerkleroot,
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
  SELECT LOWER(HEX(t1.txid))        curr_txid,
  LOWER(HEX(t1.hashprevout)) prev_txid,
  t1.indexout                to_idxout,
  t1.value                   output_amount,
  t1.address                 to_addr,
  COALESCE(t2.indexout, 0)   from_idxout,
  COALESCE(t2.value, 0)      input_amount,
  COALESCE(t2.address, '')   from_addr
  FROM view_transactions t1
      LEFT JOIN view_transactions t2
                ON t1.hashprevout = t2.txid
                    AND t1.indexprevout = t2.indexout
  WHERE t1.height = ${block.height}
  AND t1.address != ''
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
