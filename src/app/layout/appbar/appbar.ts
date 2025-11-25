import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRole } from './user-role.enum';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appbar.html',
  styleUrls: ['./appbar.css']
})

export class AppbarComponent implements OnInit {
  isMobileMenuOpen = false;

  // Mock user role - replace with your actual Auth Service logic
  userRole: UserRole = UserRole.Guest;
  userName: string = 'المستخدم'; // Default user name

  navItems = [
    { label: 'الرئيسية', link: '/', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'العقارات', link: '/properties', roles: [UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'لوحة التحكم', link: '/admin/dashboard', roles: [UserRole.Admin] },
    { label: 'عقاراتي', link: '/owner/my-properties', roles: [UserRole.Owner] },
    { label: 'طلباتي', link: '/renter/requests', roles: [UserRole.Renter] },
    { label: 'من نحن', link: '/about', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
    { label: 'اتصل بنا', link: '/contact', roles: [UserRole.Admin, UserRole.Renter, UserRole.Owner, UserRole.Guest] },
  ];

  constructor() { }

  ngOnInit(): void {
    // TODO: Subscribe to your auth service here to get the real role
    // this.authService.userRole$.subscribe(role => this.userRole = role);
    // this.authService.userName$.subscribe(name => this.userName = name);

    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    });
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
    console.log('Logout clicked');
    // TODO: Implement logout logic
    // this.authService.logout();
    this.userRole = UserRole.Guest;
    this.userName = 'المستخدم';
  }
}
