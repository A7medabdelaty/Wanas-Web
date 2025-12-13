import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-account-suspended',
  templateUrl: './account-suspended.html',
  styleUrls: ['./account-suspended.css'],
  imports: [DatePipe, CommonModule, RouterModule]

})
export class AccountSuspendedComponent implements OnInit {
  suspensionReason: string = 'انتهاك مؤقت لشروط الاستخدام';
  suspendedUntil?: string;
  suspendedAt?: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private activatedRoute:ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    
    if (state) {
      this.suspensionReason = state['reason'] || this.suspensionReason;
      this.suspendedUntil = state['suspendedUntil'];
      this.suspendedAt = state['suspendedAt'];
    }
  }

  ngOnInit(): void {
    console.log('Account suspended:', { 
      reason: this.suspensionReason, 
      until: this.suspendedUntil,
      at: this.suspendedAt
    });
  }

  getRemainingDays(): number {
    if (!this.suspendedUntil) return 0;
    
    const now = new Date();
    const until = new Date(this.suspendedUntil);
    const diff = until.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  getRemainingHours(): number {
    if (!this.suspendedUntil) return 0;
    
    const now = new Date();
    const until = new Date(this.suspendedUntil);
    const diff = until.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600));
  }

  isExpiringSoon(): boolean {
    return this.getRemainingDays() <= 1;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  contactSupport(): void {
    this.router.navigate(['/account/appeal']);
  }
}