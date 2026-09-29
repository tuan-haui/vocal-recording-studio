import { Component, Input, inject, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Song } from '../../core/models';
import { YoutubePlayerService } from '../../core/services/youtube-player.service';

@Component({
  selector: 'app-karaoke-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './karaoke-player.component.html',
  styleUrls: ['./karaoke-player.component.scss']
})
export class KaraokePlayerComponent implements AfterViewInit, OnDestroy {
  @Input() set currentSong(song: Song | null) {
    this._currentSong = song;
    if (song) {
      this.loadSong(song.videoId);
    }
  }

  get currentSong(): Song | null {
    return this._currentSong;
  }

  private _currentSong: Song | null = null;
  private playerInitialized = false;
  private savedVolume = 100;

  playerService = inject(YoutubePlayerService);

  ngAfterViewInit() {
    // Player will be initialized when first song is selected
  }

  ngOnDestroy() {
    this.playerService.destroy();
  }

  loadSong(videoId: string) {
    if (!this.playerInitialized) {
      // First time: create player with the video
      this.playerService.initPlayer('youtube-player', videoId);
      this.playerInitialized = true;
    } else {
      // Subsequent times: just load new video
      this.playerService.loadVideo(videoId);
    }
  }

  togglePlay() {
    this.playerService.togglePlay();
  }

  toggleMute(): void {
    if (this.playerService.volume() > 0) {
      this.savedVolume = this.playerService.volume();
      this.playerService.setVolume(0);
    } else {
      this.playerService.setVolume(this.savedVolume);
    }
  }

  onSeek(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.playerService.seekTo(Number(value));
  }

  onVolumeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.playerService.setVolume(Number(value));
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
