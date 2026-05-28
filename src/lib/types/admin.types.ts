export interface AdminSettings {
  id: string;
  name: string;
  value: string | number | boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateAdminSettingsRequest {
  name: string;
  value: string | number | boolean;
}

export interface UpdateMemberAdminRequest {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}