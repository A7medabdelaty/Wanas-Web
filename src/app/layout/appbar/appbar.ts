import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { UserRole } from './user-role.enum';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appbar.html',
  styleUrls: ['./appbar.css']
})

export class AppbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  userRole: UserRole = UserRole.Guest;
  userName: string = 'المستخدم';
  userImage: string | null = null;

  // Subscription to track user changes
  private userSubscription?: Subscription;

  navItems = [
    { label: 'الرئيسية', link: '/', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'العقارات', link: '/properties', roles: [UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'لوحة التحكم', link: '/admin/dashboard', roles: [UserRole.Admin] },
    { label: 'عقاراتي', link: '/owner/my-properties', roles: [UserRole.Owner] },
    { label: 'طلباتي', link: '/renter/requests', roles: [UserRole.Renter] },
    { label: 'من نحن', link: '/about', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'اتصل بنا', link: '/contact', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // ✨ Subscribe to user changes - automatically updates UI
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in
        this.userName = user.fullName;
        this.userRole = UserRole.Renter; // TODO: Get from user profile when available
        // TODO: Fetch user profile image from API when available
        this.userImage = user.photoURL; // Will be populated from user profile API
      } else {
        // User is logged out
        this.userRole = UserRole.Guest;
        this.userName = 'المستخدم';
        this.userImage = null;
      }
    });

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.userSubscription?.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  get filteredNavItems() {
    return this.navItems.filter(item => item.roles.includes(this.userRole));
  }

  get isGuest(): boolean {
    return this.userRole === UserRole.Guest;
  }

  logout() {
    // Call AuthService logout - will automatically notify subscribers
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/auth/login']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateToProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close dropdown if clicked outside
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
