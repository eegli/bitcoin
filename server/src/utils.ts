import { ParsedQs } from 'qs';
import { RawTransaction, Transaction } from './types/transaction';

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

export function transformBlocks<T extends RawBlock>(blocks: T[]): Block[] {
  return blocks.map(block => ({
    ...block,
    hash: buffToString(block.hash),
    hashMerkleRoot: buffToString(block.hashMerkleRoot),
    hashPrev: buffToString(block.hashPrev),
  }));
}

export function transformTransaction<T extends RawTransaction>(
  blocks: T[]
): Transaction[] {
  return blocks.map(block => ({
    ...block,
    txid: buffToString(block.txid),
    hashBlock: buffToString(block.hashBlock),
  }));
}
