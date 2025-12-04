import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReviewDto } from '../../listings/models/listing';
import { RatingPipe } from '../../../shared/pipes/rating-pipe';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RatingPipe],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard {
  @Input() review!: ReviewDto;
}
