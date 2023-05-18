import { RowDataPacket } from 'mysql2';
import db from './db';
import { RawTransaction, Transaction } from '../types/transaction';
import { transformTransaction } from '../utils';

export const getTransactionCount = async (): Promise<number> => {
  const [rows] = await db
    .promise()
    .execute<RowDataPacket[]>('select count(*) as cnt from transactions');
  return rows[0]['cnt'];
};

type GetTransactionParams = {
  blockHash?: string;
  limit?: number;
  offset?: number;
};

export const getTransactions = async ({
  blockHash,
  limit = 10,
  offset = 0,
}: GetTransactionParams): Promise<Transaction[]> => {
  let q = 'select * from transactions';
  if (limit > 0) {
    limit = Math.min(limit, 100);
    q += ` limit ${limit}`;
  }
  if (offset > 0) {
    q += ` offset ${offset}`;
  }

  const [rows] = await db.promise().execute<RawTransaction[]>(q);
  return transformTransaction(rows);
};
