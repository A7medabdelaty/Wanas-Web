// Chat Models
export interface Chat {
    id: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
    participants: Participant[];
    lastMessage?: Message;
    unreadCount?: number;
    photoUrl?: string;
}

export interface ChatDetails {
    id: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
    participants: Participant[];
    messages: Message[];
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    sentAt: Date;
    isRead: boolean;
    readAt?: Date;
    senderName?: string;
    senderPhotoUrl?: string;
}

export interface Participant {
    userId: string;
    fullName: string;
    photoURL?: string;
    joinedAt: Date;
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
    participantIds: string[];
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
