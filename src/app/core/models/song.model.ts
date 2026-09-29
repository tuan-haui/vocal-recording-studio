export type SongSource = 'youtube' | 'local';

export interface Song {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: number;
  source?: SongSource;
  localUrl?: string;
  mediaType?: 'audio' | 'video';
}

export interface YouTubeSearchResult {
  items: Song[];
  nextPageToken?: string;
  totalResults: number;
}
