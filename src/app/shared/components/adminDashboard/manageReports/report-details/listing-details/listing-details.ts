import { VerificationService } from './../../../../../../core/services/verification.service.ts';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDetailsDto } from '../../../../../../features/listings/models/listing';

@Component({
    selector: 'admin-listing-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './listing-details.html',
    styleUrl: './listing-details.css',
})
export class AdminListingDetails implements OnInit {
    @Input() listing!: ListingDetailsDto;
    isVerified: boolean = false;

    constructor(private verificationService: VerificationService) { }
    ngOnInit(): void {
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



}