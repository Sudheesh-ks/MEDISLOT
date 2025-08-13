import { WalletDocument } from '../../models/walletModel';

export interface IWalletRepository {
  getOrCreateWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin'
  ): Promise<WalletDocument>;
  creditWallet(ownerId: string, ownerType: string, amount: number, reason: string): Promise<void>;
  debitWallet(ownerId: string, ownerType: string, amount: number, reason: string): Promise<void>;
  findWalletByOwner(
    ownerId: string,
    ownerType: 'admin' | 'doctor' | 'user'
  ): Promise<WalletDocument | null>;
  getWalletHistoryPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    page: number,
    limit: number
  ): Promise<{ history: any[]; total: number; balance: number }>;
}
