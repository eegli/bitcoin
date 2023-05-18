import { RowDataPacket } from 'mysql2';

interface BaseBlock extends RowDataPacket {
  blocksize: number;
  height: number;
  id: number & { readonly __brand?: 'blocks_id' };
  nBits: number;
  nNonce: number;
  nTime: number;
  version: number;
}

export interface RawBlock extends BaseBlock {
  hash: Buffer;
  hashMerkleRoot: Buffer;
  hashPrev: Buffer;
}
export interface Block extends BaseBlock {
  hash: string;
  hashMerkleRoot: string;
  hashPrev: string;
}
