import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingSearchService } from '../../services/listing-search.service';
import { ListingSearchRequestDto, ListingSearchResponseDto } from '../../../../core/models/search';
import { ListingCardDto } from '../../../../core/models/listingModel';

@Component({
    selector: 'app-search-page',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
    // Search State
    listings: ListingCardDto[] = [];
    totalCount = 0;
    loading = false;

    // Filter State
    filters: ListingSearchRequestDto = {
        page: 1,
        pageSize: 12,
        minPrice: 0,
        maxPrice: 5000,
        minRooms: 0,
        maxRooms: 5,
        minBeds: 0,
        maxBeds: 5,
        onlyAvailable: false,
        hasInternet: false,
        hasKitchen: false,
        hasElevator: false,
        hasAirConditioner: false,
        hasFans: false,
        isPetFriendly: false,
        isSmokingAllowed: false
    };

    // UI State for sliders
    priceRange = 3000;

    constructor(
        private searchService: ListingSearchService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['keyword']) {
                this.filters.keyword = params['keyword'];
            }
            this.search();
        });
    }

    search(): void {
        this.loading = true;
        this.searchService.searchListings(this.filters).subscribe({
            next: (response) => {
                this.listings = response.listings;
                // If only one page, trust the array length as the accurate count
                if (response.totalPages <= 1) {
                    this.totalCount = this.listings.length;
                } else {
                    this.totalCount = response.totalCount;
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Search error:', error);
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.filters.page = 1; // Reset to first page on filter change
        this.search();
    }

    resetFilters(): void {
        this.filters = {
            page: 1,
            pageSize: 12,
            keyword: this.filters.keyword, // Keep keyword
            minPrice: 0,
            maxPrice: 5000
        };
        this.search();
    }

    onPageChange(page: number): void {
        this.filters.page = page;
        this.search();
        window.scrollTo(0, 0);
    }
}
