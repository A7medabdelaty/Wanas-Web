import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListingService } from '../listings/services/listing.service';
import { ListingModel } from '../../core/models/listingModel'; // Check if this import is correct based on checking listingModel file name
import { Card } from '../../shared/components/Home/card/card';

@Component({
    selector: 'app-properties',
    standalone: true,
    imports: [CommonModule, RouterModule, Card],
    templateUrl: './properties.component.html',
    styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit {
    listings: ListingModel[] = [];
    pageNumber = 1;
    pageSize = 12;
    totalCount = 0;
    totalPages = 0;
    loading = false;

    constructor(private listingService: ListingService) { }

    ngOnInit(): void {
        this.loadListings();
    }

    loadListings(): void {
        this.loading = true;
        this.listingService.getAllListings(this.pageNumber, this.pageSize).subscribe({
            next: (response) => {
                if (response.success) {
                    this.listings = response.data;
                    this.totalCount = response.totalCount;
                    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading listings', err);
                this.loading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.pageNumber = page;
            this.loadListings();
            window.scrollTo(0, 0);
        }
    }

    get pages(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= this.totalPages; i++) {
            // Simple pagination logic, can be improved to show window of pages
            pages.push(i);
        }
        return pages;
    }
}
