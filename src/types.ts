export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string; // unique identifier
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  desc: string; // description
  notes: string;
  pm: string; // payment method
  account: string; // account name
  type: TransactionType;
  cat: string; // category key
  amount: number; // in TND
  fromAccount?: string; // for transfers
  toAccount?: string; // for transfers
}

export interface AccountBalances {
  cash: number;
  bank: number;
  card: number;
}

export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
}

export interface CategoryBudget {
  [key: string]: number;
}

export type PeriodType = 'this_month' | 'last_month' | 'last_3m' | 'this_year' | 'all';
