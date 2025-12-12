import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SignalRService } from './signalr.service';
import { AuthService } from '../../../core/services/auth';
import {
  Chat,
  ChatDetails,
  ChatSummary,
  CreateChatRequest,
  CreateChatResponse,
  UpdateChatRequest,
  UnreadCountResponse,
  Message
} from '../../../core/models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // Common patterns: /api/chats, /api/Chat, /api/chat, /api/Chats
  private apiUrl = `${environment.apiUrl}/chats`;

  private totalUnreadSubject = new BehaviorSubject<number>(0);
  public totalUnreadCount$ = this.totalUnreadSubject.asObservable();

  private chatReadSubject = new Subject<string>();
  public chatRead$ = this.chatReadSubject.asObservable();

  constructor(
    private http: HttpClient,
    private signalRService: SignalRService,
    private authService: AuthService
  ) {
    this.initializeUnreadCount();
  }

  private initializeUnreadCount() {
    // Initial fetch
    this.refreshUnreadCount();

    // Listen for real-time updates to refresh count
    this.signalRService.messageReceived$.subscribe(message => {
      const currentUser = this.authService.getUserInfo();
      // If I received a message from someone else, increment or refresh
      // Ensure strict string comparison
      if (currentUser && String(message.senderId) !== String(currentUser.id)) {
        this.refreshUnreadCount();
      }
    });

    // When I read a message (or anyone reads? No, when *I* read)
    // The SignalR event 'MessageRead' comes with userId who read it.
    this.signalRService.messageRead$.subscribe(event => {
      const currentUser = this.authService.getUserInfo();
      if (currentUser && String(event.userId) === String(currentUser.id)) {
        this.refreshUnreadCount();
      }
    });

    // Also refresh on connection (in case we missed something)
    this.signalRService.connectionState$.subscribe(state => {
      if (state === 'Connected') {
        this.refreshUnreadCount();
      }
    });
  }

  public refreshUnreadCount(): void {
    if (!this.authService.isLoggedIn()) return;

    this.getUnreadCount().subscribe({
      next: (res) => this.totalUnreadSubject.next(res.unreadCount),
      error: (err) => console.error('Failed to update unread chat count', err)
    });
  }

  // Get all chats for a specific user (userId from token)
  getUserChats(): Observable<Chat[]> {
    return this.http.get<ApiResponse<Chat[]>>(`${this.apiUrl}/user`)
      .pipe(map(response => response.data));
  }

  // Get chat messages
  getChatDetails(chatId: string): Observable<Message[]> {
    return this.http.get<ApiResponse<Message[]>>(`${environment.apiUrl}/messages/chat/${chatId}`)
      .pipe(map(response => response.data));
  }

  // Create a new chat
  createChat(request: CreateChatRequest): Observable<CreateChatResponse> {
    return this.http.post<ApiResponse<CreateChatResponse>>(`${this.apiUrl}/create`, request)
      .pipe(map(response => response.data));
  }

  // Open or create private chat with listing owner
  // POST /chats/private/{listingId}/open
  openPrivateChat(listingId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/private/${listingId}/open`, {})
      .pipe(map(response => response.data));
  }

  // Update chat information
  updateChat(chatId: string, request: UpdateChatRequest): Observable<Chat> {
    return this.http.put<ApiResponse<Chat>>(`${this.apiUrl}/${chatId}`, request)
      .pipe(map(response => response.data));
  }

  // Delete a chat
  deleteChat(chatId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${chatId}`)
      .pipe(map(response => response.data));
  }

  // Add participant to chat
  addParticipant(chatId: string, userId: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${chatId}/participants`, { userId })
      .pipe(map(response => response.data));
  }

  // Remove participant from chat
  removeParticipant(chatId: string, userId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${chatId}/participants/${userId}`)
      .pipe(map(response => response.data));
  }

  // User leaves chat (userId from token)
  leaveChat(chatId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${chatId}/leave`)
      .pipe(map(response => response.data));
  }

  // Mark all messages in a chat as read (userId from token)
  markMessagesAsRead(chatId: string): Observable<void> {
    // Optimistic update
    this.refreshUnreadCount();
    this.chatReadSubject.next(chatId); // Notify UI to clear badge

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${chatId}/mark-read`, {})
      .pipe(map(response => {
        this.refreshUnreadCount(); // Confirm update
      }));
  }

  // Get count of unread messages for user (userId from token)
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<ApiResponse<UnreadCountResponse>>(`${this.apiUrl}/unread-count`)
      .pipe(map(response => response.data));
  }

  // Get recent chats summary for user (userId from token)
  getRecentChats(): Observable<ChatSummary[]> {
    return this.http.get<ApiResponse<ChatSummary[]>>(`${this.apiUrl}/recent`)
      .pipe(map(response => response.data));
  }
}
