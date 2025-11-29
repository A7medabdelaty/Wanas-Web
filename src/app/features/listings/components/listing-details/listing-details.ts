import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ListingDetailsDto } from '../../models/listing';

@Component({
  selector: 'app-listing-details-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './listing-details.html',
  styleUrl: './listing-details.css',
})
export class ListingDetails {
  @Input() listing!: ListingDetailsDto;
}
