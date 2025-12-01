import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDetailsDto, HostDetailsDto, ReviewDto } from '../../models/listing';
import { ListingPhotos } from '../../components/listing-photos/listing-photos';
import { ListingDetails as ListingDetailsComponent } from '../../components/listing-details/listing-details';
import { HostDetails } from '../../components/host-details/host-details';
import { CommentSection } from '../../components/comment-section/comment-section';
import { ReviewsSection } from '../../components/reviews-section/reviews-section';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../../../core/services/auth';
import { ChatService } from '../../../../features/chat/services/chat';
import { CreateChatRequest } from '../../../../core/models/chat.model';

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
  isOwner: boolean = false;
  currentUserId: string | null = null;
  showDeleteModal: boolean = false;
  isDeleting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.currentUserId = userInfo?.id ?? null;

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!isNaN(id)) {
      this.listingService.getListingById(id).subscribe({
        next: (data) => {
          this.listing = data;
          this.host = data.host;
          // Check if the current user is the owner of the listing
          this.isOwner = this.currentUserId !== null && this.host?.id === this.currentUserId;
        },
        error: () => { this.listing = undefined; }
      });
    }
  }

  onAddComment() {}

  onAddReview() {}

  onCreateChat() {
    console.log('onCreateChat called', { host: this.host, currentUserId: this.currentUserId });
    
    if (!this.host) {
      console.warn('Cannot create chat: host is not available');
      alert('لا يمكن إرسال رسالة: معلومات المضيف غير متوفرة');
      return;
    }

    if (!this.currentUserId) {
      console.warn('Cannot create chat: user is not logged in');
      alert('يجب تسجيل الدخول أولاً لإرسال رسالة');
      return;
    }

    // Don't allow messaging yourself
    if (this.host.id === this.currentUserId) {
      console.warn('Cannot create chat: cannot message yourself');
      return;
    }

    const request: CreateChatRequest = {
      participantIds: [this.host.id]
    };

    console.log('Creating chat with request:', request);

    this.chatService.createChat(request).subscribe({
      next: (response) => {
        console.log('Chat created successfully:', response);
        // Navigate to the chat room
        this.router.navigate(['/messages', response.id]);
      },
      error: (error) => {
        console.error('Error creating chat:', error);
        const errorMessage = error?.error?.message || error?.message || 'حدث خطأ أثناء إنشاء المحادثة';
        alert(errorMessage);
      }
    });
  }

  onUpdateListing() {
    if (!this.listing) {
      return;
    }
    // Navigate to edit page - you may need to create this route
    this.router.navigate(['/listings', this.listing.id, 'edit']);
  }

  onDeleteListing() {
    if (!this.listing) {
      return;
    }
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.listing || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.listingService.deleteListing(this.listing.id).subscribe({
      next: () => {
        // Navigate back to home or listings page after successful deletion
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error deleting listing:', error);
        this.isDeleting = false;
        this.showDeleteModal = false;
        alert('حدث خطأ أثناء حذف الإعلان. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeDeleteModal();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.showDeleteModal && !this.isDeleting) {
      this.closeDeleteModal();
    }
  }
}
