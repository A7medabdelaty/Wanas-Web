import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { AuthService } from '../../core/services/auth';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService);
  private auth = inject(AuthService);

  // Expose signal value to template
  get isCollapsed() {
    return this.sidebarService.isCollapsed();
  }

  get isAdmin() {
    const user = this.auth.getUserInfo();
    return !!user && user.role?.toLowerCase() === 'admin';
  }

  navItems: NavItem[] = [
    { label: 'الرئيسية', icon: 'home', route: '/home' },
    { label: 'شركاء سكن', icon: 'people', route: '/rommatesMatching' },
    { label: 'شقق مناسبة', icon: 'apartment', route: '/listingMatch' },
    { label: 'إعلاناتي', icon: 'list_alt', route: '/listings/my-listings' },
    { label: 'الملف الشخصي', icon: 'person', route: '/profile' },
    { label: 'الرسائل', icon: 'chat_bubble_outline', route: '/messages' },
  ];

  settingsItem: NavItem = { label: 'الإعدادات', icon: 'settings', route: '/dashboard/settings' };

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
