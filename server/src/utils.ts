import { ParsedQs } from 'qs';
import {
  AddressTransactionInput,
  AddressTransactionOutput,
  BlockTransactionInput,
  BlockTransactionOutput,
  BlockTransactions,
  CoinbaseTransaction,
  RawBlockTransactionInfo,
} from './types/transaction';
import {
  AddressTransaction,
  BaseAddressTransaction,
  RawAddressTransaction,
} from './types/address';

export const firstQueryParam = (
  req: ParsedQs,
  key: string
): string | undefined => {
  const q = req[key];
  const val = Array.isArray(q) ? q[0] : q;
  return typeof val === 'string' ? val : undefined;
};

export const maybeParseInt = (val: string | undefined): number | undefined => {
  return val ? parseInt(val) : undefined;
};

export function mapBlockTransactions(
  _tx: RawBlockTransactionInfo[]
): BlockTransactions {
  const tx = _tx.map(t => ({
    ...t,
    to_addr: t.to_addr || 'OP_RETURN',
  }));
  let coinbaseTxid = '';
  const coinbase: CoinbaseTransaction[] = tx
    .filter(t => t.from_addr === null)
    .sort((a, b) => a.to_idxout - b.to_idxout)
    .map(t => {
      coinbaseTxid = t.curr_txid;
      return {
        to_addr: t.to_addr,
        output_amount: parseFloat(t.output_amount),
        idx: t.to_idxout,
      };
    });

  const transactions = tx.filter(t => t.from_addr !== null);
  const map = new Map<
    string,
    {
      inputs: Map<string, BlockTransactionInput>;
      outputs: Map<string, BlockTransactionOutput>;
      txid: string;
    }
  >();
  for (const t of transactions) {
    const _val = map.get(t.curr_txid);
    if (!_val) {
      map.set(t.curr_txid, {
        inputs: new Map(),
        outputs: new Map(),
        txid: t.curr_txid,
      });
    }
    const val = map.get(t.curr_txid)!;
    const prevTxid = val.inputs.get(t.prev_txid);
    if (!prevTxid) {
      val!.inputs.set(t.prev_txid, {
        txid: t.prev_txid,
        address: t.from_addr!,
        amount: parseFloat(t.input_amount),
        idx: t.from_idxout,
      });
    }
    const output = val.outputs.get(t.to_addr);
    const entry = {
      address: t.to_addr,
      amount: parseFloat(t.output_amount),
      idx: t.to_idxout,
    };
    if (!output) {
      val.outputs.set(t.to_addr, entry);
    }
  }

  return {
    coinbase: {
      txid: coinbaseTxid,
      outputs: coinbase,
    },
    transactions: Array.from(map.values()).map(v => {
      const inputs = Array.from(v.inputs.values()).flat();
      const outputs = Array.from(v.outputs.values()).flat();
      return {
        inputs,
        outputs,
        txid: v.txid,
      };
    }),
  };
}

export function mapAddressTransactions(
  rows: RawAddressTransaction[]
): AddressTransaction[] {
  const map = new Map<
    string,
    {
      inputs: Set<string>;
      outputs: Set<string>;
      txid: string;
      amount: string;
    } & BaseAddressTransaction
  >();
  for (const row of rows) {
    const _txid = map.get(row.txid);
    if (!_txid) {
      map.set(row.txid, {
        inputs: new Set(),
        outputs: new Set(),
        txid: row.txid,
        height: row.height,
        nTime: row.nTime,
        amount: row.amount,
        role: row.role,
      });
    }
    const txid = map.get(row.txid)!;
    if (row.from_address) {
      txid.inputs.add(row.from_address);
    }
    if (row.to_address) {
      txid.outputs.add(row.to_address);
    }
  }
  return Array.from(map.values()).map(v => {
    return {
      height: v.height,
      nTime: v.nTime,
      amount: parseFloat(v.amount),
      role: v.role,
      inputs: [...v.inputs],
      outputs: [...v.outputs],
      txid: v.txid,
    };
  });
}
