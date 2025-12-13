export interface PendingVerification {
  userId: string;
  userName: string;
  email: string;
  hasSubmitted: boolean;
  status: number;
  submittedAt: Date;
  documents: VerificationDocumentDto[];
}

export interface VerificationDocumentDto {
  documentType: number; // 1=Front, 2=Back, 3=Selfie
  id: string;
  status: number;
  rejectionReason?: string;
  reviewedAt?: Date;
  uploadedAt: Date;
}

export interface ReviewVerificationRequest {
  userId: string;
  status: number; // 2=Approved, 3=Rejected
  rejectionReason?: string | null;
}

export interface UnverifyUserRequest {
  reason?: string;
}