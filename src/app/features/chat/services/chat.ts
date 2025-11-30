import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
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
  private apiUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) { }

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
    return this.http.post<ApiResponse<CreateChatResponse>>(this.apiUrl, request)
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
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${chatId}/mark-read`, {})
      .pipe(map(response => response.data));
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
