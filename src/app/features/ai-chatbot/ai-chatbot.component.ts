import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiChatbotService } from './ai-chatbot.service';

interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
}

@Component({
    selector: 'app-ai-chatbot',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './ai-chatbot.component.html',
    styleUrl: './ai-chatbot.component.css'
})
export class AiChatbotComponent implements OnInit, AfterViewChecked {
    private router = inject(Router);
    private chatbotService = inject(AiChatbotService);

    isVisible = signal(true);
    isOpen = signal(false);
    isLoading = signal(false);
    messages = signal<ChatMessage[]>([]);
    messageControl = new FormControl('');

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    ngOnInit() {
        this.checkVisibility(this.router.url);

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.checkVisibility(event.url);
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    private checkVisibility(url: string) {
        this.isVisible.set(!url.includes('/messages'));
    }

    private scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }

    toggleChat() {
        this.isOpen.update(v => !v);
    }

    sendMessage() {
        const text = this.messageControl.value?.trim();
        if (!text || this.isLoading()) return;

        // Add user message
        this.messages.update(msgs => [...msgs, { text, sender: 'user' }]);
        this.messageControl.setValue('');
        this.isLoading.set(true);

        this.chatbotService.sendMessage(text).subscribe({
            next: (response) => {
                this.messages.update(msgs => [...msgs, { text: response, sender: 'bot' }]);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Chatbot error:', err);
                this.messages.update(msgs => [...msgs, { text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.', sender: 'bot' }]);
                this.isLoading.set(false);
            }
        });
    }
}
