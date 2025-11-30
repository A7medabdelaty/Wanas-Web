import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../services/chat';
import { MessageService } from '../services/message.service';
import { SignalRService } from '../services/signalr.service';
import { ChatDetails, Message, Participant } from '../../../core/models/chat.model';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css']
})
export class ChatRoom implements OnInit, OnDestroy, OnChanges {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @Input('chatId') activeChatId: string = '';
  @Output() back = new EventEmitter<void>();

  chat: ChatDetails | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  loading: boolean = true;
  sending: boolean = false;
  error: string = '';
  otherParticipant: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private signalRService: SignalRService,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    const user = this.authService.getUserInfo();
    if (user) {
      this.currentUserId = user.id;
    }

    if (this.activeChatId) {
      await this.initializeChat();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['activeChatId'] && !changes['activeChatId'].firstChange) {
      // Leave previous chat
      if (changes['activeChatId'].previousValue) {
        await this.signalRService.leaveChatGroup(changes['activeChatId'].previousValue);
      }

      // Initialize new chat
      if (this.activeChatId) {
        this.messages = [];
        this.chat = null;
        await this.initializeChat();
      }
    }
  }

  async ngOnDestroy(): Promise<void> {
    // Leave chat group when component is destroyed
    if (this.activeChatId) {
      await this.signalRService.leaveChatGroup(this.activeChatId);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeChat(): Promise<void> {
    // Start SignalR connection if not already connected
    if (!this.signalRService.isConnected()) {
      await this.signalRService.startConnection();
    }

    // Join the chat group
    await this.signalRService.joinChatGroup(this.activeChatId);

    // Subscribe to incoming messages
    this.signalRService.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        console.log('ChatRoom: Message received from SignalR:', message);
        console.log('ChatRoom: Current activeChatId:', this.activeChatId);

        // Compare as strings to handle number/string mismatch
        if (String(message.chatId) === String(this.activeChatId)) {
          const senderId = String(message.senderId).toLowerCase();
          const currentUserId = String(this.currentUserId || '').toLowerCase();

          console.log('🔍 Checking senderId match:', {
            msgSenderId: senderId,
            currentUserId: currentUserId,
            isTransient: message.isTransient,
            match: senderId === currentUserId
          });

          // Ignore our own messages from SignalR to avoid duplicates
          // We add them via API response or optimistic UI
          if (senderId === currentUserId) {
            console.log('ChatRoom: Ignoring own message');
            return;
          }

          console.log('ChatRoom: Adding message to UI');
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);

          // Only mark as read if we have a valid ID and it's not our message
          if (message.id && senderId !== currentUserId) {
            this.markMessageAsRead(String(message.id));
          }
        } else {
          console.log('ChatRoom: Message ignored (wrong chat ID)');
        }
      });

    this.loadChatDetails();
  }

  loadChatDetails(): void {
    console.log('🔄 loadChatDetails called for chatId:', this.activeChatId);
    if (!this.activeChatId) {
      console.warn('⚠️ loadChatDetails called with empty activeChatId');
      return;
    }

    this.loading = true;
    this.error = '';

    this.chatService.getChatDetails(this.activeChatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('📥 Raw API Response in ChatRoom:', response);

          // Handle case where backend returns array of messages directly
          if (Array.isArray(response)) {
            console.log('ℹ️ Response is an Array. Treating as messages list.');
            this.messages = response;
            this.chat = null;
            this.fetchChatInfo();
          } else if (response && Array.isArray(response.messages)) {
            // Standard ChatDetails object
            console.log('ℹ️ Response is ChatDetails object.');
            this.chat = response;
            this.messages = response.messages;
            if (this.chat && this.chat.participants) {
              this.setOtherParticipant(this.chat.participants);
            }
          } else {
            console.warn('⚠️ Unknown response structure:', response);
            // Fallback: try to see if response itself is the chat object but messages is missing/null
            this.chat = response;
            this.messages = [];
            if (this.chat && this.chat.participants) {
              this.setOtherParticipant(this.chat.participants);
            }
          }

          console.log('✅ Messages assigned to UI. Count:', this.messages.length);
          if (this.messages.length > 0) {
            console.log('📝 First message sample:', this.messages[0]);
          }

          this.loading = false;
          setTimeout(() => this.scrollToBottom(), 100);
          this.markChatAsRead();
        },
        error: (err) => {
          console.error('❌ Error loading chat:', err);
          this.error = 'فشل تحميل المحادثة';
          this.loading = false;
        }
      });
  }

  fetchChatInfo(): void {
    this.chatService.getUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chats) => {
          const currentChat = chats.find(c => String(c.id) === String(this.activeChatId));

          if (currentChat) {
            console.log('✅ Found chat info from user chats:', currentChat);
            this.chat = currentChat as unknown as ChatDetails;

            if (currentChat.participants) {
              this.setOtherParticipant(currentChat.participants);
            }
          }
        },
        error: (err) => console.error('Error fetching chat info:', err)
      });
  }

  setOtherParticipant(participants: Participant[]): void {
    const otherParticipantRaw = participants.find(
      p => p.userId !== this.currentUserId
    );

    if (otherParticipantRaw) {
      this.otherParticipant = {
        ...otherParticipantRaw,
        fullName: this.getDisplayName(otherParticipantRaw)
      };
    }
  }

  getDisplayName(participant: Participant): string {
    if (participant.displayName) {
      return participant.displayName;
    }

    if (participant.userName) {
      const cleanName = participant.userName.replace(/@.*$/, '').replace(/gmailcom$/, '');
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    return 'مستخدم';
  }

  /**
   * Get chat name - for group chats or custom named chats
   */
  getChatName(): string {
    if (!this.chat) return '';

    // Use chatName from backend (for group chats or custom named chats)
    if (this.chat.chatName) return this.chat.chatName;
    if (this.chat.name) return this.chat.name;

    // For 1-on-1 chats, use the other participant's name
    if (this.otherParticipant) {
      return this.otherParticipant.fullName || this.getDisplayName(this.otherParticipant);
    }

    return 'محادثة';
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.sending) {
      return;
    }

    const messageContent = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;

    try {
      // // Send message via API (for persistence)
      const message = await this.messageService.sendMessage({
        chatId: this.activeChatId,
        senderId: this.currentUserId,
        content: messageContent
      }).toPromise();

      // Also send via SignalR for real-time delivery
      //await this.signalRService.sendMessage(this.activeChatId, this.currentUserId, messageContent);

      // Add to local messages if not already added via SignalR
      if (message && !this.messages.find(m => m.id === message.id)) {
        this.messages.push(message);
        this.scrollToBottom();
      }

      this.sending = false;
    } catch (err) {
      console.error('Error sending message:', err);
      this.newMessage = messageContent; // Restore message on error
      this.sending = false;
    }
  }

  markChatAsRead(): void {
    this.chatService.markMessagesAsRead(this.activeChatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Messages marked as read');
        },
        error: (err) => console.error('Error marking messages as read:', err)
      });
  }

  markMessageAsRead(messageId: string): void {
    // Call API to persist read status
    this.messageService.markMessageAsRead(messageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Broadcast read status via SignalR
          this.signalRService.broadcastMessageRead(this.activeChatId, messageId);
        },
        error: (err) => console.error('Error marking message as read:', err)
      });
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  isSentByMe(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getMessageTime(date: Date | string): string {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMessageDate(date: Date | string): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return messageDate.toLocaleDateString('ar-EG', {
        month: 'long',
        day: 'numeric'
      });
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;

    const currentMsg = new Date(this.messages[index].sentAt);
    const prevMsg = new Date(this.messages[index - 1].sentAt);

    return currentMsg.toDateString() !== prevMsg.toDateString();
  }

  goBack(): void {
    this.back.emit();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByMessage(index: number, message: Message): string {
    return String(message.id);
  }
}
