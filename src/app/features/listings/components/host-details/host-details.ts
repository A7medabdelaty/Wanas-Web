import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HostDetailsDto } from '../../models/listing';

@Component({
  selector: 'app-host-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './host-details.html',
  styleUrl: './host-details.css',
})
export class HostDetails {
  @Input() host!: HostDetailsDto;
  @Output() sendMessage = new EventEmitter<void>();

  onSendMessage() {
    console.log('Send message button clicked', { host: this.host });
    this.sendMessage.emit();
  }
}
