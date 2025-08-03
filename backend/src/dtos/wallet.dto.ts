export interface WalletDTO {
  ownerId: string;
  ownerType: "admin" | "doctor" | "user";
  balance: number;
  history: {
    type: "credit" | "debit";
    amount: number;
    reason?: string;
    date: Date;
  }[];
}
