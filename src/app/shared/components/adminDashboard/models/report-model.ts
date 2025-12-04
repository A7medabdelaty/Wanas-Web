// Enums mirrored from backend (numeric values)
export enum ReportTarget {
    User = 0,
    Listing = 1
}

export enum ReportCategory {
    Spam = 0,
    SensitiveContent = 1,
    Harassment = 2,
    Violence = 3,
    Offense = 4,
    Other = 5
}

export enum ReportStatus {
    Pending = 0,
    Reviewed = 1,
    Resolved = 2,
    Rejected = 3
}

export enum ReportSeverity {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

export interface ReportModel {
    reportId: number;
    reorterId: string; // Note: spelling follows backend DTO

    targetType: ReportTarget;
    targetId: string;
    category: ReportCategory;

    reason: string;
    createdAt: string; // ISO date string from API

    status: ReportStatus;
    photoUrls?: string[];

    // Admin visibility fields
    isEscalated: boolean;
    escalatedAt?: string | null; // ISO date string
    escalationReason?: string | null;
    reviewedByAdminId?: string | null;
    reviewedAt?: string | null; // ISO date string
    adminNote?: string | null;
    severity: ReportSeverity;
}






export interface SuspendResult {
    success: boolean;
    alreadySuspended: boolean;
    suspendedUntil: string | null;
}

export interface BanResult {
    success: boolean;
    alreadyBanned: boolean;
    message?: string;
    bannedAt?: string | null;
}