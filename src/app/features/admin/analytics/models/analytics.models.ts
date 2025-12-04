export interface AnalyticsSummary {
    date: string;
    totalListings: number;
    pendingListings: number;
    approvedListings: number;
    rejectedListings: number;
    flaggedListings: number;
    activeUsers: number;
    requests: number;
}

export interface TrafficPoint {
    timestamp: string;
    path: string;
    method: string;
    authenticated: boolean;
}

export interface ModerationKpi {
    date: string;
    avgApprovalTimeHours: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    flaggedCount: number;
}
