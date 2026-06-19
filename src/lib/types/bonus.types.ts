export interface Bonus {
  id: string;
  memberId: string;
  commissionType: string; // e.g., "referral", "binary", "matching"
  amount: number;
  status: "PENDING" | "PAID";
  earnedDate?: string;  
  createdAt?: string;
  updatedAt?: string;
}