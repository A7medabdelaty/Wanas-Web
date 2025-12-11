import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewDto } from '../../models/listing';
import { ReviewCard } from '../../../../features/reviews/review-card/review-card';
import { AuthService } from '../../../../core/services/auth';
import { ReviewService } from '../../../../features/reviews/services/review.service';
import { RatingPipe } from '../../../../shared/pipes/rating-pipe';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [CommonModule, ReviewCard, RatingPipe],
  templateUrl: './reviews-section.html',
  styleUrl: './reviews-section.css',
})
export class ReviewsSection implements OnChanges {
  @Input() listingId!: number;
  @Input() canAddReview: boolean = true;
  @Input() isOwner: boolean = false;
  @Output() addReview = new EventEmitter<void>();

  reviews: ReviewDto[] = [];
  displayedReviews: ReviewDto[] = [];
  averageRating: number = 0;
  showAll: boolean = false;

  loading: boolean = false;
  currentUserId: string | null = null;
  visibleReviewsCount!: number;
  initialVisibleReviewsCount: number = 3;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserInfo()?.id || null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['listingId'] && this.listingId) {
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;

    // Fetch reviews
    this.reviewService.getListingReviews(this.listingId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.updateDisplayedReviews();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
        this.loading = false;
      }
    });

    // Fetch average rating
    this.reviewService.getAverageRating(this.listingId).subscribe({
      next: (rating) => {
        this.averageRating = rating;
      },
      error: (err) => {
        console.error('Error fetching average rating:', err);
      }
    });
  }

  updateDisplayedReviews() {
    this.displayedReviews = this.reviews.slice(0, this.visibleReviewsCount);
  }

  showMoreReviews() {
    this.visibleReviewsCount = this.reviews.length;
    this.updateDisplayedReviews();
  }

  showLessReviews() {
    this.visibleReviewsCount = this.initialVisibleReviewsCount;
    this.updateDisplayedReviews();
  }

  onAddReview() {
    this.addReview.emit();
  }

  onReviewRefresh() {
    this.loadData();
  }
}
