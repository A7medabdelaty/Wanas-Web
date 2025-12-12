import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { AuthService } from '../../core/services/auth';
import { ChatService } from '../../features/chat/services/chat';

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
  private chatService = inject(ChatService);
  private router = inject(Router);
  private authService = inject(AuthService);
  // Observable for unread chat messages
  unreadMessages$ = this.chatService.totalUnreadCount$;

  get isLogin() {
    return this.auth.isLoggedIn();
  }
  // Expose signal value to template
  get isCollapsed() {
    return this.sidebarService.isCollapsed();
  }

  get isAdmin() {
    const user = this.auth.getUserInfo();
    return !!user && user.role?.toLowerCase() === 'admin';
  }

  adminNavnavItems: NavItem[] = [
    { label: 'لوحة التحكم', icon: 'admin_panel_settings', route: '/admin' },
    { label: 'الإحصائيات', icon: 'analytics', route: '/admin/analytics' },
    { label: 'التقارير', icon: 'bar_chart', route: '/admin/reports' },
    { label: 'إدارة المستخدمين', icon: 'supervisor_account', route: '/admin/users' },
    { label: 'الإعلانات المعلقة', icon: 'hourglass_empty', route: '/admin/listings/pending' },
    { label: 'الرسائل', icon: 'chat_bubble_outline', route: '/messages' },
  ];

  settingsItem: NavItem = { label: 'الإعدادات', icon: 'settings', route: '/dashboard/settings' };

  // Unified items source for template rendering
  get items(): NavItem[] {
    return  this.adminNavnavItems;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
