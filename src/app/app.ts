import { User } from './core/models/user';
import { AuthService } from './core/services/auth';
import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";
import { FooterComponent } from "./layout/footer/footer";
import { AiChatbotComponent } from "./features/ai-chatbot/ai-chatbot.component";
import { filter } from 'rxjs';
import { SidebarComponent } from "./layout/sidebar/sidebar";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppbarComponent, FooterComponent, AiChatbotComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Wanas-Web');
  private router = inject(Router);
  
  protected showFullLayout = signal(true);

  constructor(private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isAuthPage = event.urlAfterRedirects.includes('/auth/login') || 
                         event.urlAfterRedirects.includes('/auth/register') || 
                         event.urlAfterRedirects.includes('/auth/emailConfirmation') ||
                         event.urlAfterRedirects.includes('/auth/forgot-password') ||
                         event.urlAfterRedirects.includes('/auth/forgetPassword');
      this.showFullLayout.set(!isAuthPage);
    });
 
  }
   get userRole(): string {
    return this.authService.getUserInfo()?.role || 'guest';
  }
  
  ngOnInit(): void {
  }
}
