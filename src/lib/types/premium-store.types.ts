export interface PremiumStore {
  id: string;
  memberId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  businessName?: string;
  storeDescription?: string;
  image?: string;
  enabled: boolean;
  availableBalance: number;
  totalSales?: number;
  totalOrders?: number;
  rating?: number;
  registeredOn?: string;
  sponsorUsername?: string;
  placerUsername?: string;
}

export interface CreatePremiumStoreRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  sponsorId?: string;
  placementId?: string;
  leg?: 'LEFT' | 'RIGHT';
}

export interface UpdatePremiumStoreRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  storeDescription?: string;
  image?: string;
}
