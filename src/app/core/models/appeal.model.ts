import { AppealType } from "../../features/appeals/appeal-type.enum";


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
  resolvedAt?: string;
}

export interface MyAppealsResponse {
  totalCount: number;
  appeals: Appeal[];
}