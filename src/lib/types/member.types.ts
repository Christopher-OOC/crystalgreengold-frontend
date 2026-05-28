// types/member.types.ts

// ── Enums ───────────────────────────────────────────────

export type MemberType =
  | 'REGULAR_MEMBER'
  | 'SERVICE_CENTER'
  | 'PREMIUM_STORE'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type MemberStatus =
  | 'ACTIVE' 
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING';

// ── Core Member ─────────────────────────────────────────

export interface Member {
  id: string;
  memberId?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;          // computed backend field
  email?: string;
  phone_number?: string;
  phoneNumber?: string;       // optional for enterprise consistency
  address?: string; 
  packageId?: string;
  sponsorId?: string;
  placementId?: string;
  leg?: 'LEFT' | 'RIGHT';     // classic MLM binary tree
  parentId?: string;          // enterprise upline
  balance?: number;
  availableBalance?: number;
  walletBalance?: number;
  canReceivePayment?: boolean;
  memberType?: MemberType;
  status?: MemberStatus;
  enabled?: boolean;
  isActive?: boolean;         // classic boolean flag
  isServiceCenter?: boolean;  // legacy flag
  isPremiumStore?: boolean;   // legacy flag
  profileImageUrl?: string;
  rankId?: string;
  rank?: Rank | string;
  roles?: ({ id?: number | string; name?: string; authority?: string } | string)[];
  referralCode?: string;
  createdAt?: string;
  registered_on?: string;
  updatedAt?: string;
}

// ── Requests ────────────────────────────────────────────

export interface CreateMemberRequest {
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone_number?: string;
  phoneNumber?: string;
  address?: string;
  memberType?: MemberType;
  parentId?: string;
  sponsorId?: string;
  placementId?: string;
  leg?: 'LEFT' | 'RIGHT';
  referralCode?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
}

// ── Financial Actions ───────────────────────────────────

export interface TransferFundsRequest {
  toMemberId?: string;        // classic MLM
  recipientUsername?: string; // enterprise
  amount: number;
  description?: string;
  note?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;       // classic
  currentPassword?: string;   // enterprise
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  username?: string;
}

// ── Packages ────────────────────────────────────────────

export interface BuyPackageRequest {
  packageId: string;
  quantity?: number;          // optional enterprise field
}

export interface ActivatePackageRequest {
  packageId: string;
}

// ── Store Info ──────────────────────────────────────────

export interface AddStoreInfoRequest {
  storeName: string;
  storeDescription?: string;
  storeAddress?: string;
  storePhone?: string;
  storePhoneNumber?: string;  // optional enterprise
}

// ── Banking ─────────────────────────────────────────────

export interface AddAccountDetailsRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

export interface AccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  id?: string;
  memberId?: string;
}

// ── Genealogy / MLM Tree ────────────────────────────────

export interface GenealogyNode {
  id: string;
  username: string;
  fullName?: string;
  memberType?: MemberType;
  status?: MemberStatus;
  left?: GenealogyNode | null;
  right?: GenealogyNode | null;
  leftMemberId?: string;      // enterprise
  rightMemberId?: string;     // enterprise
  depth?: number;
}

// ── Analysis / Stats ────────────────────────────────────

export interface AnalysisData {
  memberId?: string;
  totalDownlines?: number;
  leftLegCount?: number;
  rightLegCount?: number;
  totalSales?: number;
  totalEarnings?: number;
  currentRank?: string;
}

// ── Roots / Tree Placement ──────────────────────────────

export interface AddRootsRequest {
  sponsorId?: string;         // classic
  placementId?: string;       // classic
  leg?: 'LEFT' | 'RIGHT';     // classic
  leftMemberId?: string;      // enterprise
  rightMemberId?: string;     // enterprise
}

// avoid circular import
import type { Rank } from '@/lib/types/rank.types';
