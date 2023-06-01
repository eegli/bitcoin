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
  SELECT COUNT(DISTINCT (t1.txid)) tr_cnt
  FROM view_transactions t1
           LEFT JOIN view_transactions t2 ON t1.hashprevout = t2.txid AND t1.indexprevout = t2.indexout
  WHERE t1.address = '${address}'
     OR t2.address = '${address}'
  UNION
  SELECT 0
  `;

  let qtransactions = `
  WITH addr_io AS (SELECT height,
    txid,
    address,
    SUM(value) value,
    FALSE      is_coinbase,
    's'        role
  FROM (SELECT DISTINCT t1.height,
                    t1.txid,
                    t2.address,
                    t2.value
    FROM view_transactions t1
              JOIN view_transactions t2
                  ON t1.hashprevout = t2.txid AND t1.indexprevout = t2.indexout) tmp
  GROUP BY height, address, txid
  UNION
  SELECT height,
      txid,
      address,
      value,
      IF(hashprevout = CAST(0x00 AS BINARY(32)), TRUE, FALSE) is_coinbase,
      'r'                                                     role
  FROM view_transactions t1)
  SELECT a.height,
  b.ntime,
  LOWER(HEX(a.txid))                 txid,
  a.value                            amount,
  a.is_coinbase,
  a.role,
  IF(t.unspent = b'01', TRUE, FALSE) unspent
  FROM addr_io a
  JOIN blocks b ON a.height = b.height
  LEFT JOIN tx_out t ON a.txid = t.txid AND a.address = t.address
  WHERE a.address = '${address}'
 `;

  if (role === 'receiver') {
    qtransactions += ` AND role = 'r'`;
  } else if (role === 'sender') {
    qtransactions += ` AND role = 's'`;
  }

  if (no_coinbase) {
    qtransactions += ` AND is_coinbase = false`;
  }

  if (sort === 'asc' || sort === 'desc') {
    qtransactions += ` ORDER BY a.height ${sort}`;
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
      role: t.role === 'r' ? 'receiver' : 'sender',
      is_coinbase: t.is_coinbase === 1,
      amount: parseFloat(t.amount),
      unspent: t.unspent === 1,
    })),
  };
};
