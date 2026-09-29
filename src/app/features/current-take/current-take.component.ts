import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordingSessionService } from '../../core/services/recording-session.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';

import { YoutubePlayerService } from '../../core/services/youtube-player.service';

@Component({
  selector: 'app-current-take',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-take.component.html',
  styleUrls: ['./current-take.component.scss']
})
export class CurrentTakeComponent {
  sessionService = inject(RecordingSessionService);
  audioPlayer = inject(AudioPlayerService);
  youtubePlayer = inject(YoutubePlayerService);

  private loaded = false;

  playTake(): void {
    const take = this.sessionService.currentTake();
    if (!take?.objectUrl) return;

    if (!this.loaded) {
      this.audioPlayer.load(take.objectUrl, take.duration);
      this.loaded = true;
    }
    
    if (this.audioPlayer.isPlaying()) {
      this.audioPlayer.pause();
      this.youtubePlayer.pause();
    } else {
      this.audioPlayer.play();
      // Sync YouTube player with take offset
      const offset = take.offset || 0;
      this.youtubePlayer.seekTo(offset + this.audioPlayer.currentTime());
      this.youtubePlayer.play();
    }
  }

  stopPlayback(): void {
    this.audioPlayer.stop();
    this.youtubePlayer.pause();
    this.loaded = false;
  }

  saveTake(): void {
    this.stopPlayback();
    this.sessionService.saveTake();
    this.loaded = false;
  }

  deleteTake(): void {
    this.stopPlayback();
    this.sessionService.deleteTake();
    this.loaded = false;
  }

  reRecord(): void {
    this.stopPlayback();
    this.sessionService.deleteTake();
    this.loaded = false;
    // Start new recording immediately
    this.sessionService.startRecording();
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
