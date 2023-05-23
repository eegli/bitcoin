import db from './db';

import {
  AddressBalance,
  AddressTransaction,
  RawAddressBalance,
  RawAddressTransaction,
} from '../types/address';
import { Pagination } from '../types/response';
import { RowDataPacket } from 'mysql2';
import { mapAddressTransactions } from '../utils';

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
  WITH trans AS
  (
         SELECT b.ntime,
                b.height,
                i.hashprevout,
                t.txid,
                o.value,
                o.address
         FROM   blocks b
         JOIN   transactions t
         ON     b.hash = t.hashblock
         JOIN   tx_in i
         ON     t.txid = i.txid
         JOIN   tx_out o
         ON     i.txid = o.txid)
  SELECT    t1.ntime,
            t1.height,
            Hex(t1.txid) txid,
            t1.address   to_address,
            t2.address   from_address,
            CASE
                      WHEN t1.address = '${address}' THEN 'receiver'
                      ELSE 'sender'
            END                                          role,
            cast(t1.value / 100000000 AS DECIMAL(16, 8)) in_amount,
            cast(t2.value / 100000000 AS DECIMAL(16, 8)) out_amount
  FROM      trans t1
  LEFT JOIN trans t2
  ON        t1.hashprevout = t2.txid

  `;

  if (role === 'sender') {
    qtransactions += `WHERE t2.address = '${address}'`;
  } else if (role === 'receiver') {
    if (no_coinbase) {
      qtransactions += `WHERE t1.address = '${address}' AND t2.address IS NOT NULL`;
    } else {
      qtransactions += `WHERE t1.address = '${address}'`;
    }
  } else {
    qtransactions += `WHERE t1.address = '${address}' OR t2.address = '${address}'`;
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
    transactions: mapAddressTransactions(transactions),
  };
};
