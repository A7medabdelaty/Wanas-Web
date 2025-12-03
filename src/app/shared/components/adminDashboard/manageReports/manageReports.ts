import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFlag, faUsers } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manageReports',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './manageReports.html',
  styleUrl: './manageReports.css',
})
export class ManageReports {
  faFlag = faFlag;
  faUsers = faUsers;
}
