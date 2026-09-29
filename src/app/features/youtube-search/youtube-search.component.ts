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
            this.error.set('Failed to load search results.');
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
