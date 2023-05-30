import { RowDataPacket } from 'mysql2';

// address/:address/ [transactions]
export interface BaseAddressTransaction {
  ntime: number;
  height: number;
  txid: string;
}

export interface AddressTransaction extends BaseAddressTransaction {
  amount: number;
  is_coinbase: boolean;
  role: 'receiver' | 'sender';
}

export interface RawAddressTransaction
  extends RowDataPacket,
    BaseAddressTransaction {
  amount: string;
  is_coinbase: number;
  role: 'r' | 's';
}

interface BaseAddressBalance {
  address: string;
}

export interface AddressBalance extends BaseAddressBalance {
  balance: number;
}

export interface RawAddressBalance extends RowDataPacket, BaseAddressBalance {
  balance: string;
}
