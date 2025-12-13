import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-account-banned',
  templateUrl: './account-banned.html',
  styleUrls: ['./account-banned.css'],
  imports: [DatePipe, CommonModule]
})
export class AccountBannedComponent implements OnInit {
  banReason: string = 'انتهاك شروط الاستخدام';
  bannedAt?: string;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    
    if (state) {
      this.banReason = state['reason'] || this.banReason;
      this.bannedAt = state['bannedAt'];
    }
  }

  ngOnInit(): void {
    console.log('Account banned:', { reason: this.banReason, bannedAt: this.bannedAt });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  contactSupport(): void {
    // Navigate to support/appeal page
    this.router.navigate(['/support/appeal']);
  }
}