import { Component, Input, Output, EventEmitter, inject, OnDestroy, AfterViewInit, signal, computed, effect, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Song } from '../../core/models';
import { YoutubePlayerService, FavoritesService } from '../../core/services';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-karaoke-player',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './karaoke-player.component.html',
  styleUrls: ['./karaoke-player.component.scss']
})
export class KaraokePlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('localMediaElement') localMediaElements!: QueryList<ElementRef<HTMLMediaElement>>;

  @Input() set currentSong(song: Song | null) {
    this._currentSong = song;
    if (song) {
      if (song.source === 'local' && song.localUrl) {
        this.playerService.setLocalMedia(song.localUrl, song.mediaType || 'audio');
      } else if (song.videoId) {
        this.loadSong(song.videoId);
      }
      this.playerService.updateMediaSession(song.title, song.channelTitle, song.thumbnailUrl);
    }
  }

  get currentSong(): Song | null {
    return this._currentSong;
  }

  @Output() songChanged = new EventEmitter<Song>();

  private _currentSong: Song | null = null;
  private playerInitialized = false;
  private savedVolume = 100;

  playerService = inject(YoutubePlayerService);
  favoritesService = inject(FavoritesService);

  isFavorite = computed(() => {
    const song = this._currentSong;
    return song ? this.favoritesService.isFavorite(song.videoId) : false;
  });

  autoplay = signal<boolean>(true);

  constructor() {
    // Tự động chuyển bài khi kết thúc nếu bật chế độ phát liên tục
    effect(() => {
      const endedCount = this.playerService.trackEnded();
      if (endedCount > 0 && this.autoplay() && this._currentSong) {
        this.playNext();
      }
    });
  }

  ngAfterViewInit() {
    this.localMediaElements.changes.subscribe((comps: QueryList<ElementRef<HTMLMediaElement>>) => {
      if (comps.length > 0) {
        this.playerService.setLocalMediaElement(comps.first.nativeElement);
      }
    });
    // Check initially in case it rendered immediately
    if (this.localMediaElements && this.localMediaElements.length > 0) {
      this.playerService.setLocalMediaElement(this.localMediaElements.first.nativeElement);
    }
  }

  ngOnDestroy() {
    this.playerService.destroy();
  }

  loadSong(videoId: string) {
    if (!this.playerInitialized) {
      this.playerService.initPlayer('youtube-player', videoId);
      this.playerInitialized = true;
    } else {
      this.playerService.loadVideo(videoId);
    }
  }

  togglePlay() {
    this.playerService.togglePlay();
  }

  toggleFavorite(): void {
    if (this._currentSong) {
      this.favoritesService.toggleFavorite(this._currentSong);
    }
  }

  toggleAutoplay(): void {
    this.autoplay.set(!this.autoplay());
  }

  playNext(): void {
    if (!this._currentSong) return;
    const nextSong = this.favoritesService.getNextSong(this._currentSong.videoId);
    if (nextSong) {
      this.songChanged.emit(nextSong);
    }
  }

  playPrevious(): void {
    if (!this._currentSong) return;
    const prevSong = this.favoritesService.getPreviousSong(this._currentSong.videoId);
    if (prevSong) {
      this.songChanged.emit(prevSong);
    }
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
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
