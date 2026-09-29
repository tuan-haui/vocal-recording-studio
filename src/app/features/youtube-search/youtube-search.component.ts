import { Component, EventEmitter, Output, Input, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { YoutubeService } from '../../core/services/youtube.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Song } from '../../core/models';

import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-youtube-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './youtube-search.component.html',
  styleUrls: ['./youtube-search.component.scss']
})
export class YouTubeSearchComponent implements OnDestroy {
  @Input() set initialTab(tab: 'youtube' | 'local' | 'favorites') {
    this.activeTab.set(tab);
  }
  @Input() set currentVideoId(id: string | null | undefined) {
    if (id !== undefined) {
      this.selectedVideoId.set(id);
      setTimeout(() => {
        const activeElem = document.querySelector('.song.is-active');
        if (activeElem) {
          activeElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }
  @Output() closeLibrary = new EventEmitter<void>();
  @Output() songSelected = new EventEmitter<Song>();
  @Output() expandFavorites = new EventEmitter<void>();

  private youtubeService = inject(YoutubeService);
  favoritesService = inject(FavoritesService);
  translateService = inject(TranslateService);

  activeTab = signal<'youtube' | 'local' | 'favorites'>('youtube');
  localTracks = signal<Song[]>([]);

  searchQuery = signal('');
  isKaraokeMode = signal(false);
  results = signal<Song[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedVideoId = signal<string | null>(null);

  private searchSubject = new Subject<{query: string, isKaraoke: boolean}>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query && prev.isKaraoke === curr.isKaraoke),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap(({query, isKaraoke}) => {
        if (!query.trim()) {
          this.isLoading.set(false);
          this.results.set([]);
          return of(null);
        }
        return this.youtubeService.search(query, isKaraoke).pipe(
          catchError(() => {
            this.error.set('Không thể tải kết quả tìm kiếm.');
            this.isLoading.set(false);
            return of(null);
          })
        );
      })
    ).subscribe(searchResult => {
      if (searchResult) {
        this.results.set(searchResult.items);
      }
      this.isLoading.set(false);
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next({query, isKaraoke: this.isKaraokeMode()});
  }

  toggleKaraokeMode() {
    this.isKaraokeMode.set(!this.isKaraokeMode());
    // Trigger search again if there is a query
    if (this.searchQuery().trim()) {
      this.searchSubject.next({query: this.searchQuery(), isKaraoke: this.isKaraokeMode()});
    }
  }

  onSearch() {
    this.searchSubject.next({query: this.searchQuery(), isKaraoke: this.isKaraokeMode()});
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);

    const localSong: Song = {
      videoId: 'local-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      channelTitle: isVideo ? 'Video từ máy' : 'Beat âm thanh từ máy',
      thumbnailUrl: '',
      source: 'local',
      localUrl: objectUrl,
      mediaType: isVideo ? 'video' : 'audio'
    };

    this.localTracks.update(tracks => [localSong, ...tracks]);
    this.selectSong(localSong);

    // Reset input
    input.value = '';
  }

  selectSong(song: Song) {
    this.selectedVideoId.set(song.videoId);
    this.songSelected.emit(song);
    this.closeLibrary.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.searchSubject.complete();
  }
}
