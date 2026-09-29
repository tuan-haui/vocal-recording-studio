import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecorderService } from '../../core/services/audio-recorder.service';
import { AudioAnalyserService } from '../../core/services/audio-analyser.service';
import { RecordingSessionService } from '../../core/services/recording-session.service';

@Component({
  selector: 'app-recorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recorder.component.html',
  styleUrl: './recorder.component.scss'
})
export class RecorderComponent {
  recorderService = inject(AudioRecorderService);
  analyserService = inject(AudioAnalyserService);
  sessionService = inject(RecordingSessionService);

  async requestPermission() {
    await this.recorderService.requestPermission();
  }

  async startRecording() {
    await this.sessionService.startRecording();
  }

  stopRecording() {
    this.sessionService.stopRecording();
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '00:00.0';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}.${ms}`;
  }
}
