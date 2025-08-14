import { IWalletRepository } from '../interface/IWalletRepository';
import walletModel, { WalletDocument } from '../../models/walletModel';
import { BaseRepository } from '../BaseRepository';

export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepository {
  constructor() {
    super(walletModel);
  }

  async getOrCreateWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin'
  ): Promise<WalletDocument> {
    let wallet = await walletModel.findOne({ ownerId, ownerType });
    // console.log(ownerId)
    if (!wallet) {
      wallet = await walletModel.create({ ownerId, ownerType, balance: 0 });
    }
    return wallet;
  }

  async getWalletHistoryPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    page: number,
    limit: number
  ): Promise<{ history: any[]; total: number; balance: number }> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);

    const total = wallet.history.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedHistory = wallet.history
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(startIndex, endIndex);

    return {
      history: paginatedHistory,
      total,
      balance: wallet.balance,
    };
  }

  async creditWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    console.log(ownerId);
    wallet.balance += amount;
    wallet.history.push({ type: 'credit', amount, reason, date: new Date() });
    await wallet.save();
  }

  async debitWallet(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    amount: number,
    reason: string
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);
    console.log(ownerId);
    wallet.balance -= amount;
    wallet.history.push({ type: 'debit', amount, reason, date: new Date() });
    await wallet.save();
  }

  async findWalletByOwner(
    ownerId: string,
    ownerType: 'admin' | 'doctor' | 'user'
  ): Promise<WalletDocument | null> {
    // console.log(ownerId)
    return this.model.findOne({ ownerId, ownerType });
  }
}
