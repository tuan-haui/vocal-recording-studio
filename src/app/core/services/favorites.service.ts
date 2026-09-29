import { Injectable, signal, effect } from '@angular/core';
import { Song } from '../models';

const STORAGE_KEY = 'vocal_studio_favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  favorites = signal<Song[]>(this.loadFavorites());

  constructor() {
    effect(() => {
      const list = this.favorites();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Lỗi khi lưu favorites vào localStorage', e);
      }
    });
  }

  isFavorite(videoId: string): boolean {
    if (!videoId) return false;
    return this.favorites().some(song => song.videoId === videoId);
  }

  toggleFavorite(song: Song): void {
    if (!song || !song.videoId) return;
    if (this.isFavorite(song.videoId)) {
      this.removeFavorite(song.videoId);
    } else {
      this.addFavorite(song);
    }
  }

  addFavorite(song: Song): void {
    if (!song || !song.videoId) return;
    if (!this.isFavorite(song.videoId)) {
      this.favorites.update(list => [song, ...list]);
    }
  }

  removeFavorite(videoId: string): void {
    this.favorites.update(list => list.filter(song => song.videoId !== videoId));
  }

  getNextSong(currentVideoId: string): Song | null {
    const list = this.favorites();
    if (list.length === 0) return null;
    const currentIndex = list.findIndex(song => song.videoId === currentVideoId);
    if (currentIndex === -1 || currentIndex === list.length - 1) {
      return list[0]; // Vòng lại bài đầu
    }
    return list[currentIndex + 1];
  }

  getPreviousSong(currentVideoId: string): Song | null {
    const list = this.favorites();
    if (list.length === 0) return null;
    const currentIndex = list.findIndex(song => song.videoId === currentVideoId);
    if (currentIndex <= 0) {
      return list[list.length - 1]; // Vòng lại bài cuối
    }
    return list[currentIndex - 1];
  }

  private loadFavorites(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Lỗi khi đọc favorites từ localStorage', e);
    }
    return [];
  }
}
