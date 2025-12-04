import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDetailsDto } from '../../../../../../features/listings/models/listing';

@Component({
    selector: 'admin-listing-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './listing-details.html',
    styleUrl: './listing-details.css',
})
export class AdminListingDetails {
    @Input() listing!: ListingDetailsDto;


}