import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommentDto } from '../../models/listing';
import { CommentService } from '../../services/comment.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CommentDialogComponent } from '../comment-dialog/comment-dialog.component';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.css',
})
export class CommentSection implements OnInit {
  @Input() comments: CommentDto[] | null = null;
  listingId!: number;
  visibleCommentsCount: number = 2;
  readonly initialVisibleCommentsCount: number = 2;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private dialogService: DialogService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserInfo()?.id || null;

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
    return (this.comments || []).slice(0, this.visibleCommentsCount);
  }

  showMoreComments() {
    if (this.comments) {
      this.visibleCommentsCount = this.comments.length;
    }
  }

  showLessComments() {
    this.visibleCommentsCount = this.initialVisibleCommentsCount;
  }

  onAddComment() {
    this.dialogService.open(CommentDialogComponent, {
      data: {
        listingId: this.listingId,
        commentAddedCallback: () => this.loadComments()
      }
    });
  }

  onEditComment(comment: CommentDto) {
    this.dialogService.open(CommentDialogComponent, {
      data: {
        listingId: this.listingId,
        commentId: comment.id,
        initialContent: comment.content,
        commentAddedCallback: () => this.loadComments()
      }
    });
  }
}
