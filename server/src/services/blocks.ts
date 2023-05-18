import { RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import {
  transformBlock,
  transformBlocks,
  transformTransactions,
} from '../utils';
import { RawTransaction, WithTransactions } from '../types/transaction';

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

export const getBlock = async ({
  height,
}: GetBlockParams): Promise<WithTransactions<Block>[]> => {
  const bq = `select * from blocks where height = ${height}`;
  const [blocks] = await db.promise().execute<RawBlock[]>(bq);
  if (blocks.length === 0) {
    return [];
  }
  const block: WithTransactions<Block> = {
    ...transformBlock(blocks[0]),
    txids: [],
  };
  const tq = `select * from transactions where hashBlock = x'${block.hash}'`;
  const [transactions] = await db.promise().execute<RawTransaction[]>(tq);
  block.txids = transformTransactions(transactions).map(tx => tx.txid);
  return [block];
};
