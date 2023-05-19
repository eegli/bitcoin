import { ParsedQs } from 'qs';
import {
  BlockTransactionInfo,
  RawTransaction,
  RawTransactionInfo,
  Transaction,
  TransactionInfo,
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
): BlockTransactionInfo {
  const tx = _tx.map(t => ({
    curr_txid: buffToString(t.curr_txid),
    prev_txid: buffToString(t.prev_txid),
    from_addr: t.from_addr,
    from_idxout: t.from_idxout,
    input_amount: t.input_amount,
    to_addr: t.to_addr || 'OP_RETURN',
    to_idxout: t.to_idxout,
    output_amount: t.output_amount,
  }));
  const coinbase = tx
    .filter(t => t.from_addr === null)
    .sort((a, b) => a.to_idxout - b.to_idxout)
    .map(t => ({
      curr_txid: t.curr_txid,
      to_addr: t.to_addr,
      output_amount: t.output_amount,
      idxout: t.to_idxout,
    }));

  const transactions = tx.filter(t => t.from_addr !== null);
  const map = new Map<
    string,
    { inputs: Map<string, any[]>; outputs: Map<string, any[]> }
  >();
  transactions.forEach(t => {
    let val = map.get(t.curr_txid);
    if (!val) {
      map.set(t.curr_txid, {
        inputs: new Map<string, any[]>(),
        outputs: new Map<string, any[]>(),
      });
    }
    val = map.get(t.curr_txid);
    const prevTxid = val!.inputs.get(t.prev_txid);
    if (prevTxid) {
      prevTxid.push({
        txid: t.prev_txid,
        address: t.from_addr,
        amount: t.input_amount,
        index: t.from_idxout,
      });
    } else {
      val!.inputs.set(t.prev_txid, [
        {
          txid: t.prev_txid,
          address: t.from_addr,
          amount: t.input_amount,
          index: t.from_idxout,
        },
      ]);
    }
    const output = val!.outputs.get(t.to_addr);
    if (output) {
      output.push({
        txid: t.curr_txid,
        address: t.to_addr,
        amount: t.output_amount,
        index: t.to_idxout,
      });
    } else {
      val!.outputs.set(t.to_addr, [
        {
          txid: t.curr_txid,
          address: t.to_addr,
          amount: t.output_amount,
          index: t.to_idxout,
        },
      ]);
    }
  });
  console.log(map);
  return {
    coinbase,
    tx: Array.from(map.values()).map(v => {
      const inputs = Array.from(v.inputs.values()).flat();
      const outputs = Array.from(v.outputs.values()).flat();
      return {
        inputs,
        outputs,
      };
    }) as any,
  } as any;
}
