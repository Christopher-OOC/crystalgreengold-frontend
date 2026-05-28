export interface DashboardMetrics {
  // Financial Metrics
  available_balance: number;
  awaiting_wallet: number;
  cashback?: number;
  daily_binary_earning: number;
  
  // Binary PV/BV Stats
  binary_left_pv: number;
  binary_right_pv: number;
  total_left_bv: number;
  total_right_bv: number;
  total_left_pv?: number;
  total_right_pv?: number;
  
  // Monthly Stats
  monthly_left_pv: number;
  monthly_right_pv: number;
  monthly_sales_pv?: number;
  
  // Membership info
  rank_id: number | null;
  count_newly_registered_on_monthly_weaker_leg: number;
  
  // Network Structure (snake_case from API)
  sponsor_id: number | string | null;
  placer_id: number | string | null;
  left_leg_id: number | string | null;
  right_leg_id: number | string | null;
  sponsor_name?: string;
  placer_name?: string;
  left_leg_name?: string;
  right_leg_name?: string;

  // Network Structure (camelCase normalization)
  sponsorId?: number | string;
  placerId?: number | string;
  leftLegId?: number | string;
  rightLegId?: number | string;
  sponsorUsername?: string;
  placerUsername?: string;
  leftLegUsername?: string;
  rightLegUsername?: string;
}

export interface NetworkStructureProps {
  data: DashboardMetrics | null;
}

export interface FinancialMetricsProps {
  data: DashboardMetrics | null;
}