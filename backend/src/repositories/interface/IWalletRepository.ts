import { WalletDocument } from '../../models/walletModel';

export interface IWalletRepository {
  getOrCreateWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin' | 'lab'
  ): Promise<WalletDocument>;
  creditWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin' | 'lab',
    amount: number,
    reason: string
  ): Promise<void>;
  debitWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin' | 'lab',
    amount: number,
    reason: string
  ): Promise<void>;
  findWalletByOwner(
    ownerId: string,
    ownerType: 'admin' | 'doctor' | 'user' | 'lab'
  ): Promise<WalletDocument | null>;
  getWalletHistoryPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin' | 'lab',
    page: number,
    limit: number,
    search?: string,
    period?: string,
    txnType?: 'credit' | 'debit' | 'all',
    startDate?: string,
    endDate?: string
  ): Promise<{
    history: any[];
    total: number;
    balance: number;
    filteredCredits: number;
    filteredDebits: number;
  }>;
}
