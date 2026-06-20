export interface DashboardMetrics {
  // User Information
  memberId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  image: string | null;
  businessName: string | null;

  // Status
  enabled: boolean;
  canReceivePayment: boolean;
  registeredOn: string;
  lastActive: string | null;
  lastEarned: string | null;

  // Financial Metrics
  availableBalance: number;
  awaitingWallet: number;
  transactionWallet: number;
  cashback: number;
  dailyBinaryEarning: number;

  // Binary PV/BV Stats
  binaryLeftPv: number;
  binaryRightPv: number;
  totalLeftBv: number;
  totalRightBv: number;

  // Monthly Stats
  monthlyLeftPv?: number;
  monthlyRightPv?: number;
  monthlySalesPv?: number;

  // Membership
  rank: any | null;
  currentPackage: any | null;
  countNewlyRegisteredOnMonthlyWeakerLeg: number;

  // Network Structure
  sponsorId: string | null;
  sponsorUsername?: string;

  placerId: string | null;
  placerUsername?: string;

  leftLegId: string | null;
  leftLegUsername?: string;

  rightLegId: string | null;
  rightLegUsername?: string;

  // Other
  accountDetails: any | null;
  roles: any[];
}


export interface NetworkStructureProps {
  data: DashboardMetrics | null;
}

export interface FinancialMetricsProps {
  data: DashboardMetrics | null;
}