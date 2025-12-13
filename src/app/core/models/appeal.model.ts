import { AppealType } from "../../features/appeals/enums/appeal-type.enum";

export enum AppealStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3
}

export interface SubmitAppealRequest {
  appealType: AppealType;
  reason: string;
}

export interface SubmitAppealResponse {
  message: string;
  appealId: string;
  submittedAt: Date;
}

export interface Appeal {
  id: string;
  appealType: AppealType;
  reason: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  adminResponse?:string
}

export interface MyAppealsResponse {
  totalCount: number;
  appeals: Appeal[];
}