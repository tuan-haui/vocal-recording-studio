import { Recording } from './recording.model';

export type SessionState = 'EMPTY' | 'RECORDING' | 'CURRENT_TAKE' | 'SAVED' | 'DELETED';

export interface RecordingSession {
  state: SessionState;
  currentTake: Recording | null;
  startOffset: number;
  recordingStartTime: number | null;
}
