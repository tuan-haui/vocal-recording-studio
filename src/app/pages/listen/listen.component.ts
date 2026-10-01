import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KaraokePlayerComponent } from '../../features/karaoke-player/karaoke-player.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageSelectComponent } from '../../shared/components/language-select/language-select.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { Song } from '../../core/models';

@Component({
  selector: 'app-listen',
  standalone: true,
  imports: [CommonModule, KaraokePlayerComponent, TranslatePipe, LanguageSelectComponent, ThemeToggleComponent],
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss']
})
export class ListenComponent {
  currentSong = signal<Song | null>(null);
  favoritesService = inject(FavoritesService);
  translateService = inject(TranslateService);
  router = inject(Router);

  constructor() {
    // Tự động phát bài đầu tiên nếu có
    effect(() => {
      if (!this.currentSong() && this.favoritesService.favorites().length > 0) {
        this.currentSong.set(this.favoritesService.favorites()[0]);
      }
    });
  }

  onSongSelected(song: Song): void {
    this.currentSong.set(song);
  }

  goToStudio(tab: string): void {
    this.router.navigate(['/'], { queryParams: { tab } });
  }
}
