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
  private apiUrl = 'https://www.googleapis.com/youtube/v3/search';

  search(query: string, isKaraokeMode: boolean = false, pageToken?: string): Observable<YouTubeSearchResult> {
    const finalQuery = isKaraokeMode ? `${query} karaoke` : query;
    let params = new HttpParams()
      .set('part', 'snippet')
      .set('type', 'video')
      .set('maxResults', '12')
      .set('q', finalQuery)
      .set('key', environment.youtubeApiKey);

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const items: Song[] = response.items.map((item: any) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
        }));
        
        return {
          items,
          nextPageToken: response.nextPageToken,
          totalResults: response.pageInfo?.totalResults
        };
      }),
      catchError(error => {
        console.error('YouTube API error:', error);
        return throwError(() => error);
      })
    );
  }
}
