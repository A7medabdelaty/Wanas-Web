import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Message, SendMessageRequest, EditMessageRequest } from '../../../core/models/chat.model';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    private apiUrl = `${environment.apiUrl}/messages`;

    constructor(private http: HttpClient) { }

    // Get recent messages for a chat
    getRecentMessages(chatId: string, limit: number = 50): Observable<Message[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/chat/${chatId}`, { params })
            .pipe(map(response => response.data));
    }

    // Send a new message (senderId inferred from token)
    sendMessage(request: SendMessageRequest): Observable<Message> {
        // Create a copy of the request and remove senderId if present, as backend gets it from token
        const { senderId, ...requestBody } = request;
        return this.http.post<ApiResponse<Message>>(this.apiUrl, requestBody)
            .pipe(map(response => response.data));
    }

    // Edit an existing message
    editMessage(messageId: string, content: string): Observable<Message> {
        return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/${messageId}`, { newContent: content })
            .pipe(map(response => response.data));
    }

    // Delete a message
    deleteMessage(messageId: string): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${messageId}`)
            .pipe(map(response => response.data));
    }

    // Mark a specific message as read (userId inferred from token)
    markMessageAsRead(messageId: string): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${messageId}/read`, {})
            .pipe(map(response => response.data));
    }
}
