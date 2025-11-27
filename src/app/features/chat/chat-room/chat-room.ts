import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../services/chat';
import { MessageService } from '../services/message.service';
import { SignalRService } from '../services/signalr.service';
import { ChatDetails, Message } from '../../../core/models/chat.model';
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

        if (message.chatId === this.activeChatId) {
          // Ignore our own messages from SignalR to avoid duplicates (we add them via API response)
          if (message.senderId === this.currentUserId) {
            console.log('ChatRoom: Ignoring own message');
            return;
          }

          console.log('ChatRoom: Adding message to UI');
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);

          // Only mark as read if we have a valid ID
          if (message.id) {
            this.markMessageAsRead(message.id);
          }
        } else {
          console.log('ChatRoom: Message ignored (wrong chat ID)');
        }
      });

    this.loadChatDetails();
  }

  loadChatDetails(): void {
    this.loading = true;
    this.error = '';

    this.chatService.getChatDetails(this.activeChatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chat) => {
          this.chat = chat;
          this.messages = chat.messages || [];

          // Find the other participant
          this.otherParticipant = chat.participants?.find(
            p => p.userId !== this.currentUserId
          );

          this.loading = false;

          // Scroll to bottom after messages load
          setTimeout(() => this.scrollToBottom(), 100);

          // Mark all messages as read
          this.markChatAsRead();
        },
        error: (err) => {
          console.error('Error loading chat:', err);
          this.error = 'فشل تحميل المحادثة';
          this.loading = false;
        }
      });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.sending) {
      return;
    }

    const messageContent = this.newMessage.trim();
    this.newMessage = '';
    this.sending = true;

    try {
      // Send message via API (for persistence)
      const message = await this.messageService.sendMessage({
        chatId: this.activeChatId,
        senderId: this.currentUserId, // Backend uses token
        content: messageContent
      }).toPromise();

      // Also send via SignalR for real-time delivery
      await this.signalRService.sendMessage(this.activeChatId, this.currentUserId, messageContent);

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
    this.messageService.markMessageAsRead(messageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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

  getMessageTime(date: Date): string {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMessageDate(date: Date): string {
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
    return message.id;
  }
}
