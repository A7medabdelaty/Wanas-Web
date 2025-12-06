import { Injectable, inject } from '@angular/core';
import { SignalRService } from '../../features/chat/services/signalr.service';
import { AuthService } from './auth';

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

    private toastContainer: HTMLElement | null = null;

    constructor() {
        this.createToastContainer();
        this.initializeNotificationHandlers();
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
        });

        this.signalRService.chatUpdated$.subscribe(chat => {
            this.showInfo(`Chat updated: ${chat.chatName || 'Group Chat'}`);
        });

        this.signalRService.chatDeleted$.subscribe(chatId => {
            this.showWarning(`Chat ${chatId} has been deleted`);
        });

        // Participant notifications
        this.signalRService.participantAdded$.subscribe(event => {
            if (event.userId !== currentUser.id) {
                this.showInfo(`A new participant joined the chat`);
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
        });

        this.signalRService.groupApproved$.subscribe(() => {
            this.showSuccess(`You've been approved to join the group chat!`);
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
        });

        // Reservation notifications
        this.signalRService.reservationCreated$.subscribe(event => {
            this.showSuccess(`New reservation created! Reservation ID: ${event.reservationId}`);
        });

        this.signalRService.reservationUpdated$.subscribe(event => {
            this.showInfo(`Reservation ${event.reservationId} has been updated`);
        });

        this.signalRService.reservationCancelled$.subscribe(event => {
            this.showWarning(`Reservation ${event.reservationId} has been cancelled`);
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
