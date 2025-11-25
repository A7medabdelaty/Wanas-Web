import { Component } from '@angular/core';
import { Carousel } from "./carousel/carousel";
import { FeaturedTopRated } from "./featured-top-rated/featured-top-rated";
import { HowWanasWorks } from "./how-wanas-works/how-wanas-works";
import { AdminRoutingModule } from "../../../features/admin/admin-routing-module";

@Component({
  selector: 'app-home',
  imports: [Carousel, FeaturedTopRated, HowWanasWorks, AdminRoutingModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
