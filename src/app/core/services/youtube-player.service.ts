import { Injectable, OnDestroy, signal, computed } from '@angular/core';

declare var YT: any;
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class YoutubePlayerService implements OnDestroy {
  playerReady = signal<boolean>(false);
  playerState = signal<number>(-1);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  volume = signal<number>(100);
  
  isPlaying = computed(() => this.playerState() === 1);

  private player: any = null;
  private timeUpdateInterval: any;

  initPlayer(elementId: string, videoId: string): void {
    if (typeof YT === 'undefined' || !YT.Player) {
      console.error('YouTube IFrame API is not loaded.');
      return;
    }

    this.player = new YT.Player(elementId, {
      videoId,
      events: {
        onReady: (event: any) => {
          this.playerReady.set(true);
          this.duration.set(this.player.getDuration());
          this.volume.set(this.player.getVolume());
        },
        onStateChange: (event: any) => {
          this.playerState.set(event.data);
          if (event.data === 1) { // Playing state
            this.startTimeUpdate();
          } else {
            this.stopTimeUpdate();
          }
        }
      }
    });
  }

  loadVideo(videoId: string): void {
    if (this.player && this.playerReady()) {
      this.player.loadVideoById(videoId);
    }
  }

  play(): void {
    if (this.player && this.playerReady()) {
      this.player.playVideo();
    }
  }

  pause(): void {
    if (this.player && this.playerReady()) {
      this.player.pauseVideo();
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
    if (this.player && this.playerReady()) {
      this.player.seekTo(seconds, true);
    }
  }

  setVolume(volume: number): void {
    if (this.player && this.playerReady()) {
      this.player.setVolume(volume);
      this.volume.set(volume);
    }
  }

  destroy(): void {
    this.stopTimeUpdate();
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.playerReady.set(false);
    this.playerState.set(-1);
    this.currentTime.set(0);
    this.duration.set(0);
  }

  private startTimeUpdate(): void {
    this.stopTimeUpdate();
    this.timeUpdateInterval = setInterval(() => {
      if (this.player && this.playerReady()) {
        this.currentTime.set(this.player.getCurrentTime());
        // Duration can change if a new video is loaded, so we also update it here occasionally
        this.duration.set(this.player.getDuration());
      }
    }, 500);
  }

  private stopTimeUpdate(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
