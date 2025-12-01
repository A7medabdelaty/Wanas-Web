import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { FooterComponent } from "./layout/footer/footer";
import { SidebarService } from "./layout/sidebar/sidebar.service";
import { inject } from '@angular/core';
import { AiChatbotComponent } from "./features/ai-chatbot/ai-chatbot.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppbarComponent, SidebarComponent, FooterComponent, AiChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Wanas-Web');
  private sidebarService = inject(SidebarService);

  get isSidebarCollapsed() {
    return this.sidebarService.isCollapsed();
  }
}
