import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Song, YouTubeSearchResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private http = inject(HttpClient);
  
  // Xóa '/' ở cuối nếu có để ghép URL chính xác
  private backendApiUrl = environment.API_BASE_URL.endsWith('/') 
    ? environment.API_BASE_URL.slice(0, -1) 
    : environment.API_BASE_URL;

  search(query: string, isKaraokeMode: boolean = false, pageToken?: string): Observable<YouTubeSearchResult> {
    const finalQuery = isKaraokeMode ? `${query} karaoke` : query;
    let params = new HttpParams().set('q', finalQuery);
    
    // Gọi đến API Tìm kiếm Karaoke của BE
    return this.http.get<any>(`${this.backendApiUrl}/api/v1/karaoke/search`, { params }).pipe(
      map(response => {
        // Backend trả về: { query: string, items: KaraokeSearchItem[] }
        const items: Song[] = response.items.map((item: any) => ({
          videoId: item.id,
          title: item.title,
          channelTitle: item.channel || '',
          thumbnailUrl: item.thumbnail || '',
          duration: item.duration,
          source: 'youtube'
        }));
        
        return {
          items,
          nextPageToken: undefined, 
          totalResults: items.length
        };
      }),
      catchError(error => {
        console.error('Lỗi khi gọi BE Karaoke API:', error);
        return throwError(() => error);
      })
    );
  }

  // API lấy trực tiếp audio stream url mà không cần Iframe
  getStreamingUrl(videoId: string): Observable<{ audio_url: string, duration?: number }> {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return this.http.post<any>(`${this.backendApiUrl}/api/v1/karaoke/resolve`, { url }).pipe(
      map(response => {
        return {
          audio_url: response.audio_url,
          duration: response.duration
        };
      }),
      catchError(error => {
        console.error('Lỗi khi lấy stream URL từ BE:', error);
        return throwError(() => error);
      })
    );
  }
}
