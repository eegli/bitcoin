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
  nTime: number;
  height: number;
  curr_txid: string;
  prev_txid: string;
  to_addr: string | null;
  from_addr: string | null;
  output_amount: string;
  input_amount: string;
  to_idxout: number;
  from_idxout: number;
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
