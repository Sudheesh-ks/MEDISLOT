import { WalletDTO } from '../dtos/Wallet.dto';
import { WalletDocument } from '../models/WalletModel';

export const toWalletDTO = (wallet: WalletDocument): WalletDTO => ({
  ownerId: wallet.ownerId.toString(),
  ownerType: wallet.ownerType,
  balance: wallet.balance,
  history: wallet.history.map((entry) => ({
    type: entry.type,
    amount: entry.amount,
    reason: entry.reason,
    date: entry.date,
  })),
});
