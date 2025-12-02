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
import { UserService } from '../../../../core/services/user.service';

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
  loadingHost: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private userService: UserService
  ) { }

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.currentUserId = userInfo?.id ?? null;
    console.log('🔍 Current User ID:', this.currentUserId);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!isNaN(id)) {
      this.listingService.getListingById(id).subscribe({
        next: (data) => {
          console.log('📦 Listing data received:', data);
          this.listing = data;

          // Check if the current user is the owner of the listing using ownerId
          this.isOwner = this.currentUserId !== null && data.ownerId === this.currentUserId;
          console.log('🔐 Is Owner?', this.isOwner, {
            currentUserId: this.currentUserId,
            ownerId: data.ownerId,
            match: data.ownerId === this.currentUserId
          });

          // Fetch host details if user is not the owner
          if (!this.isOwner && data.ownerId) {
            this.fetchHostDetails(data.ownerId);
          }
        },
        error: () => { this.listing = undefined; }
      });
    }
  }

  fetchHostDetails(ownerId: string): void {
    console.log('📞 Fetching host details for ownerId:', ownerId);
    this.loadingHost = true;

    this.userService.getUserById(ownerId).subscribe({
      next: (userData) => {
        this.host = {
          id: userData.id || ownerId,
          fullName: userData.fullName || 'مستخدم',
          photoUrl: userData.photo || userData.photoUrl || userData.photoURL,
          email: userData.email || '',
          phone: userData.phoneNumber || userData.phone || '',
          city: userData.city || '',
          bio: userData.bio || ''
        };
        console.log('👤 Host data fetched:', this.host);
        console.log('✅ Should show host details?', this.host && !this.isOwner);
        this.loadingHost = false;
      },
      error: (err) => {
        console.error('❌ Error fetching host details:', err);
        this.loadingHost = false;
        // Continue without host details - section will be hidden
      }
    });
  }

  onAddComment() { }

  onAddReview() { }

  onCreateChat() {
    console.log('onCreateChat called', { listing: this.listing, currentUserId: this.currentUserId });

    if (!this.listing) {
      console.warn('Cannot create chat: listing is not available');
      alert('لا يمكن إرسال رسالة: معلومات الإعلان غير متوفرة');
      return;
    }

    if (!this.currentUserId) {
      console.warn('Cannot create chat: user is not logged in');
      alert('يجب تسجيل الدخول أولاً لإرسال رسالة');
      return;
    }

    // Don't allow messaging yourself
    if (this.listing.ownerId === this.currentUserId) {
      console.warn('Cannot create chat: cannot message yourself');
      return;
    }

    console.log('Opening private chat for listing:', this.listing.id);

    this.chatService.openPrivateChat(this.listing.id).subscribe({
      next: (response) => {
        console.log('Private chat opened successfully:', response);
        // Navigate to the chat page with the chat ID
        this.router.navigate(['/messages'], {
          queryParams: { chatId: response.id }
        });
      },
      error: (error) => {
        console.error('Error opening private chat:', error);
        const errorMessage = error?.error?.message || error?.message || 'حدث خطأ أثناء فتح المحادثة';
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
