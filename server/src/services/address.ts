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
  WITH trans
  AS (SELECT
             b.nTime,
             b.height,
             t.txid,
             i.hashprevout,
             o.indexout,
             o.VALUE,
             o.address
      FROM transactions t
               JOIN tx_in i
                    ON t.txid = i.txid
               JOIN tx_out o
                    ON t.txid = o.txid
               join blocks b on b.hash = t.hashBlock)

SELECT t1.ntime,
t1.height,
Hex(t1.txid)                                              curr_txid,
Hex(t1.hashprevout)                                       prev_txid,
t1.indexout                                               to_idxout,
CAST(t1.VALUE / 100000000 AS DECIMAL(16, 8))              output_amount,
t1.address                                                to_addr,
Coalesce(t2.indexout, 0)                                  from_idxout,
Coalesce(CAST(t2.VALUE / 100000000 AS DECIMAL(16, 8)), 0) input_amount,
t2.address                                                from_addr
FROM trans t1
  LEFT JOIN trans t2
            ON t1.hashprevout = t2.txid
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
