export interface Bonus {
  id: string;
  memberId: string;
  type: string; // e.g., "referral", "binary", "matching"
  amount: number;
  status: "PENDING" | "PAID";
  createdAt?: string;
  updatedAt?: string;
}