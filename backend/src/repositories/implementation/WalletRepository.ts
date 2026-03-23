import { IWalletRepository } from '../interface/IWalletRepository';
import walletModel, { WalletDocument } from '../../models/walletModel';
import { BaseRepository } from '../BaseRepository';
import { WalletHistory } from '../../types/wallet';

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
    limit: number,
    search?: string,
    period?: string,
    txnType?: 'credit' | 'debit' | 'all',
    startDate?: string,
    endDate?: string
  ): Promise<{
    history: WalletHistory[];
    total: number;
    balance: number;
    filteredCredits: number;
    filteredDebits: number;
  }> {
    const wallet = await this.getOrCreateWallet(ownerId, ownerType);

    let history = [...wallet.history];

    if (search) {
      const s = search.toLowerCase();
      history = history.filter((tx) => tx.reason && tx.reason.toLowerCase().includes(s));
    }

    if (period && period !== 'all') {
      const now = new Date();
      let filterDate: Date | null = null;
      let start: Date | null = null;
      let end: Date | null = null;

      if (period === 'today') {
        filterDate = new Date();
        filterDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        filterDate = new Date();
        filterDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        filterDate = new Date();
        filterDate.setMonth(now.getMonth() - 1);
      } else if (period === 'custom' && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      if (filterDate) {
        history = history.filter((tx) => new Date(tx.date) >= filterDate!);
      } else if (start && end) {
        history = history.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= start! && txDate <= end!;
        });
      }
    }

    if (txnType && txnType !== 'all') {
      history = history.filter((tx) => tx.type === txnType);
    }

    const filteredCredits = history
      .filter((tx) => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const filteredDebits = history
      .filter((tx) => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const total = history.length;

    history = history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice((page - 1) * limit, page * limit);

    return {
      history,
      total,
      balance: wallet.balance,
      filteredCredits,
      filteredDebits,
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
