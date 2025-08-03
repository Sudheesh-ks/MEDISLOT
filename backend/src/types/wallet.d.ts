export interface WalletHistory {
  type: "credit" | "debit";
  amount: number;
  reason?: string;
  date: Date;
}

export interface WalletTypes {
  ownerId: Types.ObjectId;
  ownerType: "user" | "doctor" | "admin";
  balance: number;
  history: WalletHistory[];
}