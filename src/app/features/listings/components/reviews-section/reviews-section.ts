import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewDto } from '../../models/listing';
import { ReviewCard } from '../../../../features/reviews/review-card/review-card';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [CommonModule, ReviewCard],
  templateUrl: './reviews-section.html',
  styleUrl: './reviews-section.css',
})
export class ReviewsSection {
  @Input() reviews: ReviewDto[] = [];
  @Output() addReview = new EventEmitter<void>();

  onAddReview() {
    this.addReview.emit();
  }
}
