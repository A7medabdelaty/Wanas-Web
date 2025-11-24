import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { FooterComponent } from "./layout/footer/footer";
import { SidebarService } from "./layout/sidebar/sidebar.service";
import { inject } from '@angular/core';
import { Carousel } from "./shared/components/carousel/carousel";
import { FeaturedTopRated } from "./shared/components/featured-top-rated/featured-top-rated";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppbarComponent, SidebarComponent, FooterComponent, Carousel, FeaturedTopRated],
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
