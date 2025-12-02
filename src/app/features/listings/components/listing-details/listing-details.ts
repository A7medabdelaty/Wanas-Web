import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ListingDetailsDto } from '../../models/listing';
import { HostDetails } from "../host-details/host-details";

@Component({
  selector: 'app-listing-details-card',
  standalone: true,
  imports: [CommonModule, DatePipe, HostDetails],
  templateUrl: './listing-details.html',
  styleUrl: './listing-details.css',
})
export class ListingDetails {
  @Input() listing!: ListingDetailsDto;
}
