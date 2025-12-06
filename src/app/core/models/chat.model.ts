// Chat Models
export interface Chat {
    id: string | number; // Backend sends number, convert to string if needed
    chatName?: string; // Backend uses 'chatName' not 'name'
    isGroup?: boolean; // Backend includes this
    createdAt?: Date;
    updatedAt?: Date;
    participants: Participant[];
    lastMessage?: Message;
    unreadCount?: number;
    photoUrl?: string;

    // For backward compatibility
    name?: string;
}

export interface ChatDetails {
    id: string | number;
    chatName?: string;
    isGroup?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    participants: Participant[];
    messages: Message[];
    listingId?: number;
    ownerId?: string;

    // For backward compatibility
    name?: string;
}

export interface Message {
    id: string | number; // Backend sends number
    chatId: string | number; // Backend sends number
    senderId: string;
    content: string;
    sentAt: Date | string; // Backend sends ISO string
    isRead?: boolean; // Optional - backend may not send this
    readAt?: Date;
    senderName?: string;
    senderPhotoUrl?: string;
    isTransient?: boolean; // Backend sends this for echo messages
}

export interface Participant {
    userId: string;
    userName?: string | null;
    displayName?: string | null;
    photoUrl?: string;
    joinedAt?: Date;
    isOnline?: boolean;
}

export interface ChatSummary {
    id: string;
    name?: string;
    participantName: string;
    participantPhotoUrl?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    isOnline?: boolean;
}

// Request DTOs
export interface CreateChatRequest {
    name?: string;
    participantId: string;
    isGroup?: boolean;
}

export interface UpdateChatRequest {
    name: string;
}

export interface SendMessageRequest {
    chatId: string;
    senderId: string;
    content: string;
}

export interface EditMessageRequest {
    messageId: string;
    content: string;
}

export interface AddParticipantRequest {
    chatId: string;
    userId: string;
}

// Response DTOs
export interface CreateChatResponse {
    id: string;
    name?: string;
    createdAt: Date;
}

export interface UnreadCountResponse {
    count: number;
}

// SignalR Event Models
export interface SignalRMessageEvent {
    chatId: string;
    senderId: string;
    content: string;
    sentAt: Date;
}

export interface SignalRUserEvent {
    userId: string;
    connectionId?: string;
}

export interface SignalRChatEvent {
    chatId: string;
    connectionId: string;
}

// Booking Approval Models
export interface ApprovalStatusDto {
    listingId: number;
    userId: string;
    canChat: boolean;
    canJoinGroup: boolean;
    canPay: boolean;
    isGroupApproved: boolean;
    isPaymentApproved: boolean;
}

export interface PaymentApprovalRequest {
    listingId: number;
    ownerId: string;
    userId: string;
}

export interface ChatDto {
    id: number;
    isGroup: boolean;
    chatName: string;
    listingId?: number;
    participants: ChatParticipantDto[];
}

export interface ChatParticipantDto {
    userId: string;
    userName?: string;
    displayName?: string;
    photoUrl?: string;
}

// Notification Event Models
export interface NotificationMessage {
    message: string;
    timestamp: Date;
}

export interface TypingIndicatorEvent {
    chatId: number;
    userId: string;
    userName?: string;
}

export interface UserStatusEvent {
    userId: string;
    isOnline: boolean;
    timestamp: Date;
}

export interface ListingNotificationEvent {
    listingId: number;
    timestamp: Date;
}

export interface ReservationNotificationEvent {
    reservationId: number;
    timestamp: Date;
}

export interface PaymentNotificationEvent {
    listingId: number;
}

export interface GroupApprovalEvent {
    chatId: number;
    userId: string;
}

export interface ParticipantEvent {
    chatId: number;
    userId: string;
}

export interface MessageDeletedEvent {
    chatId: number;
    messageId: number;
}

export interface MessageReadEvent {
    chatId: number;
    messageId: number;
    userId: string;
}

