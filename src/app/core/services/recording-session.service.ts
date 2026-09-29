import { Injectable, inject, signal, computed } from '@angular/core';
import { Recording, SessionState } from '../models';
import { AudioRecorderService } from './audio-recorder.service';
import { AudioAnalyserService } from './audio-analyser.service';
import { YoutubePlayerService } from './youtube-player.service';

@Injectable({ providedIn: 'root' })
export class RecordingSessionService {
  private recorderService = inject(AudioRecorderService);
  private analyserService = inject(AudioAnalyserService);
  private playerService = inject(YoutubePlayerService);

  // State
  sessionState = signal<SessionState>('EMPTY');
  currentTake = signal<Recording | null>(null);
  currentSongVideoId = signal<string>('');
  currentSongTitle = signal<string>('');
  recordingStartOffset = signal<number>(0);
  countdownActive = signal<boolean>(false);
  countdownValue = signal<number>(0);
  
  // Computed
  hasTake = computed(() => this.currentTake() !== null);
  canRecord = computed(() => {
    const state = this.sessionState();
    return state === 'EMPTY' || state === 'SAVED' || state === 'DELETED';
  });
  needsResolution = computed(() => this.sessionState() === 'CURRENT_TAKE');

  // Set current song context
  setSong(videoId: string, title: string): void {
    this.currentSongVideoId.set(videoId);
    this.currentSongTitle.set(title);
  }

  // Start a new recording
  private countdown(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      this.countdownActive.set(true);
      this.countdownValue.set(seconds);
      const interval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(interval);
          this.countdownActive.set(false);
          this.countdownValue.set(0);
          resolve();
        } else {
          this.countdownValue.set(seconds);
        }
      }, 1000);
    });
  }

  async startRecording(): Promise<void> {
    if (this.recorderService.isRecording()) return;

    if (!this.recorderService.hasPermission()) {
      const granted = await this.recorderService.requestPermission();
      if (!granted) return;
    }

    const stream = this.recorderService.mediaStream();
    if (stream) {
      this.analyserService.connect(stream);
    }

    // Countdown
    await this.countdown(3);

    // Capture offset and auto-play video
    this.recordingStartOffset.set(this.playerService.currentTime());
    if (!this.playerService.isPlaying()) {
      this.playerService.play();
    }

    this.sessionState.set('RECORDING');

    try {
      const blob = await this.recorderService.startRecording();
      this.onRecordingComplete(blob);
    } catch (err) {
      console.error('Recording failed:', err);
      this.sessionState.set('EMPTY');
    }
  }

  // Stop current recording  
  stopRecording(): void {
    this.recorderService.stopRecording();
    // The blob will be handled in onRecordingComplete via the Promise
  }

  // Handle completed recording
  private onRecordingComplete(blob: Blob): void {
    const objectUrl = URL.createObjectURL(blob);
    const recording: Recording = {
      id: crypto.randomUUID(),
      songVideoId: this.currentSongVideoId(),
      songTitle: this.currentSongTitle(),
      createdAt: Date.now(),
      duration: this.recorderService.recordingDuration(),
      mimeType: this.recorderService.getMimeType(),
      blob,
      objectUrl,
      status: 'current',
      offset: this.recordingStartOffset()
    };
    this.currentTake.set(recording);
    this.sessionState.set('CURRENT_TAKE');
  }

  // Save the current take (download to user's machine)
  saveTake(): void {
    const take = this.currentTake();
    if (!take || !take.blob) return;

    // Create download link
    const a = document.createElement('a');
    a.href = take.objectUrl || URL.createObjectURL(take.blob);
    const ext = take.mimeType.includes('webm') ? 'webm' : take.mimeType.includes('ogg') ? 'ogg' : 'mp4';
    a.download = `${take.songTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(take.createdAt).toISOString().slice(0,10)}.${ext}`;
    a.click();

    // Mark as saved and clean up
    this.sessionState.set('SAVED');
    this.cleanupTake();
  }

  // Delete the current take
  deleteTake(): void {
    this.sessionState.set('DELETED');
    this.cleanupTake();
  }

  // Clean up blob/objectURL resources
  private cleanupTake(): void {
    const take = this.currentTake();
    if (take) {
      if (take.objectUrl) {
        URL.revokeObjectURL(take.objectUrl);
      }
      // Clear blob reference
      this.currentTake.set(null);
    }
  }

  // Reset session for new song
  resetSession(): void {
    this.analyserService.disconnect();
    this.cleanupTake();
    this.sessionState.set('EMPTY');
  }
}
