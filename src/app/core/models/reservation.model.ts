// Reservation-related models and DTOs

export interface CreateReservationRequest {
    listingId: number;
    bedIds: number[];
    startDate: string;       // ISO date format (YYYY-MM-DD)
    durationInDays: number;  // 15 or 30
}

export interface ReservationResponse {
    reservationId: number;
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
