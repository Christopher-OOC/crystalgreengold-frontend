import type { AccountDetails } from '@/lib/types/member.types';

export interface ServiceCenter {
  id?: string;
  serviceCenterId?: string;
  memberId: string;
  name?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  storeDescription?: string;
  image?: string;
  sponsorId?: string;
  placerId?: string;
  sponsorUsername?: string;
  placerUsername?: string;
  registeredOn?: string;
  enabled: boolean;
  canReceivePayment: boolean;
   profileImageUrl?: string;
  availableBalance: number;
  accountDetails?: AccountDetails;
  roles?: { id: number; name: string }[];
}

// src/types/service-center.types.ts
export interface CreateServiceCenterRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  address: string;
  businessName: string;
  sponsorId?: string;      // This goes to query param 'sponsor'
  placementId?: string;    // This goes to query param 'placer'
  leg?: 'LEFT' | 'RIGHT';  // This goes to query param 'leg'
}

export interface UpdateServiceCenterRequest {
  businessName?: string;
  storeDescription?: string;
  address?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}
