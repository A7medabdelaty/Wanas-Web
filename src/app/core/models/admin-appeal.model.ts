import { AppealStatus } from "../../features/appeals/enums/appeal-status.enum";
import { AppealType } from "../../features/appeals/enums/appeal-type.enum";

export interface AdminAppeal {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  appealType: AppealType;
  reason: string;
  status: AppealStatus;
  reviewedByAdminId?: string;
  adminResponse?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface AdminAppealsResponse {
  totalCount: number;
  appeals: AdminAppeal[];
}

export interface ReviewAppealRequest {
  isApproved: boolean;
  adminResponse?: string;
}

export interface ReviewAppealResponse {
  message: string;
  appealId: string;
  reviewedAt: Date;
}

// User action requests
export interface UnsuspendUserRequest {
  reason?: string;
}

export interface UnbanUserRequest {
  reason?: string;
}