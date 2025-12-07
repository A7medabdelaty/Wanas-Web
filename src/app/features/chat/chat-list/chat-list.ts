import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../services/chat';
import { SignalRService } from '../services/signalr.service';
import { AuthService } from '../../../core/services/auth';
import { Chat, Participant } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-list.html',
  styleUrls: ['./chat-list.css']
})
export class ChatList implements OnInit, OnDestroy {
  @Input() selectedChatId: string | null = null;
  @Output() chatSelected = new EventEmitter<string>();

  chats: Chat[] = [];
  filteredChats: Chat[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  error: string = '';
  currentUserId: string = '';

  // User presence tracking
  onlineUsers: Set<string> = new Set();

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    if (user) {
      this.currentUserId = user.id;
    }

    this.loadChats();
    this.subscribeToRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChats(): void {
    this.loading = true;
    this.error = '';

    this.chatService.getUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (chats) => {
          this.chats = chats;
          this.filteredChats = chats;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading chats:', err);
          this.error = 'فشل تحميل المحادثات';
          this.loading = false;
        }
      });
  }

  filterChats(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChats = this.chats;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.chats.filter(chat =>
      this.getChatName(chat).toLowerCase().includes(query) ||
      chat.participants?.some(p => this.getDisplayName(p).toLowerCase().includes(query))
    );
  }

  getChatName(chat: Chat): string {
    // Use chatName from backend (for group chats or custom named chats)
    if (chat.chatName) return chat.chatName;
    if (chat.name) return chat.name;

    // For 1-on-1 chats without a custom name, show the other person's name
    const otherParticipant = chat.participants?.find(p => p.userId !== this.currentUserId);

    if (otherParticipant) {
      return this.getDisplayName(otherParticipant);
    }

    return 'محادثة';
  }

  /**
   * Get display name for a participant
   * If displayName is null, extract from userName (remove email domain)
   */
  getDisplayName(participant: Participant): string {
    // Use displayName if available
    if (participant.displayName) {
      return participant.displayName;
    }

    // Extract from userName by removing email domain
    if (participant.userName) {
      // Remove email domain (e.g., "ahmedabdelaty174gmailcom" -> "ahmedabdelaty174")
      // or "user@example.com" -> "user"
      const cleanName = participant.userName.replace(/@.*$/, '').replace(/gmailcom$/, '');

      // Capitalize first letter
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    return 'مستخدم';
  }

  getChatImage(chat: Chat): string | null {
    if (chat.photoUrl) return chat.photoUrl;

    // For 1-1 chats, use the other participant's photo
    const otherParticipant = chat.participants?.find(p => p.userId !== this.currentUserId);
    return otherParticipant?.photoUrl || null;
  }

  getLastMessage(chat: Chat): string {
    if (!chat.lastMessage) return 'ابدأ المحادثة الآن';

    const content = chat.lastMessage.content;
    const sender = chat.lastMessage.senderId === this.currentUserId ? 'أنت: ' : '';
    return sender + (content.length > 30 ? content.substring(0, 30) + '...' : content);
  }

  getUnreadCount(chat: Chat): number {
    // This would typically come from the backend or be calculated
    // For now, returning 0 or a mock value
    return 0;
  }

  getTimeAgo(dateStr?: Date | string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;

    return date.toLocaleDateString('ar-EG');
  }

  onChatClick(chatId: string | number): void {
    this.chatSelected.emit(String(chatId));
  }

  trackByChat(index: number, chat: Chat): string {
    return String(chat.id);
  }

  /**
   * Subscribe to real-time SignalR updates
   */
  private subscribeToRealTimeUpdates(): void {
    // Subscribe to chat created
    this.signalRService.chatCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        console.log('📨 Chat created:', chat);
        // Add new chat to the list
        this.chats.unshift(chat as any);
        this.filterChats();
      });

    // Subscribe to chat updated
    this.signalRService.chatUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedChat => {
        console.log('✏️ Chat updated:', updatedChat);
        const index = this.chats.findIndex(c => c.id === updatedChat.id);
        if (index !== -1) {
          this.chats[index] = updatedChat as any;
          this.filterChats();
        }
      });

    // Subscribe to chat deleted
    this.signalRService.chatDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(chatId => {
        console.log('🗑️ Chat deleted:', chatId);
        this.chats = this.chats.filter(c => c.id !== chatId);
        this.filterChats();
      });

    // Subscribe to participant added
    this.signalRService.participantAdded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('👤 Participant added:', event);
        // Refresh the affected chat to get updated participant list
        this.refreshChat(event.chatId);
      });

    // Subscribe to participant removed
    this.signalRService.participantRemoved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('👋 Participant removed:', event);
        // Refresh the affected chat
        this.refreshChat(event.chatId);
      });

    // Subscribe to user status changes (presence)
    this.signalRService.userStatusChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('🟢 User status changed:', event);
        if (event.isOnline) {
          this.onlineUsers.add(event.userId);
        } else {
          this.onlineUsers.delete(event.userId);
        }
      });
  }

  /**
   * Refresh a specific chat from the API
   */
  private refreshChat(chatId: number): void {
    this.chatService.getUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(chats => {
        const updatedChat = chats.find(c => c.id === chatId);
        if (updatedChat) {
          const index = this.chats.findIndex(c => c.id === chatId);
          if (index !== -1) {
            this.chats[index] = updatedChat;
            this.filterChats();
          }
        }
      });
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
