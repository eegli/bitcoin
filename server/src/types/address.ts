import { RowDataPacket } from 'mysql2';

interface BaseAddressBalance {
  address: string;
}

// address/:address/ [transactions]
interface BaseAddressTransactions {
  nTime: number;
  height: number;
  txid: string;
  type: string;
  to_address: string;
  from_address: string | null;
}

export interface AddressTransactions extends BaseAddressTransactions {
  amount: number;
}

export interface AddressBalance extends BaseAddressBalance {
  balance: number;
}

export interface RawAddressTransactions
  extends RowDataPacket,
    BaseAddressTransactions {
  amount: string;
}
export interface RawAddressBalance extends RowDataPacket, BaseAddressBalance {
  balance: string;
}
