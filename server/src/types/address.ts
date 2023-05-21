import { RowDataPacket } from 'mysql2';

export interface RawAddressBalance extends RowDataPacket {
  address: string;
  balance: number;
}
