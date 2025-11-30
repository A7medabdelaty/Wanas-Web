import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from './sidebar.service';

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

  // Expose signal value to template
  get isCollapsed() {
    return this.sidebarService.isCollapsed();
  }

  navItems: NavItem[] = [
    { label: 'الرئيسية', icon: 'home', route: '/home' },
    { label: 'شركاء سكن', icon: 'people', route: '/rommatesMatching' },
    { label: 'شقق مناسبة', icon: 'apartment', route: '/listingMatch' },
    { label: 'الملف الشخصي', icon: 'person', route: '/profile' },
    { label: 'الرسائل', icon: 'chat_bubble_outline', route: '/messages' },
  ];

  settingsItem: NavItem = { label: 'الإعدادات', icon: 'settings', route: '/dashboard/settings' };

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
