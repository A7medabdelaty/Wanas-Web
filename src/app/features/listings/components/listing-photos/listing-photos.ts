import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingPhotoDto } from '../../models/listing';

@Component({
  selector: 'app-listing-photos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-photos.html',
  styleUrl: './listing-photos.css',
})
export class ListingPhotos {
  @Input() photos: ListingPhotoDto[] = [];
}
