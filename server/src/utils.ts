import { ParsedQs } from 'qs';
import {
  BlockTransactionInput,
  BlockTransactionOutput,
  BlockTransactions,
  CoinbaseTransaction,
  RawBlockTransactionInfo,
} from './types/block';

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
  for (const row of transactions) {
    const _val = map.get(row.curr_txid);
    if (!_val) {
      map.set(row.curr_txid, {
        inputs: new Map(),
        outputs: new Map(),
        txid: row.curr_txid,
      });
    }
    const val = map.get(row.curr_txid)!;
    const prevTxid = val.inputs.get(row.prev_txid);
    if (!prevTxid) {
      val!.inputs.set(row.prev_txid, {
        txid: row.prev_txid,
        address: row.from_addr!,
        amount: parseFloat(row.input_amount),
        idx: row.from_idxout,
      });
    }
    const output = val.outputs.get(row.to_addr);
    const entry = {
      address: row.to_addr,
      amount: parseFloat(row.output_amount),
      idx: row.to_idxout,
    };
    if (!output) {
      val.outputs.set(row.to_addr, entry);
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
