import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppbarComponent } from "./layout/appbar/appbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Wanas-Web');
}
