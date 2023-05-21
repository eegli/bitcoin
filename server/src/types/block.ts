import { RowDataPacket } from 'mysql2';

export interface Block {
  blocksize: number;
  height: number;
  id: number;
  nBits: number;
  nNonce: number;
  nTime: number;
  version: number;
  hash: string;
  txCnt: number;
  hashMerkleRoot: string;
  hashPrev: string;
}

export interface RawBlock extends RowDataPacket, Block {}
