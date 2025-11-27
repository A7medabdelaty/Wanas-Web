import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatchResult } from '../../../../../core/models/rommate-model';
import { RommatesMatchingService } from '../../../../../core/services/rommates-matching-service';
import { AdminRoutingModule } from "../../../../../features/admin/admin-routing-module";
import { AuthService } from '../../../../../core/services/auth';

@Component({
  selector: 'app-rommates-matching',
  imports: [AdminRoutingModule, CommonModule],
  templateUrl: './rommates-matching.html',
  styleUrl: './rommates-matching.css',
})
export class RommatesMatching implements OnInit {
  matches: MatchResult[] = [];
  gender!: string;
  defaultMaleImage = 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg';
  defaultFemaleImage = 'https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg';
  isLoading: boolean = true;


  constructor(private matchService: RommatesMatchingService, private authService: AuthService) { }

  ngOnInit(): void {
    const userId = this.authService.getUserInfo()?.id;
    console.log(userId);
    if (userId) {
      this.loadUserMatches(userId);
    } else {
      console.error('User is not logged in or ID is missing');
      this.isLoading = false;
    }
  }

  loadUserMatches(id: string): void {
    this.matchService.getRoommateMatches(id).subscribe({
      next: (data) => { this.matches = data; this.isLoading = false; },
      error: (error) => { console.error('Error', error); this.isLoading = false; }
    });
  }

  handleImageError(event: any) {
    event.target.src = this.defaultMaleImage;
  }

  // Helper to colorize the score
  getScoreColor(score: number): string {
    if (score >= 90) return 'success'; // Green
    if (score >= 70) return 'warning'; // Yellow
    return 'danger'; // Red
  }



}
