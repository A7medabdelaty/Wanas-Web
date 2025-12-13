import { UserRole } from './../../../layout/appbar/user-role.enum';
import { User } from './../../../core/models/user';
import { VerificationService } from './../../../core/services/verification.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carousel } from "./carousel/carousel";
import { FeaturedTopRated } from "./featured-top-rated/featured-top-rated";
import { HowWanasWorks } from "./how-wanas-works/how-wanas-works";
import { AdminRoutingModule } from "../../../features/admin/admin-routing-module";
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Carousel, FeaturedTopRated, HowWanasWorks, AdminRoutingModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  isVerified: boolean = false;
  loaded: boolean = false;
  isLogin: boolean = false;
  userRole: string = UserRole.Guest;
  hasSubmitted: boolean = false;
  isBanned:boolean = false;
  isSuspended:boolean = false;


  constructor(private verificationService: VerificationService, private authService: AuthService, private userService:UserService) {
    this.isLogin = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserInfo()?.role || UserRole.Guest;
  }

  ngOnInit(): void {
    // Initialize from cached user, then keep in sync reactively
    if (this.userRole !== UserRole.Guest) {
      this.verificationService.getStatus().subscribe(
        {
          next: (status) => {
            this.isVerified = status.isVerified;
            this.hasSubmitted = status.hasSubmitted;
            this.loaded = true;
          },
          error: (error) => {
            console.error('Error fetching verification status on appbar init:', error);
            this.loaded = true;
          }
        }
      );
    }

    this.userService.getUserStatus().subscribe({
      next: (status) => {
        this.isBanned = status.isBanned;
        this.isSuspended = status.isSuspended;
      },
      error: (err) => {console.log(err);}
    })

  }

  get getRouterLinkClasses(): string {
    return this.hasSubmitted ? '/verification/status' : '/verification/upload';
  }

}
