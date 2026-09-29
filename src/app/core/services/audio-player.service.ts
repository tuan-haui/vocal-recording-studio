import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  isPlaying = signal<boolean>(false);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  
  private audio: HTMLAudioElement | null = null;
  private timeUpdateInterval: any = null;

  load(objectUrl: string, fallbackDuration?: number): void {
    this.stop();
    this.audio = new Audio(objectUrl);
    
    if (fallbackDuration) {
      this.duration.set(fallbackDuration);
    }
    
    this.audio.addEventListener('loadedmetadata', () => {
      const d = this.audio!.duration;
      if (d !== Infinity && !isNaN(d)) {
        this.duration.set(d);
      }
    });
    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.stopTimeUpdate();
      this.currentTime.set(0);
    });
  }

  play(): void {
    if (this.audio) {
      this.audio.play();
      this.isPlaying.set(true);
      this.startTimeUpdate();
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying.set(false);
      this.stopTimeUpdate();
    }
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekTo(seconds: number): void {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.currentTime.set(seconds);
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
    this.stopTimeUpdate();
  }

  private startTimeUpdate(): void {
    this.stopTimeUpdate();
    this.timeUpdateInterval = setInterval(() => {
      if (this.audio) {
        this.currentTime.set(this.audio.currentTime);
      }
    }, 100);
  }

  private stopTimeUpdate(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }
}
