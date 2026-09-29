import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { YouTubeSearchComponent } from '../../features/youtube-search/youtube-search.component';
import { KaraokePlayerComponent } from '../../features/karaoke-player/karaoke-player.component';
import { RecorderComponent } from '../../features/recorder/recorder.component';
import { CurrentTakeComponent } from '../../features/current-take/current-take.component';
import { SongChangeGuardComponent, GuardAction } from '../../features/song-change-guard/song-change-guard.component';
import { Song } from '../../core/models';
import { RecordingSessionService } from '../../core/services/recording-session.service';
import { AudioRecorderService } from '../../core/services/audio-recorder.service';

import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageSelectComponent } from '../../shared/components/language-select/language-select.component';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [
    CommonModule, 
    YouTubeSearchComponent, 
    KaraokePlayerComponent, 
    RecorderComponent, 
    CurrentTakeComponent,
    SongChangeGuardComponent,
    TranslatePipe,
    LanguageSelectComponent
  ],
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent {
  currentSong = signal<Song | null>(null);
  showGuard = signal<boolean>(false);
  isLibraryOpen = signal(false);
  activeLibraryTab = signal<'youtube' | 'local' | 'favorites'>('youtube');
  
  sessionService = inject(RecordingSessionService);
  recorderService = inject(AudioRecorderService);
  translateService = inject(TranslateService);
  router = inject(Router);
  
  private pendingSong: Song | null = null;

  openLibrary(tab: 'youtube' | 'local' | 'favorites'): void {
    this.activeLibraryTab.set(tab);
    this.isLibraryOpen.set(true);
  }

  closeLibraryOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('library-modal-overlay')) {
      this.isLibraryOpen.set(false);
    }
  }

  onExpandFavorites(): void {
    this.router.navigate(['/listen']);
  }


  onSongSelected(song: Song): void {
    // Check if there's an unsaved take
    if (this.sessionService.needsResolution()) {
      this.pendingSong = song;
      this.showGuard.set(true);
      return;
    }
    
    // No unsaved take, proceed
    this.switchToSong(song);
  }

  onGuardAction(action: GuardAction): void {
    switch (action) {
      case 'save':
        this.sessionService.saveTake();
        if (this.pendingSong) {
          this.switchToSong(this.pendingSong);
        }
        break;
      case 'delete':
        this.sessionService.deleteTake();
        if (this.pendingSong) {
          this.switchToSong(this.pendingSong);
        }
        break;
      case 'cancel':
        // Stay on current song
        break;
    }
    this.pendingSong = null;
    this.showGuard.set(false);
  }

  private switchToSong(song: Song): void {
    this.sessionService.resetSession();
    this.currentSong.set(song);
    this.sessionService.setSong(song.videoId, song.title);
  }
}
