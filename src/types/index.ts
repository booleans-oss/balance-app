export type RecordingType = "INVOICE" | "WITHDRAWAL" | "TRANSFER" | "PAYMENT";
export enum RecordingColors {
  INVOICE = "bg-red-500",
  WITHDRAWAL = "bg-yellow-500",
  TRANSFER = "bg-green-500",
  PAYMENT = "bg-blue-500",
}

export type Recording = {
  date: Date;
  type: RecordingType;
  transactions: Transaction[];
};

export type TransactionType = "DEBIT" | "CREDIT";

export type Transaction = {
  type: TransactionType;
  accountNumber: string;
  amount: number;
};