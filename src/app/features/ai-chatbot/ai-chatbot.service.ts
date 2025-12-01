import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiChatbotService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/chatbot';

    sendMessage(message: string): Observable<string> {
        return this.http.post(this.apiUrl + '/send', { message }, { responseType: 'text' });
    }
}
