export type SoulStatus = 'New' | 'Contacted' | 'Follow-up' | 'Joined Church';

export interface Soul {
  id: string;
  fullName: string;
  phoneNumber: string;
  location: string;
  date: string;
  status: SoulStatus;
  createdByUid: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminRecord {
  email: string;
  role: 'admin' | 'super_admin';
  addedBy?: string;
  addedAt?: any;
}
