export enum ModerationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Removed = 3
}

export interface ListingModerationDto {
    listingId: number;
    moderationStatus: ModerationStatus;
    moderationNote?: string;
    isFlagged?: boolean;
    flagReason?: string;
    moderatedAt?: string;
    moderatedByAdminId?: string;
}
