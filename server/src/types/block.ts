import { RowDataPacket } from 'mysql2';
import { Transaction } from './transaction';

interface BaseBlock {
  blocksize: number;
  height: number;
  id: number & { readonly __brand?: 'blocks_id' };
  nBits: number;
  nNonce: number;
  nTime: number;
  version: number;
}

export interface RawBlock extends RowDataPacket, BaseBlock {
  hash: Buffer;
  hashMerkleRoot: Buffer;
  hashPrev: Buffer;
}
export interface Block extends BaseBlock {
  hash: string;
  hashMerkleRoot: string;
  hashPrev: string;
}
