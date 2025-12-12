import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommentDto } from '../models/listing';

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    getComments(listingId: number): Observable<CommentDto[]> {
        return this.http.get<CommentDto[]>(`${this.apiUrl}/listing/${listingId}/comments`);
    }

    addComment(comment: { content: string; listingId: number; parentCommentId: number | null }): Observable<any> {
        return this.http.post(`${this.apiUrl}/listing/${comment.listingId}/comments`, comment);
    }

    updateComment(listingId: number, commentId: number, content: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/listing/${listingId}/comments/${commentId}`, {
            content,
            listingId,
            parentCommentId: null
        });
    }

    deleteComment(listingId: number, commentId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/listing/${listingId}/comments/${commentId}`);
    }
}
