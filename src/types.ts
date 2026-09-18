export type SoulStatus = 'New' | 'Contacted' | 'Follow-up' | 'Joined Church';

export interface Soul {
  id: string;
  fullName: string;
  phoneNumber: string;
  location: string;
  date: string; // YYYY-MM-DD
  status: SoulStatus;
  createdByUid: string;
  createdByEmail: string;
  createdByName: string;
  createdAt: number;
}

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUser {
  email: string;
  role: 'admin' | 'super_admin';
  assignedBy?: string;
  assignedAt?: number;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}
