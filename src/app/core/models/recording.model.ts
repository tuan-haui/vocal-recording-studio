export type RecordingStatus = 'current' | 'saved' | 'deleted';

export interface Recording {
  id: string;
  songVideoId: string;
  songTitle: string;
  createdAt: number;
  duration: number;
  mimeType: string;
  blob?: Blob;
  objectUrl?: string;
  status: RecordingStatus;
  offset?: number;
}
