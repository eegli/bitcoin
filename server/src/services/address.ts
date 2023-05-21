import db from './db';

import { RawAddressBalance, RawAddressTransactions } from '../types/address';

type GetAddressHistoryParams = {
  address: string;
  limit?: number;
  offset?: number;
  sort?: string;
};

export const getAddressHistory = async ({
  address,
  limit = 10,
  offset = 0,
  sort = 'desc',
}: GetAddressHistoryParams): Promise<unknown> => {
  let qb = `
  SELECT *
  FROM view_balances
  WHERE address = '${address}'
  union
  select '${address}', 0

  `;
  let qt = `
  with trans as (select b.nTime,
    b.height,
    i.hashPrevOut,
    i.indexPrevOut,
    t.txid,
    cast(o.value / 100000000 AS DECIMAL(16, 8)) value,
    o.address
    from blocks b
        join transactions t on b.hash = t.hashBlock
        join tx_in i on t.txid = i.txid
        join tx_out o on i.txid = o.txid)

    SELECT t1.nTime,
    t1.height,
    hex(t1.txid)                                                                                             txid,
    case when t1.address = '${address}' then 'receiver' else 'sender' end as type,
    t1.address                                                                                            as to_address,
    t2.address                                                                                            as from_address,
    t1.value                                                                                              as amount
    from trans t1
    join
    trans t2 on t1.hashPrevOut = t2.txid
    where t1.address = '${address}'
    or t2.address = '${address}'
    union
    SELECT t1.nTime,
    t1.height,
    hex(t1.txid)  txid,
    'receiver' as type,
    t1.address as to_address,
    bin(0)     as from_address,
    t1.value   as amount
    from trans t1
    where t1.address = '${address}'
    and t1.hashPrevOut = 0
  `;
  if (sort === 'asc' || sort === 'desc') {
    qt += ` order by height ${sort}`;
  }
  if (limit > 0) {
    limit = Math.min(limit, 100);
    qt += ` limit ${limit}`;
  }
  if (offset > 0) {
    qt += ` offset ${offset}`;
  }

  const [transactions] = await db
    .promise()
    .execute<RawAddressTransactions[]>(qt);
  console.log(transactions);
  const [balance] = await db.promise().execute<RawAddressBalance[]>(qb);
  const response = {
    address,
    balance: parseFloat(balance[0].balance),
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
    })),
  };
  return response;
};
