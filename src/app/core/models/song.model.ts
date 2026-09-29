export interface Song {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: number;
}

export interface YouTubeSearchResult {
  items: Song[];
  nextPageToken?: string;
  totalResults: number;
}
