import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";
import { FooterComponent } from "./layout/footer/footer";
import { AiChatbotComponent } from "./features/ai-chatbot/ai-chatbot.component";
import { filter } from 'rxjs';



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
                         event.urlAfterRedirects.includes('/auth/emailConfirmation') ||
                         event.urlAfterRedirects.includes('/auth/forgot-password') ||
                         event.urlAfterRedirects.includes('/auth/forgetPassword');
      this.showFullLayout.set(!isAuthPage);
    });
  }
}
