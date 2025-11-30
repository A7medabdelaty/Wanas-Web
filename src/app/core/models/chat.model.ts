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
