import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    SignalRUserEvent,
    SignalRChatEvent,
    Message,
    ChatDto,
    NotificationMessage,
    TypingIndicatorEvent,
    UserStatusEvent,
    ListingNotificationEvent,
    ReservationNotificationEvent,
    PaymentNotificationEvent,
    GroupApprovalEvent,
    ParticipantEvent,
    MessageDeletedEvent,
    MessageReadEvent
} from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth';

@Injectable({
    providedIn: 'root',
})
export class SignalRService {
    private hubConnection!: HubConnection;
    private hubUrl = environment.apiUrl.replace('/api', '/hubs/chat');

    // Observable streams for real-time events
    // Message events
    private messageReceivedSubject = new Subject<Message>();
    private messageDeletedSubject = new Subject<MessageDeletedEvent>();
    private messageReadSubject = new Subject<MessageReadEvent>();

    // Chat events
    private chatCreatedSubject = new Subject<ChatDto>();
    private chatUpdatedSubject = new Subject<ChatDto>();
    private chatDeletedSubject = new Subject<number>();
    private userJoinedChatSubject = new Subject<SignalRChatEvent>();
    private userLeftChatSubject = new Subject<SignalRChatEvent>();

    // Participant events
    private participantAddedSubject = new Subject<ParticipantEvent>();
    private participantRemovedSubject = new Subject<ParticipantEvent>();

    // Payment/Group approval events
    private paymentApprovedSubject = new Subject<PaymentNotificationEvent>();
    private groupApprovedSubject = new Subject<GroupApprovalEvent>();

    // Notification events
    private ownerNotificationSubject = new Subject<NotificationMessage>();
    private userNotificationSubject = new Subject<NotificationMessage>();

    // Typing indicator events
    private userTypingSubject = new Subject<TypingIndicatorEvent>();
    private userStoppedTypingSubject = new Subject<TypingIndicatorEvent>();

    // Presence events
    private userStatusChangedSubject = new Subject<UserStatusEvent>();

    // Listing events
    private listingUpdatedSubject = new Subject<ListingNotificationEvent>();

    // Reservation events
    private reservationCreatedSubject = new Subject<ReservationNotificationEvent>();
    private reservationUpdatedSubject = new Subject<ReservationNotificationEvent>();
    private reservationCancelledSubject = new Subject<ReservationNotificationEvent>();

