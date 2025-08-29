import { WalletDocument } from '../../models/walletModel';

export interface IWalletRepository {
  getOrCreateWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin'
  ): Promise<WalletDocument>;
  creditWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string
  ): Promise<void>;
  debitWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string
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
    txnType?: 'credit' | 'debit' | 'all'
  ): Promise<{ history: any[]; total: number; balance: number }>;
}
