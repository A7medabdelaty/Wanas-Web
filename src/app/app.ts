import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";
import { FooterComponent } from "./layout/footer/footer";
import { AiChatbotComponent } from "./features/ai-chatbot/ai-chatbot.component";
import { filter } from 'rxjs';
import { NotificationService } from './core/services/notification.service';
import { SidebarService } from "./layout/sidebar/sidebar.service";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppbarComponent, FooterComponent, AiChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Wanas-Web');
  private router = inject(Router);
  
  protected showFullLayout = signal(true);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isAuthPage = event.urlAfterRedirects.includes('/auth/login') || 
                         event.urlAfterRedirects.includes('/auth/register') || 
                         event.urlAfterRedirects.includes('/auth/emailConfirmation');
      this.showFullLayout.set(!isAuthPage);
    });
  // Initialize notification service to start listening to SignalR events
  private notificationService = inject(NotificationService);

  get isSidebarCollapsed() {
    return this.sidebarService.isCollapsed();
  }
}

