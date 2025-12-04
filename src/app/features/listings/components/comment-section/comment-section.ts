import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommentDto } from '../../models/listing';
import { CommentService } from '../../services/comment.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CommentDialogComponent } from '../comment-dialog/comment-dialog.component';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.css',
})
export class CommentSection implements OnInit {
  @Input() comments: CommentDto[] | null = null;
  listingId!: number;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.listingId = +params['id'];
      if (this.listingId) {
        this.loadComments();
      }
    });
  }

  loadComments() {
    this.commentService.getComments(this.listingId).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  getTopLevelComments(): CommentDto[] {
    return this.comments || [];
  }

  onAddComment() {
    this.dialogService.open(CommentDialogComponent, {
      data: {
        listingId: this.listingId,
        commentAddedCallback: () => this.loadComments()
      }
    });
  }
}
