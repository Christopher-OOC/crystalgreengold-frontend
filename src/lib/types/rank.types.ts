// // types/rank.types.ts

// // ── Rank ───────────────────────────────────────────────

// export interface Rank {
//   id: string;
//   name: string; 
//   level: number;           // numeric rank level
//   bonusPercentage?: number; // e.g., commission or reward percentage
//   description?: string;
//   isActive?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// // ── Requests ───────────────────────────────────────────

// export interface CreateRankRequest {
//   name: string;
//   level: number;
//   bonusPercentage?: number;
//   description?: string;
//   isActive?: boolean;
// }

// export interface UpdateRankRequest {
//   name?: string;
//   level?: number;
//   bonusPercentage?: number;
//   description?: string;
//   isActive?: boolean;
// }


export interface Rank {
  id: number;
  name: string;
  prize: number;
  qualifyingBv: number;
  rankValue: number;
}

export interface CreateRankRequest {
  name: string;
  prize: number;
  qualifyingBv: number;
  rankValue: number;
}

export interface UpdateRankRequest {
  name?: string;
  prize?: number;
  qualifyingBv?: number;
  rankValue?: number;
}