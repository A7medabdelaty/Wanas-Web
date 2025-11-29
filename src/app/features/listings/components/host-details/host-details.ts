import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostDetailsDto } from '../../models/listing';

@Component({
  selector: 'app-host-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './host-details.html',
  styleUrl: './host-details.css',
})
export class HostDetails {
  @Input() host!: HostDetailsDto;
}
