import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { ChatService } from '../../features/chat/services/chat';
import { Chat, ChatSummary } from '../../core/models/chat.model';
import { UserRole } from './user-role.enum';
import { VerificationService } from '../../core/services/verification.service.ts';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appbar.html',
  styleUrls: ['./appbar.css']
})
export class AppbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isMoreDropdownOpen = false;
  userRole: UserRole = UserRole.Guest;
  userName: string = 'المستخدم';
  userImage: string | null = null;
  isSearchOpen = false;
  isVerified: boolean = false;
  profileType: string = '';

  // Subscription to track user changes
  private userSubscription?: Subscription;
  private unreadMessagesSubscription?: Subscription;
  private notificationSubscriptions: Subscription[] = [];

  // Notifications
  isNotificationsOpen = false;
  unreadCount = 0;
  notifications$: Observable<Notification[]>;

  // Messages
  isMessagesOpen = false;
  unreadMessagesCount = 0;
  recentChats$: Observable<Chat[]>;

  navItems = [
    { label: 'الرئيسية', link: '/', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'العقارات', link: '/properties', roles: [UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'إعلاناتي', link: '/listings/my-listings', roles: [UserRole.Owner] },
    { label: 'طلباتي', link: '/renter/requests', roles: [UserRole.Renter] },
    { label: 'حجوزاتي', link: '/owner/requests', roles: [UserRole.Owner] },
    { label: 'شقق مناسبة', link: '/listingMatch', roles: [UserRole.Renter] },
    { label: 'شركاء سكن', link: '/rommatesMatching', roles: [UserRole.Renter] },
    { label: 'لوحة التحكم', link: '/admin/dashboard', roles: [UserRole.Admin] },
  ];

  searchKeyword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    public notificationService: NotificationService,
    private chatService: ChatService,
    private verificationService: VerificationService
  ) {
    this.userRole = this.authService.getUserInfo()?.role || UserRole.Guest;
    this.notifications$ = this.notificationService.notifications$;
    this.recentChats$ = this.chatService.getUserChats();
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in
        this.userName = user.fullName;
        this.userRole = user.role;
        this.profileType = user.role == 'renter' ? 'مستأجر' : user.role == 'owner' ? 'مالك' : 'ضيف';

        this.userImage = user.photoURL;
      } else {
        // User is logged out
        this.userRole = UserRole.Guest;
        this.userName = 'المستخدم';
        this.userImage = null;
      }
    });

    // Subscribe to unread count
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    // Subscribe to unread messages count
    this.unreadMessagesSubscription = this.chatService.totalUnreadCount$.subscribe(count => {
      console.log('📬 Appbar: Unread messages count updated:', count);
      this.unreadMessagesCount = count;
    });

    // Setup realtime notification refresh
    this.setupRealtimeNotifications();

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.isMobileMenuOpen) this.isMobileMenuOpen = false;
        if (this.isNotificationsOpen) this.isNotificationsOpen = false;
        if (this.isMessagesOpen) this.isMessagesOpen = false;
      }
    });




    this.verificationService.getStatus().subscribe(
      {
        next: (status) => {
          this.isVerified = status.isVerified;
        },
        error: (error) => {
          console.error('Error fetching verification status on appbar init:', error);
        }
      }
    );



  }





  ngOnDestroy(): void {
    // Clean up subscriptions
    this.userSubscription?.unsubscribe();
    this.unreadMessagesSubscription?.unsubscribe();
    this.notificationSubscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  performSearch() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/search'], { queryParams: { keyword: this.searchKeyword } });
      this.searchKeyword = '';
    }
  }

  get filteredNavItems() {
    return this.navItems.filter(item => item.roles.includes(this.userRole));
  }

  // get filteredMoreMenuOptions() {
  //   return this.moreMenuOptions.filter(option => option.roles.includes(this.userRole));
  // }

  get isGuest(): boolean {
    return this.userRole === UserRole.Guest;
  }

  get userRoleLabel(): string {
    switch (this.userRole) {
      case UserRole.Admin: return 'مسؤول';
      case UserRole.Owner: return 'مالك';
      case UserRole.Renter: return 'مستأجر';
      default: return '';
    }
  }

  logout() {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/auth/login']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isMoreDropdownOpen = false;
    }
  }

  toggleMoreDropdown() {
    this.isMoreDropdownOpen = !this.isMoreDropdownOpen;
    if (this.isMoreDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  navigateToProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.isMoreDropdownOpen = false;
      this.isNotificationsOpen = false;
      this.isMessagesOpen = false;
    }
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isDropdownOpen = false;
      this.isMessagesOpen = false;
      this.notificationService.fetchNotifications();
    }
  }

  markAllNotificationsRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(id: number) {
    this.notificationService.markAsRead(id);
    this.isNotificationsOpen = false;
  }

  toggleMessages() {
    this.isMessagesOpen = !this.isMessagesOpen;
    if (this.isMessagesOpen) {
      this.isDropdownOpen = false;
      this.isNotificationsOpen = false;
      // Refresh recent chats
      this.recentChats$ = this.chatService.getUserChats();
    }
  }

  onChatClick(chatId: string) {
    this.isMessagesOpen = false;
    this.router.navigate(['/messages'], { queryParams: { chatId } });
  }

  navigateToMessages() {
    this.isMessagesOpen = false;
    this.router.navigate(['/messages']);
  }

  /**
   * Get the photo URL of the other participant in the chat
   * (for displaying in the messages dropdown)
   */
  getOtherParticipantPhoto(chat: Chat): string | null {
    const currentUserId = this.authService.getUserInfo()?.id;
    if (!currentUserId || !chat.participants || chat.participants.length === 0) {
      return null;
    }

    // If it's a group chat or has a photoUrl, use that
    if (chat.photoUrl) {
      return chat.photoUrl;
    }

    // Find the other participant (not the current user)
    const otherParticipant = chat.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.photoUrl || null;
  }

  /**
   * Setup realtime notification refresh listeners
   * Refreshes notification list when any notification-worthy event occurs
   */
  private setupRealtimeNotifications() {
    const signalRService = this.notificationService['signalRService'];
    if (!signalRService) return;

    const refreshNotifications = () => {
      this.notificationService.fetchNotifications();
      this.notificationService.fetchUnreadCount();
    };

    // Subscribe to all notification events individually
    this.notificationSubscriptions.push(
      signalRService.paymentApproved$.subscribe(refreshNotifications),
      signalRService.groupApproved$.subscribe(refreshNotifications),
      signalRService.reservationCreated$.subscribe(refreshNotifications),
      signalRService.reservationUpdated$.subscribe(refreshNotifications),
      signalRService.reservationCancelled$.subscribe(refreshNotifications),
      signalRService.listingUpdated$.subscribe(refreshNotifications),
      signalRService.chatCreated$.subscribe(refreshNotifications),
      signalRService.participantAdded$.subscribe(refreshNotifications)
    );
  }
}
