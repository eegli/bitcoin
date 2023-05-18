import mysql, { Connection, RowDataPacket } from 'mysql2';
import { Block, RawBlock } from './types/block';
import { transformBlocks } from './utils';

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

con.connect();

export const getBlockCount = async (db: Connection): Promise<number> => {
  const [rows] = await db
    .promise()
    .execute<RowDataPacket[]>('select count(*) as cnt from blocks');
  return rows[0]['cnt'];
};

type GetBlocksParams = {
  db: Connection;
  limit?: number;
  offset?: number;
  sort?: string;
};

export const getBlocks = async ({
  db,
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

export const getBlock = async ({
  db,
  hash,
}: GetBlockParams): Promise<Block> => {
  const q = `select * from blocks where hash = x'${hash}'`;
  const [rows] = await db.promise().execute<RawBlock[]>(q);
  return transformBlocks(rows)[0];
};

export default con;
