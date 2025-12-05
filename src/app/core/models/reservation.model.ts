// Reservation-related models and DTOs

export interface CreateReservationRequest {
    listingId: number;
    bedIds: number[];
    startDate: string;       // ISO date format (YYYY-MM-DD)
    durationInDays: number;  // 15 or 30
}

export interface ReservationResponse {
    id: number;              // Backend sends 'id', not 'reservationId'
    listingId: number;
    bedIds: number[];
    checkInDate: Date;
    checkOutDate: Date;
    totalAmount: number;
    status: string;
}

export interface DepositPaymentRequest {
    paymentToken: string;
    paymentMethod: string;
    amountPaid: number;
}

export interface DepositPaymentResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
}

export enum PaymentStatus {
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}

export interface ReservationDto {
    id: number;
    listingId: number;
    totalPrice: number;
    depositAmount: number;
    paymentStatus: PaymentStatus;
    bedIds: number[];
}

export interface BedDto {
    bedId: number;
    bedNumber: string;
    roomNumber: number;
}

export interface ReservationListItemDto {
    id: number;
    listingId: number;
    listingTitle: string;
    city: string;
    coverPhotoUrl: string;
    startDate: Date;
    durationInDays: number;
    totalPrice: number;
    paymentStatus: PaymentStatus;
    depositAmount?: number;
    createdAt: Date;
    paidAt?: Date;
    beds: BedDto[];
}
