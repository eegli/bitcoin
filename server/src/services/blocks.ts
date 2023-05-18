import { Connection, RowDataPacket } from 'mysql2';
import db from './db';
import { Block, RawBlock } from '../types/block';
import { transformBlocks } from '../utils';

export const getBlockCount = async (): Promise<number> => {
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
  let q = 'select * from blocks';
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
  db: Connection;
  hash: string;
};

export const getBlock = async ({ hash }: GetBlockParams): Promise<Block> => {
  const q = `select * from blocks where hash = x'${hash}'`;
  const [rows] = await db.promise().execute<RawBlock[]>(q);
  return transformBlocks(rows)[0];
};
