import { RowDataPacket } from 'mysql2';
import {
  DetailedTransaction,
  AddressTransactionInput,
  AddressTransactionOutput,
} from './transaction';

// address/:address/ [transactions]
export interface BaseAddressTransaction {
  nTime: number;
  height: number;
  txid: string;
  role: 'sender' | 'receiver';
}

export interface AddressTransaction
  extends BaseAddressTransaction,
    DetailedTransaction<
      AddressTransactionInput[],
      AddressTransactionOutput[]
    > {}

export interface RawAddressTransaction
  extends RowDataPacket,
    BaseAddressTransaction {
  in_amount: string;
  out_amount: string;
  // Empty string in case of coinbase
  to_address: string;
  from_address: string | null;
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
