import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDetailsDto, HostDetailsDto, ReviewDto } from '../../models/listing';
import { ListingPhotos } from '../../components/listing-photos/listing-photos';
import { ListingDetails as ListingDetailsComponent } from '../../components/listing-details/listing-details';
import { HostDetails } from '../../components/host-details/host-details';
import { CommentSection } from '../../components/comment-section/comment-section';
import { ReviewsSection } from '../../components/reviews-section/reviews-section';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [
    CommonModule,
    ListingPhotos,
    ListingDetailsComponent,
    HostDetails,
    CommentSection,
    ReviewsSection
  ],
  templateUrl: './listing-details.html',
  styleUrl: './listing-details.css',
})
export class ListingDetails implements OnInit {
  listing?: ListingDetailsDto;
  host?: HostDetailsDto;
  reviews: ReviewDto[] = [];
  constructor(private route: ActivatedRoute, private listingService: ListingService) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!isNaN(id)) {
      this.listingService.getListingById(id).subscribe({
        next: (data) => { this.listing = data; this.host = data.host; },
        error: () => { this.listing = undefined; }
      });
    }
  }

  onAddComment() {}

  onAddReview() {}
}
