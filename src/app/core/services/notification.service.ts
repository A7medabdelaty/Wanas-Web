import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SignalRService } from '../../features/chat/services/signalr.service';
import { AuthService } from './auth';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: string;
    isRead: boolean;
    createdAt: Date;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Centralized service for handling and displaying real-time notifications
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private signalRService = inject(SignalRService);
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/notification';

    // State management for notifications
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    private toastContainer: HTMLElement | null = null;

    constructor() {
        this.createToastContainer();
        this.initializeNotificationHandlers();

        // Initial fetch
        this.fetchUnreadCount();
        this.fetchNotifications();
    }

    fetchNotifications() {
        if (!this.authService.getUserInfo()) return;

        this.http.get<Notification[]>(this.apiUrl).subscribe({
            next: (notifications) => {
                this.notificationsSubject.next(notifications);
            },
            error: (err) => console.error('Failed to fetch notifications', err)
        });
    }

    fetchUnreadCount() {
        if (!this.authService.getUserInfo()) {
            console.log('⚠️ NotificationService: Cannot fetch unread count - user not authenticated');
            return;
        }

        console.log('📡 NotificationService: Fetching unread count from:', `${this.apiUrl}/unread-count`);
        this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).subscribe({
            next: (response) => {
                console.log('✅ NotificationService: Unread count response:', response);
                this.unreadCountSubject.next(response.count);
            },
            error: (err) => {
                console.error('❌ NotificationService: Failed to fetch unread count', err);
            }
        });
    }

    markAsRead(id: number) {
        this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe({
            next: () => {
                // Update local state
                const current = this.notificationsSubject.value;
                const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
                this.notificationsSubject.next(updated);

                // Decrement count
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) this.unreadCountSubject.next(currentCount - 1);
            },
            error: (err) => console.error('Failed to mark as read', err)
        });
    }

    markAllAsRead() {
        this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
            next: () => {
                // Update local state
                const current = this.notificationsSubject.value;
                const updated = current.map(n => ({ ...n, isRead: true }));
                this.notificationsSubject.next(updated);

                // Reset count
                this.unreadCountSubject.next(0);
            },
            error: (err) => console.error('Failed to mark all as read', err)
        });
    }

    private incrementUnreadCount() {
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        // creating a fetch triggers refetch to keep list in sync
        this.fetchNotifications();
    }

    /**
     * Create toast container for notifications
     */
    private createToastContainer(): void {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Initialize all SignalR notification handlers
     */
    private initializeNotificationHandlers(): void {
        const currentUser = this.authService.getUserInfo();
        if (!currentUser) return;

        // Chat notifications
        this.signalRService.chatCreated$.subscribe(chat => {
            this.showInfo(`New chat created: ${chat.chatName || 'Group Chat'}`);
            this.incrementUnreadCount();
        });

        this.signalRService.chatUpdated$.subscribe(chat => {
            this.showInfo(`Chat updated: ${chat.chatName || 'Group Chat'}`);
            this.incrementUnreadCount();
        });

        this.signalRService.chatDeleted$.subscribe(chatId => {
            this.showWarning(`Chat ${chatId} has been deleted`);
        });

        // Participant notifications
        this.signalRService.participantAdded$.subscribe(event => {
            if (event.userId !== currentUser.id) {
                this.showInfo(`A new participant joined the chat`);
                this.incrementUnreadCount();
            }
        });

        this.signalRService.participantRemoved$.subscribe(event => {
            if (event.userId !== currentUser.id) {
                this.showWarning(`A participant left the chat`);
            }
        });

        // Message notifications
        this.signalRService.messageDeleted$.subscribe(() => {
            this.showInfo(`A message was deleted`);
        });

        // Payment/Group approval notifications
        this.signalRService.paymentApproved$.subscribe(event => {
            this.showSuccess(`Payment approved for listing ${event.listingId}! You can now proceed with booking.`);
            this.incrementUnreadCount();
        });

        this.signalRService.groupApproved$.subscribe(() => {
            this.showSuccess(`You've been approved to join the group chat!`);
            this.incrementUnreadCount();
        });

        // Owner/User notifications
        this.signalRService.ownerNotification$.subscribe(notification => {
            this.showInfo(notification.message);
        });

        this.signalRService.userNotification$.subscribe(notification => {
            this.showInfo(notification.message);
        });

        // Listing notifications
        this.signalRService.listingUpdated$.subscribe(event => {
            this.showInfo(`Your listing ${event.listingId} has been updated`);
            this.incrementUnreadCount();
        });

        // Reservation notifications
        this.signalRService.reservationCreated$.subscribe(event => {
            this.showSuccess(`New reservation created! Reservation ID: ${event.reservationId}`);
            this.incrementUnreadCount();
        });

        this.signalRService.reservationUpdated$.subscribe(event => {
            this.showInfo(`Reservation ${event.reservationId} has been updated`);
            this.incrementUnreadCount();
        });

        this.signalRService.reservationCancelled$.subscribe(event => {
            this.showWarning(`Reservation ${event.reservationId} has been cancelled`);
            this.incrementUnreadCount();
        });
    }

    /**
     * Show a toast notification
     */
    private showToast(message: string, type: NotificationType, duration: number = 5000): void {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.style.cssText = `
            min-width: 300px;
            max-width: 500px;
            padding: 16px 20px;
            background-color: ${this.getBackgroundColor(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: var(--font-family, 'Tajawal', sans-serif);
            font-size: 14px;
            font-weight: 500;
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            transition: opacity 0.3s ease;
        `;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span style="font-size: 18px;">${icon}</span>
            <span style="flex: 1;">${message}</span>
        `;

        // Remove on click
        toast.onclick = () => {
            this.removeToast(toast);
        };

        this.toastContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    private removeToast(toast: HTMLElement): void {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    private getBackgroundColor(type: NotificationType): string {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'info': return '#3b82f6';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }

    private getIcon(type: NotificationType): string {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'info': return 'ⓘ';
            case 'warning': return '⚠';
            default: return 'ⓘ';
        }
    }

    /**
     * Show success notification
     */
    showSuccess(message: string, duration?: number): void {
        this.showToast(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    showError(message: string, duration?: number): void {
        this.showToast(message, 'error', duration);
    }

    /**
     * Show info notification
     */
    showInfo(message: string, duration?: number): void {
        this.showToast(message, 'info', duration);
    }

    /**
     * Show warning notification
     */
    showWarning(message: string, duration?: number): void {
        this.showToast(message, 'warning', duration);
    }
}
