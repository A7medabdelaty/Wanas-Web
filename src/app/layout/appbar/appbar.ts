import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { UserRole } from './user-role.enum';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appbar.html',
  styleUrls: ['./appbar.css']
})
export class AppbarComponent implements OnInit, OnDestroy {
[x: string]: any;
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isMoreDropdownOpen = false;
  userRole: UserRole = UserRole.Guest;
  userName: string = 'المستخدم';
  userImage: string | null = null;
  isSearchOpen = false;

  moreMenuOptions = [
    { label: 'شركاء السكن', route: '/roommatesMatching', icon: 'people', roles: [UserRole.Renter] },
    { label: 'شقق مناسبة', route: '/listingMatch', icon: 'apartment', roles: [UserRole.Renter] },
    { label: 'إعلاناتي', route: '/listings/my-listings', icon: 'list_alt', roles: [UserRole.Owner] },
    { label: 'طلباتي', route: '/renter/requests', icon: 'assignment', roles: [UserRole.Renter] },
    { label: 'الرسائل', route: '/messages', icon: 'chat_bubble_outline', roles: [UserRole.Owner, UserRole.Renter] }
  ];

  // Subscription to track user changes
  private userSubscription?: Subscription;

  // Notifications
  isNotificationsOpen = false;
  unreadCount = 0;
  notifications$: Observable<Notification[]>;

  navItems = [
    { label: 'الرئيسية', link: '/', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'العقارات', link: '/properties', roles: [UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'لوحة التحكم', link: '/admin/dashboard', roles: [UserRole.Admin] },
    { label: 'عقاراتي', link: '/owner/my-properties', roles: [UserRole.Owner] },
    { label: 'من نحن', link: '/about', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'اتصل بنا', link: '/contact', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
  ];

  searchKeyword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    public notificationService: NotificationService
  ) {
    this.userRole = this.authService.getUserInfo()!.role;
    // Initialize notifications observable here to ensure service is ready
    this.notifications$ = this.notificationService.notifications$;

    // Debug subscription
    this.notifications$.subscribe(notes => {
      console.log('🔔 Appbar: Notifications updated:', notes);
    });
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in
        this.userName = user.fullName;
        this.userRole = user.role;
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

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.isMobileMenuOpen) this.isMobileMenuOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.userSubscription?.unsubscribe();
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

  get filteredMoreMenuOptions() {
    return this.moreMenuOptions.filter(option => option.roles.includes(this.userRole));
  }

  get isGuest(): boolean {
    return this.userRole === UserRole.Guest;
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
      // Also close search if clicked outside (optional, but good UX)
      // if (this.isSearchOpen && !this.elementRef.nativeElement.querySelector('.search-container')?.contains(event.target)) {
      //   this.closeSearch();
      // }

      // Close notifications if clicked outside
      if (this.isNotificationsOpen && !this.elementRef.nativeElement.querySelector('.notification-container')?.contains(event.target)) {
        this.isNotificationsOpen = false;
      }
    }
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isDropdownOpen = false;
      this.notificationService.fetchNotifications();
    }
  }

  markAllNotificationsRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(id: number) {
    this.notificationService.markAsRead(id);
    // Logic to navigate if notification has deep link (relatedEntityId) could be added here
  }
}
