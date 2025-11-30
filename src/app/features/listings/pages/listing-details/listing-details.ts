import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingDetailsDto, HostDetailsDto, ReviewDto } from '../../models/listing';
import { ListingPhotos } from '../../components/listing-photos/listing-photos';
import { ListingDetails as ListingDetailsComponent } from '../../components/listing-details/listing-details';
import { HostDetails } from '../../components/host-details/host-details';
import { CommentSection } from '../../components/comment-section/comment-section';
import { ReviewsSection } from '../../components/reviews-section/reviews-section';

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

  ngOnInit() {
    // Static data for demonstration
    this.listing = {
      id: 1,
      title: 'شقة عائلية فاخرة بغرفتين في القاهرة الجديدة',
      description: 'شقة حديثة ومفروشة بالكامل في موقع ممتاز بالقرب من جميع الخدمات والمواصلات. الشقة تتكون من غرفتين نوم واسعتين، صالة كبيرة، مطبخ مجهز بالكامل، وحمامان. الشقة بها مصعد وخدمات إنترنت وتكييف مركزي. مناسبة للعائلات أو الطلاب.',
      createdAt: new Date('2024-01-15'),
      city: 'القاهرة الجديدة',
      address: 'حي النرجس، شارع الجولف',
      monthlyPrice: 5500,
      hasElevator: true,
      floor: 'الطابق الثالث',
      areaInSqMeters: 120,
      totalRooms: 2,
      availableRooms: 1,
      totalBeds: 3,
      availableBeds: 2,
      totalBathrooms: 2,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      isPetFriendly: false,
      isSmokingAllowed: false,
      listingPhotos: [
        { id: 1, url: 'images/listings/1.jpg' },
        { id: 2, url: 'images/listings/2.jpg' },
        { id: 3, url: 'images/listings/3.jpg' }
      ],
      comments: [
        {
          id: 1,
          authorName: 'محمد أحمد',
          authorPhoto: undefined,
          content: 'شقة رائعة ومناسبة جداً. الموقع ممتاز والقرب من المواصلات سهل.',
          createdAt: new Date('2024-02-01T10:30:00'),
          replies: [
            {
              id: 2,
              authorName: 'أحمد علي',
              authorPhoto: undefined,
              content: 'شكراً لك على التعليق!',
              createdAt: new Date('2024-02-01T11:00:00'),
              replies: []
            }
          ]
        },
        {
          id: 3,
          authorName: 'سارة محمود',
          authorPhoto: undefined,
          content: 'هل الشقة مناسبة للعائلات الصغيرة؟',
          createdAt: new Date('2024-02-05T14:20:00'),
          replies: []
        }
      ]
    };

    this.host = {
      id: '1',
      name: 'أحمد علي محمد',
      photoUrl: undefined,
      email: 'ahmed.ali@example.com',
      phone: '+20 100 123 4567',
      bio: 'أنا مهندس برمجيات وأبحث عن شريك سكن مناسب. أحب القراءة والسفر والرياضة. أبحث عن شخص نظيف ومنظم.'
    };

    this.reviews = [
      {
        reviewId: 1,
        targetId: '1',
        rating: 5,
        comment: 'ممتاز جداً! المضيف محترم والشقة نظيفة ومريحة. أنصح بها بشدة.',
        createdAt: new Date('2024-01-20'),
        reviewerId: '2',
        reviewerName: 'خالد محمود'
      },
      {
        reviewId: 2,
        targetId: '1',
        rating: 4,
        comment: 'الشقة جيدة والموقع ممتاز، ولكن يمكن تحسين بعض التفاصيل الصغيرة.',
        createdAt: new Date('2024-01-25'),
        reviewerId: '3',
        reviewerName: 'فاطمة حسن'
      },
      {
        reviewId: 3,
        targetId: '1',
        rating: 5,
        comment: 'تجربة رائعة! كل شيء منظم ونظيف. المضيف متجاوب وسريع في الرد على الاستفسارات.',
        createdAt: new Date('2024-02-01'),
        reviewerId: '4',
        reviewerName: 'عمر يوسف'
      }
    ];
  }
}
