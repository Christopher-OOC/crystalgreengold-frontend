// types/category.types.ts
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}
export interface CreateCategoryRequest { name: string; description?: string; imageUrl?: string; }
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// ─────────────────────────────────────────────────────────────────────────────
// types/rank.types.ts
export interface Rank {
  id: string;
  name: string;
  level: number;             // e.g. 1 = lowest rank
  requiredPoints?: number;
  benefits?: string[];
}
export interface CreateRankRequest { name: string; level: number; requiredPoints?: number; }
export interface UpdateRankRequest extends Partial<CreateRankRequest> {}

// ─────────────────────────────────────────────────────────────────────────────
// types/promotion.types.ts
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}
export interface CreatePromotionRequest { title: string; description?: string; imageUrl?: string; startDate?: string; endDate?: string; }
export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {}

export interface EarnedPromo {
  id: string;
  memberId: string;
  promotionId: string;
  promotion?: Promotion;
  earnedAt?: string;
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// types/bonus.types.ts
export type BonusType =
  | 'REFERRAL_BONUS'
  | 'MATCHING_BONUS'
  | 'LEADERSHIP_BONUS'
  | 'UNILEVEL_BONUS'
  | 'FLUSH_OUT_BONUS'; // adjust to match your commission structure

export interface Bonus {
  id: string;
  memberId: string;
  type: BonusType;
  amount: number;
  description?: string;
  status?: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// types/transaction.types.ts
export type TransactionType =
  | 'TRANSFER'
  | 'PURCHASE'
  | 'BONUS'
  | 'WITHDRAWAL'
  | 'REFUND';

export interface Transaction {
  id: string;
  memberId: string;
  type: TransactionType;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  reference?: string;
  description?: string;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// types/payment.types.ts
export interface Bank {
  code: string;
  name: string;
}

export interface Payroll {
  id?: string;
  entries: PayrollEntry[];
  totalAmount: number;
  status?: string;
  createdAt?: string;
}

export interface PayrollEntry {
  id: string;
  memberId: string;
  memberName?: string;
  accountNumber?: string;
  bankCode?: string;
  amount: number;
}

export interface Payment {
  payrollId?: string;
  entries?: PayrollEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// types/admin.types.ts
export interface AdminSettings {
  id: string;
  name: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

export interface UpdateAdminSettingsRequest {
  value: string;
}

export interface UpdateMemberAdminRequest {
  memberType?: string;
  status?: string;
  canReceivePayment?: boolean;
  [key: string]: unknown;   // flexible — admin can update arbitrary fields
}