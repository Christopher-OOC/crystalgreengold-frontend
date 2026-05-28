export interface Promotion {
  id: number;
  name: string;
  description: string;
  prize: number;
  targetPv: number;
  enabled: boolean;
  image?: string;
  endDate?: string;
}

export interface CreatePromotionRequest {
  name: string;
  description: string;
  prize: number;
  targetPv: number;
  enabled?: boolean;
}

export interface EarnedPromo {
  id: number;
  name: string;
  description?: string;
  prize: number;
  targetPv: number;
  image?: string;
  hasReceived: boolean;
  dateEarned?: string;
  member?: any;
}