import { VerificationService } from './../../../core/services/verification.service.ts';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carousel } from "./carousel/carousel";
import { FeaturedTopRated } from "./featured-top-rated/featured-top-rated";
import { HowWanasWorks } from "./how-wanas-works/how-wanas-works";
import { AdminRoutingModule } from "../../../features/admin/admin-routing-module";
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Carousel, FeaturedTopRated, HowWanasWorks, AdminRoutingModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
   isVerified:boolean = false;
   loaded: boolean = false;
   isLogin:boolean = false;


  constructor(private verificationService: VerificationService, private authService: AuthService ) 
  {
    this.isLogin = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    // Initialize from cached user, then keep in sync reactively
     this.verificationService.getStatus().subscribe(
      {
        next: (status) => {
          this.isVerified = status.isVerified;
          this.loaded = true;
        },
        error: (error) => {
          console.error('Error fetching verification status on appbar init:', error);
          this.loaded = true;
        }
      }
    );
  }

  get getRouterLinkClasses(): string {
    return this.isVerified ? '/verification/upload' : '/verification/status';
  } 

}
