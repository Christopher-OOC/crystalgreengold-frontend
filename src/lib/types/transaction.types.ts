export interface Transaction {
  id: string;
  memberId: string;
  type: string; // e.g., "credit", "debit"
  amount: number;
  reference?: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CONFIRMED" | "NOT_CONFIRMED";
  createdAt?: string;
  updatedAt?: string;
}
