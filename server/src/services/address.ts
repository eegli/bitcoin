import db from './db';

import {
  AddressBalance,
  AddressTransaction,
  RawAddressBalance,
  RawAddressTransaction,
} from '../types/address';
import { Pagination } from '../types/response';
import { RowDataPacket } from 'mysql2';

type GetAddressHistoryParams = {
  address: string;
  limit?: number;
  offset?: number;
  sort?: string;
  role?: string;
  no_coinbase?: boolean;
};

type GetAddressHistoryResponse = AddressBalance & {
  transactions: AddressTransaction[];
  pagination: Pagination;
  filters: {
    role: string;
    no_coinbase: boolean;
  };
};

export const getAddressHistory = async ({
  address,
  limit = 30,
  offset = 0,
  sort = 'desc',
  no_coinbase = false,
  role = 'all',
}: GetAddressHistoryParams): Promise<GetAddressHistoryResponse> => {
  const qbalance = `
  SELECT balance
  FROM view_balances
  WHERE address = '${address}'
  UNION
  SELECT 0
  `;

  const qtotal = `
  SELECT Count(DISTINCT txid) tr_cnt
  FROM view_transactions
  WHERE address = '${address}'
  GROUP BY address
  UNION
  SELECT 0
  `;

  let qtransactions = `
  WITH full_transactions AS
  (
         SELECT b.hash,
                b.height,
                b.ntime,
                i.hashprevout,
                i.indexprevout,
                t.txid,
                o.indexout,
                o.address,
                o.value
         FROM   blocks b
         JOIN   transactions t
         ON     b.hash = t.hashblock
         JOIN   tx_in i
         ON     t.txid = i.txid
         JOIN   tx_out o
         ON     i.txid = o.txid), addr_outer AS
  (
            SELECT    t1.height,
                      t1.ntime,
                      t1.txid,
                      t1.address,
                      t1.value,
                      t1.hashprevout
            FROM      full_transactions t1
            LEFT JOIN full_transactions t2
            ON        t1.hashprevout = t2.txid
            AND       t1.indexprevout = t2.indexout
            UNION
            SELECT    t1.height,
                      t1.ntime,
                      t1.txid,
                      t1.address,
                      t1.value,
                      t1.hashprevout
            FROM      full_transactions t1
            LEFT JOIN full_transactions t2
            ON        t1.hashprevout = t2.txid
            AND       t1.indexprevout = t2.indexout), addr_io AS
  (
                  SELECT DISTINCT height,
                                  ntime,
                                  address,
                  IF(hashprevout = CAST(0b00 AS binary(32)), true, false) is_coinbase,
                  LOWER(HEX(txid)) txid,
                  IF(address = '${address}', 'receiver', 'sender') role,
                  CAST(value / 100000000 AS decimal(16, 8)) amount FROM addr_outer)
  SELECT *
  FROM   addr_io
  WHERE  address = '${address}'
 `;

  if (role === 'receiver') {
    qtransactions += ` AND role = 'receiver'`;
  } else if (role === 'sender') {
    qtransactions += ` AND role = 'sender'`;
  }

  if (no_coinbase) {
    qtransactions += ` AND is_coinbase = false`;
  }

  if (sort === 'asc' || sort === 'desc') {
    qtransactions += ` ORDER BY height ${sort}`;
  }
  if (limit > 0) {
    limit = Math.min(limit, 100);
    qtransactions += ` LIMIT ${limit}`;
  }
  if (offset > 0) {
    qtransactions += ` OFFSET ${offset}`;
  }

  const [[transactions], [balances], [total]] = await Promise.all([
    db.promise().execute<RawAddressTransaction[]>(qtransactions),
    db.promise().execute<RawAddressBalance[]>(qbalance),
    db.promise().execute<RowDataPacket[]>(qtotal),
  ]);

  return {
    address,
    balance: parseFloat(balances[0].balance),
    pagination: {
      limit,
      offset,
      sort,
      total: total[0].tr_cnt,
    },
    filters: {
      role,
      no_coinbase,
    },
    transactions: transactions.map(t => ({
      height: t.height,
      ntime: t.ntime,
      txid: t.txid,
      role: t.role,
      is_coinbase: t.is_coinbase === 1,
      amount: parseFloat(t.amount),
    })),
  };
};