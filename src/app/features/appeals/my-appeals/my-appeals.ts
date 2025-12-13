// src/app/features/account-status/my-appeals/my-appeals.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppealsService } from '../../../core/services/appeals.service';
import { Appeal } from '../../../core/models/appeal.model';
import { AppealType } from '../appeal-type.enum';


@Component({
  selector: 'app-my-appeals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-appeals.html',
  styleUrls: ['./my-appeals.css']
})
export class MyAppealsComponent implements OnInit {
  appeals: Appeal[] = [];
  totalCount = 0;
  isLoading = true;
  errorMessage = '';

  constructor(private appealsService: AppealsService) {}

  ngOnInit(): void {
    this.loadAppeals();
  }

  loadAppeals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appealsService.getMyAppeals().subscribe({
      next: (response) => {
        this.appeals = response.appeals;
        this.totalCount = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load appeals.';
        this.isLoading = false;
      }
    });
  }

  getAppealTypeLabel(type: AppealType): string {
    return type === AppealType.Ban ? 'Ban' : 'Suspension';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  }
}