import { RowDataPacket } from 'mysql2';

export interface RawAddressBalance extends RowDataPacket {
  address: string;
  balance: string;
}

// address/:address/ [transactions]
export interface RawAddressTransactions extends RowDataPacket {
  nTime: number;
  height: number;
  txid: string;
  type: string;
  to_address: string;
  from_address: string | null;
  amount: string;
}
