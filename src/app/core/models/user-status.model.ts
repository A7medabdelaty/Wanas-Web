export interface UserStatus {
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  
  isSuspended: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  
  isActive: boolean;
}