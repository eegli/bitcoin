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
};

export const getAddressHistory = async ({
  address,
  limit = 30,
  offset = 0,
  sort = 'desc',
  no_coinbase = false,
  role = '',
}: GetAddressHistoryParams): Promise<GetAddressHistoryResponse> => {
  const qbalance = `
  SELECT *
  FROM view_balances
  WHERE address = '${address}'
  UNION
  SELECT '${address}',
        0  
  `;

  const qtotal = `
  SELECT Count(txid) cnt
  FROM   view_transactions
  WHERE  address = '${address}'
  GROUP  BY address  
  `;

  let qtransactions = `
  WITH trans
  AS (SELECT b.height,
             b.ntime,
             i.hashprevout,
             i.indexprevout,
             t.txid,
             o.indexout,
             o.address,
             o.value
        FROM blocks b
             join transactions t
               ON b.hash = t.hashblock
             join tx_in i
               ON t.txid = i.txid
             join tx_out o
               ON i.txid = o.txid),
  address_trans
  AS (SELECT t1.height                                    height,
             t1.ntime                                     nTime,
             LOWER(HEX(t1.txid))                          txid,
             t1.address                                   to_addr,
             CAST(t1.value / 100000000 AS DECIMAL(16, 8)) to_amount,
             t2.address                                   from_addr,
             CAST(t2.value / 100000000 AS DECIMAL(16, 8)) from_amount
        FROM trans t1
             left join trans t2
                    ON t1.hashprevout = t2.txid
                       AND t1.indexprevout = t2.indexout)
  SELECT DISTINCT IF(to_addr = '${address}', to_amount, from_amount) amount,
              IF(to_addr = '${address}', 'receiver', 'sender')   role,
              IF(from_addr IS NULL, TRUE, FALSE)                 is_coinbase,
              txid,
              height,
              ntime                                              ntime
  FROM address_trans  
    `;

  if (role === 'sender') {
    qtransactions += `WHERE from_addr = '${address}'`;
  } else if (role === 'receiver') {
    qtransactions += `WHERE to_addr = '${address}'`;
  } else {
    qtransactions += `WHERE (from_addr = '${address}' OR to_addr = '${address}')`;
  }
  if (no_coinbase) {
    qtransactions += ` AND from_addr IS NOT NULL`;
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
      total: total[0]?.cnt || 0,
    },
    transactions: transactions.map(t => ({
      ...t,
      is_coinbase: t.is_coinbase === 1,
      amount: parseFloat(t.amount),
    })),
  };
};