import { Block, RawBlock } from './types/block';
import { ParsedQs } from 'qs';

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

export const transformBlocks = (blocks: RawBlock[]): Block[] => {
  return blocks.map(block => ({
    ...block,
    hash: buffToString(block.hash),
    hashMerkleRoot: buffToString(block.hashMerkleRoot),
    hashPrev: buffToString(block.hashPrev),
  }));
};
