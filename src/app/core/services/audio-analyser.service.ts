import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioAnalyserService {
  // Signal for input level (0-1 normalized)
  inputLevel = signal<number>(0);
  isActive = signal<boolean>(false);

  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;

  // Connect to a MediaStream and start analysis
  connect(stream: MediaStream): void {
    this.disconnect(); // Clean up any previous connection

    this.audioContext = new AudioContext();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyserNode);
    // Do NOT connect analyser to destination to avoid feedback

    const bufferLength = this.analyserNode.frequencyBinCount;
    this.frequencyData = new Uint8Array(bufferLength);
    this.timeDomainData = new Uint8Array(this.analyserNode.fftSize);

    this.isActive.set(true);
    this.startLevelMonitoring();
  }

  // Get frequency data for visualization
  getFrequencyData(): Uint8Array | null {
    if (this.analyserNode && this.frequencyData) {
      this.analyserNode.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return null;
  }

  // Get time domain (waveform) data
  getTimeDomainData(): Uint8Array | null {
    if (this.analyserNode && this.timeDomainData) {
      this.analyserNode.getByteTimeDomainData(this.timeDomainData);
      return this.timeDomainData;
    }
    return null;
  }

  // Get the analyser node (for components that need direct access)
  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  // Disconnect and clean up
  disconnect(): void {
    this.stopLevelMonitoring();
    
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.frequencyData = null;
    this.timeDomainData = null;
    this.isActive.set(false);
    this.inputLevel.set(0);
  }

  private startLevelMonitoring(): void {
    const update = () => {
      if (!this.analyserNode || !this.timeDomainData) return;

      this.analyserNode.getByteTimeDomainData(this.timeDomainData);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < this.timeDomainData.length; i++) {
        const normalized = (this.timeDomainData[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / this.timeDomainData.length);
      this.inputLevel.set(Math.min(1, rms * 3)); // Scale up for better visibility

      this.animationFrameId = requestAnimationFrame(update);
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  private stopLevelMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
