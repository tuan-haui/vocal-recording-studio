import { Component, EventEmitter, Output, Input, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { YoutubeService } from '../../core/services/youtube.service';
import { Song } from '../../core/models';

@Component({
  selector: 'app-youtube-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './youtube-search.component.html',
  styleUrls: ['./youtube-search.component.scss']
})
export class YouTubeSearchComponent implements OnDestroy {
  @Input() isOpen = false;
  @Output() closeLibrary = new EventEmitter<void>();
  @Output() songSelected = new EventEmitter<Song>();

  private youtubeService = inject(YoutubeService);

  activeTab = signal<'youtube' | 'local'>('youtube');
  localTracks = signal<Song[]>([]);

  searchQuery = signal('');
  results = signal<Song[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedVideoId = signal<string | null>(null);

  private searchSubject = new Subject<string>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap(query => {
        if (!query.trim()) {
          this.isLoading.set(false);
          this.results.set([]);
          return of(null);
        }
        return this.youtubeService.search(query).pipe(
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
    this.searchSubject.next(query);
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery());
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