    // Connection state
    private userDisconnectedSubject = new Subject<SignalRUserEvent>();
    private connectionStateSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);

    // Public observables
    public messageReceived$ = this.messageReceivedSubject.asObservable();
    public messageDeleted$ = this.messageDeletedSubject.asObservable();
    public messageRead$ = this.messageReadSubject.asObservable();

    public chatCreated$ = this.chatCreatedSubject.asObservable();
    public chatUpdated$ = this.chatUpdatedSubject.asObservable();
    public chatDeleted$ = this.chatDeletedSubject.asObservable();
    public userJoinedChat$ = this.userJoinedChatSubject.asObservable();
    public userLeftChat$ = this.userLeftChatSubject.asObservable();

    public participantAdded$ = this.participantAddedSubject.asObservable();
    public participantRemoved$ = this.participantRemovedSubject.asObservable();

    public paymentApproved$ = this.paymentApprovedSubject.asObservable();
    public groupApproved$ = this.groupApprovedSubject.asObservable();

    public ownerNotification$ = this.ownerNotificationSubject.asObservable();
    public userNotification$ = this.userNotificationSubject.asObservable();

    public userTyping$ = this.userTypingSubject.asObservable();
    public userStoppedTyping$ = this.userStoppedTypingSubject.asObservable();

    public userStatusChanged$ = this.userStatusChangedSubject.asObservable();

    public listingUpdated$ = this.listingUpdatedSubject.asObservable();

    public reservationCreated$ = this.reservationCreatedSubject.asObservable();
    public reservationUpdated$ = this.reservationUpdatedSubject.asObservable();
    public reservationCancelled$ = this.reservationCancelledSubject.asObservable();

    public userDisconnected$ = this.userDisconnectedSubject.asObservable();
    public connectionState$ = this.connectionStateSubject.asObservable();

    constructor(private authService: AuthService) { }

    // Initialize and start SignalR connection
    public async startConnection(): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        console.log('🔌 Starting SignalR connection...');
        console.log('📍 Hub URL:', this.hubUrl);

        // Check if user is authenticated
        const token = this.authService.getToken();
        if (!token) {
            console.error('❌ No authentication token found. User must be logged in.');
            return;
        }

        console.log('✅ Token present:', token.substring(0, 20) + '...');

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                // IMPORTANT: Function returns fresh token on each request
                accessTokenFactory: () => {
                    const currentToken = this.authService.getToken();
                    console.log('🔑 Fetching token for SignalR:', currentToken ? 'Token available' : 'No token');
                    return currentToken || '';
                },
                // Use WebSockets as primary transport
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.registerServerEvents();

        try {
            await this.hubConnection.start();
            console.log('✅ SignalR Connected Successfully!');
            console.log('🆔 Connection ID:', this.hubConnection.connectionId);
            console.log('👤 User:', this.authService.getUserInfo()?.email);
            this.connectionStateSubject.next(this.hubConnection.state);
        } catch (err: any) {
            console.error('❌ Error starting SignalR connection:', err);
            console.error('📋 Error details:', err.message);
            console.error('🔍 Stack trace:', err.stack);
            this.connectionStateSubject.next(HubConnectionState.Disconnected);
            // Retry after 5 seconds
            setTimeout(() => this.startConnection(), 5000);
        }

        // Handle reconnection events
        this.hubConnection.onreconnecting((error) => {
            console.log('🔄 SignalR Reconnecting...', error);
            this.connectionStateSubject.next(HubConnectionState.Reconnecting);
        });

        this.hubConnection.onreconnected((connectionId) => {
            console.log('✅ SignalR Reconnected. New Connection ID:', connectionId);
            this.connectionStateSubject.next(HubConnectionState.Connected);
        });

        this.hubConnection.onclose((error) => {
            console.log('🔌 SignalR Connection Closed', error);
            this.connectionStateSubject.next(HubConnectionState.Disconnected);
        });
    }

    // Stop SignalR connection
    public async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            console.log('🔌 SignalR Disconnected');
            this.connectionStateSubject.next(HubConnectionState.Disconnected);
        }
    }

    // Register server-to-client event handlers
    private registerServerEvents(): void {
        // Handle connection confirmation
        this.hubConnection.on('Connected', (message: string) => {
            console.log('📡 SignalR Connected Event:', message);
        });

        // Handle new message received
        this.hubConnection.on('ReceiveMessage', (messageData: any) => {
            console.log('📨 SignalR: ReceiveMessage event received:', messageData);

            // Handle both camelCase and PascalCase from backend
            const message: Message = {
                id: messageData.id || messageData.Id || '',
                chatId: messageData.chatId || messageData.ChatId,
                senderId: messageData.senderId || messageData.SenderId,
                content: messageData.content || messageData.Content,
                sentAt: new Date(messageData.sentAt || messageData.SentAt),
                isRead: false,
                senderName: messageData.senderName || messageData.SenderName,
                senderPhotoUrl: messageData.senderPhotoUrl || messageData.SenderPhotoUrl,
                isTransient: messageData.isTransient || messageData.IsTransient
            };

            console.log('🔄 Mapped Message:', message);
            this.messageReceivedSubject.next(message);
        });

        // Handle user joined chat - Backend sends object { UserId, ChatId }
        this.hubConnection.on('UserJoinedChat', (data: any) => {
            console.log('👤 SignalR: UserJoinedChat event:', data);
            this.userJoinedChatSubject.next({ chatId: String(data.chatId), connectionId: data.userId });
        });

        // Handle user left chat - Backend sends object { UserId, ChatId }
        this.hubConnection.on('UserLeftChat', (data: any) => {
            console.log('👋 SignalR: UserLeftChat event:', data);
            this.userLeftChatSubject.next({ chatId: String(data.chatId), connectionId: data.userId });
        });

        // Handle message read status
        this.hubConnection.on('MessageRead', (data: any) => {
            console.log('👀 SignalR: MessageRead event:', data);
            this.messageReadSubject.next({
                chatId: data.chatId || data.ChatId,
                messageId: data.messageId || data.MessageId,
                userId: data.userId || data.UserId
            });
        });

        // Handle message deleted
        this.hubConnection.on('MessageDeleted', (data: any) => {
            console.log('🗑️ SignalR: MessageDeleted event:', data);
            this.messageDeletedSubject.next({
                chatId: data.chatId || data.ChatId,
                messageId: data.messageId || data.MessageId
            });
        });

        // Handle chat created
        this.hubConnection.on('ChatCreated', (chat: any) => {
            console.log('💬 SignalR: ChatCreated event:', chat);
            this.chatCreatedSubject.next(chat);
        });

        // Handle chat updated
        this.hubConnection.on('ChatUpdated', (chat: any) => {
            console.log('✏️ SignalR: ChatUpdated event:', chat);
            this.chatUpdatedSubject.next(chat);
        });

        // Handle chat deleted
        this.hubConnection.on('ChatDeleted', (chatId: number) => {
            console.log('❌ SignalR: ChatDeleted event:', chatId);
            this.chatDeletedSubject.next(chatId);
        });

        // Handle participant added
        this.hubConnection.on('ParticipantAdded', (data: any) => {
            console.log('➕ SignalR: ParticipantAdded event:', data);
            this.participantAddedSubject.next({
                chatId: data.chatId || data.ChatId,
                userId: data.userId || data.UserId
            });
        });

        // Handle participant removed
        this.hubConnection.on('ParticipantRemoved', (data: any) => {
            console.log('➖ SignalR: ParticipantRemoved event:', data);
            this.participantRemovedSubject.next({
                chatId: data.chatId || data.ChatId,
                userId: data.userId || data.UserId
            });
        });

        // Handle payment approved
        this.hubConnection.on('PaymentApproved', (data: any) => {
            console.log('💳 SignalR: PaymentApproved event:', data);
            this.paymentApprovedSubject.next({
                listingId: data.listingId || data.ListingId
            });
        });

        // Handle group join approved
        this.hubConnection.on('GroupJoinApproved', (data: any) => {
            console.log('✅ SignalR: GroupJoinApproved event:', data);
            this.groupApprovedSubject.next({
                chatId: data.chatId || data.ChatId,
                userId: data.userId || data.UserId
            });
        });

        // Handle owner notifications
        this.hubConnection.on('OwnerNotification', (data: any) => {
            console.log('📢 SignalR: OwnerNotification event:', data);
            this.ownerNotificationSubject.next({
                message: data.message || data.Message,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle user notifications
        this.hubConnection.on('UserNotification', (data: any) => {
            console.log('🔔 SignalR: UserNotification event:', data);
            this.userNotificationSubject.next({
                message: data.message || data.Message,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle user typing
        this.hubConnection.on('UserTyping', (data: any) => {
            console.log('⌨️ SignalR: UserTyping event:', data);
            this.userTypingSubject.next({
                chatId: data.chatId || data.ChatId,
                userId: data.userId || data.UserId,
                userName: data.userName || data.UserName
            });
        });

        // Handle user stopped typing
        this.hubConnection.on('UserStoppedTyping', (data: any) => {
            console.log('⏹️ SignalR: UserStoppedTyping event:', data);
            this.userStoppedTypingSubject.next({
                chatId: data.chatId || data.ChatId,
                userId: data.userId || data.UserId
            });
        });

        // Handle user status changed
        this.hubConnection.on('UserStatusChanged', (data: any) => {
            console.log('🟢 SignalR: UserStatusChanged event:', data);
            this.userStatusChangedSubject.next({
                userId: data.userId || data.UserId,
                isOnline: data.isOnline || data.IsOnline,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle listing updated
        this.hubConnection.on('ListingUpdated', (data: any) => {
            console.log('🏠 SignalR: ListingUpdated event:', data);
            this.listingUpdatedSubject.next({
                listingId: data.listingId || data.ListingId,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle reservation created
        this.hubConnection.on('ReservationCreated', (data: any) => {
            console.log('📅 SignalR: ReservationCreated event:', data);
            this.reservationCreatedSubject.next({
                reservationId: data.reservationId || data.ReservationId,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle reservation updated
        this.hubConnection.on('ReservationUpdated', (data: any) => {
            console.log('✏️ SignalR: ReservationUpdated event:', data);
            this.reservationUpdatedSubject.next({
                reservationId: data.reservationId || data.ReservationId,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle reservation cancelled
        this.hubConnection.on('ReservationCancelled', (data: any) => {
            console.log('🚫 SignalR: ReservationCancelled event:', data);
            this.reservationCancelledSubject.next({
                reservationId: data.reservationId || data.ReservationId,
                timestamp: new Date(data.timestamp || data.Timestamp)
            });
        });

        // Handle user disconnected
        this.hubConnection.on('UserDisconnected', (userId: string) => {
            console.log('🔴 SignalR: UserDisconnected event:', userId);
            this.userDisconnectedSubject.next({ userId });
        });
    }

    // Client-to-server methods

    // Join a specific chat group
    public async joinChatGroup(chatId: string): Promise<void> {
        console.log('Attempting to join chat group:', chatId);
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                // Convert chatId to number for backend
                await this.hubConnection.invoke('JoinChatGroup', parseInt(chatId, 10));
                console.log('✅ Joined chat group successfully:', chatId);
            } catch (err) {
                console.error('❌ Error joining chat group:', err);
            }
        } else {
            console.warn('Cannot join chat group: SignalR not connected. State:', this.hubConnection?.state);
        }
    }

    // Leave a specific chat group
    public async leaveChatGroup(chatId: string): Promise<void> {
        console.log('Attempting to leave chat group:', chatId);
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                // Convert chatId to number for backend
                await this.hubConnection.invoke('LeaveChatGroup', parseInt(chatId, 10));
                console.log('✅ Left chat group successfully:', chatId);
            } catch (err) {
                console.error('❌ Error leaving chat group:', err);
            }
        } else {
            console.warn('Cannot leave chat group: SignalR not connected. State:', this.hubConnection?.state);
        }
    }

    // Send message via SignalR (for real-time delivery)
    public async sendMessage(chatId: string, senderId: string, message: string): Promise<void> {
        console.log('Attempting to send message via SignalR:', { chatId, senderId, message });
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                // Match backend method: SendMessageToGroup(int chatId, string content)
                await this.hubConnection.invoke('SendMessageToGroup', parseInt(chatId, 10), message);
                console.log('✅ Message sent via SignalR successfully');
            } catch (err) {
                console.error('❌ Error sending message via SignalR:', err);
            }
        } else {
            console.warn('Cannot send message: SignalR not connected. State:', this.hubConnection?.state);
        }
    }

    // Broadcast message read status
    public async broadcastMessageRead(chatId: string, messageId: string): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                // Match backend method: BroadcastMessageRead(int chatId, int messageId)
                await this.hubConnection.invoke('BroadcastMessageRead', parseInt(chatId, 10), parseInt(messageId, 10));
                console.log('✅ Message read broadcast sent:', { chatId, messageId });
            } catch (err) {
                console.error('❌ Error broadcasting message read:', err);
            }
        }
    }

    /**
     * Notify that user started typing in a chat
     */
    public async notifyTyping(chatId: number): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                await this.hubConnection.invoke('NotifyTyping', chatId);
                console.log('✅ Typing notification sent for chat:', chatId);
            } catch (err) {
                console.error('❌ Error sending typing notification:', err);
            }
        } else {
            console.warn('Cannot send typing notification: SignalR not connected');
        }
    }

    /**
     * Notify that user stopped typing in a chat
     */
    public async notifyStoppedTyping(chatId: number): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            try {
                await this.hubConnection.invoke('NotifyStoppedTyping', chatId);
                console.log('✅ Stopped typing notification sent for chat:', chatId);
            } catch (err) {
                console.error('❌ Error sending stopped typing notification:', err);
            }
        } else {
            console.warn('Cannot send stopped typing notification: SignalR not connected');
        }
    }

    // Check if connected
    public isConnected(): boolean {
        return this.hubConnection?.state === HubConnectionState.Connected;
    }

    // Get connection state
    public getConnectionState(): HubConnectionState {
        return this.hubConnection?.state || HubConnectionState.Disconnected;
    }
}

