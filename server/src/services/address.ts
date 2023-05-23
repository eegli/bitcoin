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
  pagination: Omit<Pagination, 'total'>;
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

  let qtransactions = `
  WITH trans
  AS (SELECT b.height,
             b.nTime,
             i.hashprevout,
             i.indexprevout,
             t.txid,
             o.indexout,
             o.address,
             o.value
      FROM blocks b
               JOIN transactions t
                    ON b.hash = t.hashblock
               JOIN tx_in i
                    ON t.txid = i.txid
               JOIN tx_out o
                    ON i.txid = o.txid),
  address_trans
    AS (SELECT t1.height                                    height,
              t1.ntime                                     nTime,
              Hex(t1.txid)                                 txid,
              t1.address                                   to_addr,
              Cast(t1.value / 100000000 AS DECIMAL(16, 8)) to_amount,
              t2.address                                   from_addr,
              Cast(t2.value / 100000000 AS DECIMAL(16, 8)) from_amount
        FROM trans t1
                left join trans t2
                          ON t1.hashprevout = t2.txid and t1.indexPrevOut = t2.indexOut)
  SELECT DISTINCT IF(to_addr = '${address}',
              to_amount,
              from_amount) amount,
          IF(to_addr = '${address}',
              'receiver', 'sender')
                          role,
          txid,
          height,
          ntime time
  FROM address_trans
  `;

  if (role === 'sender') {
    qtransactions += `WHERE from_addr = '${address}'`;
  } else if (role === 'receiver') {
    qtransactions += `WHERE to_addr = '${address}'`;
  } else {
    qtransactions += `WHERE from_addr = '${address}' OR to_addr = '${address}'`;
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

  const qtotal = `
  SELECT Count(i.txid) cnt
  FROM   tx_in i
         JOIN tx_out o
           ON i.txid = o.txid
              AND address = '${address}'
  GROUP  BY o.address  
  `;

  const [[transactions], [balances]] = await Promise.all([
    db.promise().execute<RawAddressTransaction[]>(qtransactions),
    db.promise().execute<RawAddressBalance[]>(qbalance),
  ]);

  return {
    address,
    balance: parseFloat(balances[0].balance),
    pagination: {
      limit,
      offset,
      sort,
    },
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
    })),
  };
};
