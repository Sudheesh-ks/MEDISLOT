import { WalletDocument } from '../../models/WalletModel';

export interface IWalletRepository {
  getOrCreateWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    session?: any
  ): Promise<WalletDocument>;
  creditWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string,
    session?: any
  ): Promise<void>;
  debitWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string,
    session?: any
  ): Promise<void>;
  findWalletByOwner(
    ownerId: string,
    ownerType: 'admin' | 'doctor' | 'user'
  ): Promise<WalletDocument | null>;
  getWalletHistoryPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
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
