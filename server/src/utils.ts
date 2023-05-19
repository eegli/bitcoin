import { ParsedQs } from 'qs';
import {
  BlockTransactionData,
  CoinbaseTransaction,
  RawTransactionInfo,
  TransactionInput,
  TransactionOutput,
} from './types/transaction';
import { Block, RawBlock } from './types/block';

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

export const buffToString = (buff: Buffer): string => {
  return buff.toString('hex');
};

export function transformBlock(block: RawBlock): Block {
  return {
    ...block,
    hash: buffToString(block.hash),
    hashMerkleRoot: buffToString(block.hashMerkleRoot),
    hashPrev: buffToString(block.hashPrev),
  };
}

export function transformBlocks<T extends RawBlock>(blocks: T[]): Block[] {
  return blocks.map(block => ({
    ...block,
    hash: buffToString(block.hash),
    hashMerkleRoot: buffToString(block.hashMerkleRoot),
    hashPrev: buffToString(block.hashPrev),
  }));
}

export function transformTransactions(
  _tx: RawTransactionInfo[]
): BlockTransactionData {
  const tx = _tx.map(t => ({
    ...t,
    to_addr: t.to_addr || 'OP_RETURN',
  }));
  const coinbase: CoinbaseTransaction[] = tx
    .filter(t => t.from_addr === null)
    .sort((a, b) => a.to_idxout - b.to_idxout)
    .map(t => ({
      txid: t.curr_txid,
      to_addr: t.to_addr,
      output_amount: t.output_amount,
      idx: t.to_idxout,
    }));

  const transactions = tx.filter(t => t.from_addr !== null);
  const map = new Map<
    string,
    {
      inputs: Map<string, TransactionInput>;
      outputs: Map<string, TransactionOutput[]>;
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
        amount: t.input_amount,
        idx: t.from_idxout,
      });
    }
    const output = val.outputs.get(t.to_addr);
    const entry = {
      address: t.to_addr,
      amount: t.output_amount,
      idx: t.to_idxout,
    };
    if (output) {
      output.push(entry);
    } else {
      val.outputs.set(t.to_addr, [entry]);
    }
  }

  return {
    coinbase,
    tx: Array.from(map.values()).map(v => {
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
