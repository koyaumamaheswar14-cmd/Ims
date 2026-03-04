export type UserRole = 'admin' | 'manager' | 'user' | 'editor' | 'viewer' | 'auditor' | 'support' | 'billing';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'invited';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['all'],
  manager: ['view_dashboard', 'view_users', 'view_audit', 'manage_content', 'view_orgs'],
  editor: ['view_dashboard', 'manage_content'],
  user: ['view_dashboard'],
  viewer: ['view_dashboard'],
  auditor: ['view_dashboard', 'view_audit'],
  support: ['view_dashboard', 'view_users'],
  billing: ['view_dashboard', 'manage_billing'],
};

export interface Organization {
  id: string;
  name: string;
  domain: string;
  createdAt: number;
  status: 'active' | 'suspended' | 'archived';
  tier?: 'free' | 'pro' | 'enterprise';
  region?: string;
  userCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  status: AccountStatus;
  orgId?: string;
  createdAt: number;
  lastLoginAt: number;
  lastIp?: string;
  invitedBy?: string;
  mfaEnabled?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  orgId?: string;
}

export interface UserInvite {
  id: string;
  email: string;
  roles: UserRole[];
  orgId: string;
  invitedBy: string;
  invitedAt: number;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: number;
  token?: string;
}
