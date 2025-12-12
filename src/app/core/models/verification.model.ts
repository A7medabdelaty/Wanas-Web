export enum VerificationStatusEnum {
    Pending = 0,
    UnderReview = 1,
    Approved = 2,
    Rejected = 3,
    Expired = 4
}

export enum DocumentType {
    NationalIdFront = 1,
    NationalIdBack = 2,
    SelfieWithId = 3
}

export interface VerificationDocument {
    id: string;
    documentType: DocumentType;
    status: VerificationStatusEnum;
    uploadedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
}


export interface VerificationStatus {
    hasSubmitted: boolean;
    isVerified: boolean;
    status?: VerificationStatusEnum;
    submittedAt?: Date;
    reviewedAt?: Date;
    documents: VerificationDocument[];
}

export interface UploadVerificationDocumentsRequest {
    nationalIdFront: File;
    nationalIdBack: File;
    selfieWithId: File;
}

export interface UploadVerificationDocumentsResponse {
    message: string;
    data: VerificationStatus;
}
