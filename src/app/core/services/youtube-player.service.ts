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
  // Source mode: 'youtube' hoặc 'local'
  currentSource = signal<'youtube' | 'local'>('youtube');
  localMediaUrl = signal<string>('');
  mediaType = signal<'audio' | 'video'>('audio');

  playerReady = signal<boolean>(false);
  playerState = signal<number>(-1);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  volume = signal<number>(100);
  
  isPlaying = computed(() => this.playerState() === 1);

  private player: any = null;
  private localMedia: HTMLAudioElement | HTMLVideoElement | null = null;
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
          if (this.currentSource() === 'youtube') {
            this.duration.set(this.player.getDuration());
            this.volume.set(this.player.getVolume());
          }
        },
        onStateChange: (event: any) => {
          if (this.currentSource() === 'youtube') {
            this.playerState.set(event.data);
            if (event.data === 1) { // Playing state
              this.startTimeUpdate();
            } else {
              this.stopTimeUpdate();
            }
          }
        }
      }
    });
  }

  loadVideo(videoId: string): void {
    this.currentSource.set('youtube');
    if (this.localMedia) {
      this.localMedia.pause();
    }
    if (this.player && this.playerReady()) {
      this.player.loadVideoById(videoId);
    }
  }

  // Hướng B: Phát file beat audio/video từ máy tính
  setLocalMedia(url: string, type: 'audio' | 'video'): void {
    this.currentSource.set('local');
    this.localMediaUrl.set(url);
    this.mediaType.set(type);

    // Dừng YouTube nếu đang phát
    if (this.player && this.playerReady()) {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }

    // Dọn dẹp local media cũ
    if (this.localMedia) {
      this.localMedia.pause();
      this.localMedia.src = '';
      this.localMedia = null;
    }

    this.localMedia = type === 'video' ? document.createElement('video') : new Audio();
    this.localMedia.src = url;
    this.localMedia.volume = this.volume() / 100;

    this.localMedia.addEventListener('loadedmetadata', () => {
      const d = this.localMedia!.duration;
      if (isFinite(d) && !isNaN(d)) {
        this.duration.set(d);
      }
    });

    this.localMedia.addEventListener('timeupdate', () => {
      if (this.currentSource() === 'local' && this.localMedia) {
        this.currentTime.set(this.localMedia.currentTime);
      }
    });

    this.localMedia.addEventListener('play', () => {
      if (this.currentSource() === 'local') {
        this.playerState.set(1);
      }
    });

    this.localMedia.addEventListener('pause', () => {
      if (this.currentSource() === 'local') {
        this.playerState.set(2);
      }
    });

    this.localMedia.addEventListener('ended', () => {
      if (this.currentSource() === 'local') {
        this.playerState.set(0);
        this.currentTime.set(0);
      }
    });
  }

  play(): void {
    if (this.currentSource() === 'youtube') {
      if (this.player && this.playerReady()) {
        this.player.playVideo();
      }
    } else if (this.localMedia) {
      this.localMedia.play();
    }
  }

  pause(): void {
    if (this.currentSource() === 'youtube') {
      if (this.player && this.playerReady()) {
        this.player.pauseVideo();
      }
    } else if (this.localMedia) {
      this.localMedia.pause();
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
    if (this.currentSource() === 'youtube') {
      if (this.player && this.playerReady()) {
        this.player.seekTo(seconds, true);
      }
    } else if (this.localMedia) {
      this.localMedia.currentTime = seconds;
      this.currentTime.set(seconds);
    }
  }

  setVolume(volume: number): void {
    this.volume.set(volume);
    if (this.currentSource() === 'youtube') {
      if (this.player && this.playerReady()) {
        this.player.setVolume(volume);
      }
    }
    if (this.localMedia) {
      this.localMedia.volume = volume / 100;
    }
  }

  destroy(): void {
    this.stopTimeUpdate();
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.localMedia) {
      this.localMedia.pause();
      this.localMedia.src = '';
      this.localMedia = null;
    }
    this.playerReady.set(false);
    this.playerState.set(-1);
    this.currentTime.set(0);
    this.duration.set(0);
  }

  private startTimeUpdate(): void {
    this.stopTimeUpdate();
    this.timeUpdateInterval = setInterval(() => {
      if (this.currentSource() === 'youtube' && this.player && this.playerReady()) {
        this.currentTime.set(this.player.getCurrentTime());
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
