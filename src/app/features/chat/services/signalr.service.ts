import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SignalRMessageEvent, SignalRUserEvent, SignalRChatEvent, Message } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth';

@Injectable({
    providedIn: 'root',
})
export class SignalRService {
    private hubConnection!: HubConnection;
    private hubUrl = environment.apiUrl.replace('/api', '/hubs/chat');

    // Observable streams for real-time events
    private messageReceivedSubject = new Subject<Message>();
    private userJoinedChatSubject = new Subject<SignalRChatEvent>();
    private userLeftChatSubject = new Subject<SignalRChatEvent>();
    private userDisconnectedSubject = new Subject<SignalRUserEvent>();
    private connectionStateSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);

    public messageReceived$ = this.messageReceivedSubject.asObservable();
    public userJoinedChat$ = this.userJoinedChatSubject.asObservable();
    public userLeftChat$ = this.userLeftChatSubject.asObservable();
    public userDisconnected$ = this.userDisconnectedSubject.asObservable();
    public connectionState$ = this.connectionStateSubject.asObservable();

    constructor(private authService: AuthService) { }

    // Initialize and start SignalR connection
    public async startConnection(): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        const token = this.authService.getToken();
        console.log('Starting SignalR connection with token:', token ? 'Token present' : 'No token');
        console.log('Hub URL:', this.hubUrl);

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.registerServerEvents();

        try {
            await this.hubConnection.start();
            console.log('✅ SignalR Connected. Connection ID:', this.hubConnection.connectionId);
            this.connectionStateSubject.next(this.hubConnection.state);
        } catch (err) {
            console.error('❌ Error starting SignalR connection:', err);
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

            const message: Message = {
                id: messageData.id || '',
                chatId: messageData.chatId,
                senderId: messageData.senderId,
                content: messageData.content,
                sentAt: new Date(messageData.sentAt),
                isRead: false,
                senderName: messageData.senderName,
                senderPhotoUrl: messageData.senderPhotoUrl
            };

            this.messageReceivedSubject.next(message);
        });

        // Handle user joined chat
        this.hubConnection.on('UserJoinedChat', (chatId: string, connectionId: string) => {
            console.log('👤 SignalR: UserJoinedChat event:', { chatId, connectionId });
            this.userJoinedChatSubject.next({ chatId, connectionId });
        });

        // Handle user left chat
        this.hubConnection.on('UserLeftChat', (chatId: string, connectionId: string) => {
            console.log('👋 SignalR: UserLeftChat event:', { chatId, connectionId });
            this.userLeftChatSubject.next({ chatId, connectionId });
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
                await this.hubConnection.invoke('JoinChatGroup', chatId);
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
                await this.hubConnection.invoke('LeaveChatGroup', chatId);
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
                // Send as a single object matching SendMessageRequest DTO
                await this.hubConnection.invoke('SendMessage', {
                    chatId,
                    senderId,
                    content: message
                });
                console.log('✅ Message sent via SignalR successfully');
            } catch (err) {
                console.error('❌ Error sending message via SignalR:', err);
            }
        } else {
            console.warn('Cannot send message: SignalR not connected. State:', this.hubConnection?.state);
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
