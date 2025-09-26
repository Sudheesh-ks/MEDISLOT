export interface WalletTypes {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  time: string;
}

export interface WalletHistoryEntry {
  type: 'credit' | 'debit';
  amount: number;
  reason?: string;
  date: string;
  status?: 'completed' | 'pending' | 'failed';
}
