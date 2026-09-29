import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GuardAction = 'save' | 'delete' | 'cancel';

@Component({
  selector: 'app-song-change-guard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-change-guard.component.html',
  styleUrls: ['./song-change-guard.component.scss']
})
export class SongChangeGuardComponent {
  @Output() action = new EventEmitter<GuardAction>();

  onSave(): void {
    this.action.emit('save');
  }

  onDelete(): void {
    this.action.emit('delete');
  }

  onCancel(): void {
    this.action.emit('cancel');
  }
}
