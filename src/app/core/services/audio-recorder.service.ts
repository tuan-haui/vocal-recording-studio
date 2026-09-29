import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioRecorderService {
  // Signals
  isRecording = signal<boolean>(false);
  hasPermission = signal<boolean>(false);
  permissionError = signal<string | null>(null);
  recordingDuration = signal<number>(0);
  mediaStream = signal<MediaStream | null>(null);

  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private durationInterval: any = null;
  private recordingResolve: ((blob: Blob) => void) | null = null;

  // Request mic permission and store the stream
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      this.mediaStream.set(stream);
      this.hasPermission.set(true);
      this.permissionError.set(null);
      return true;
    } catch (err: any) {
      this.hasPermission.set(false);
      this.permissionError.set(this.getErrorMessage(err));
      return false;
    }
  }

  // Start recording - returns a Promise<Blob> that resolves when stopped
  startRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const stream = this.mediaStream();
      if (!stream) {
        reject(new Error('No media stream available'));
        return;
      }

      this.chunks = [];
      this.recordingResolve = resolve;

      // Choose best supported MIME type
      const mimeType = this.getSupportedMimeType();
      
      try {
        this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      } catch {
        this.mediaRecorder = new MediaRecorder(stream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.chunks = [];
        this.stopDurationTimer();
        this.isRecording.set(false);
        if (this.recordingResolve) {
          this.recordingResolve(blob);
          this.recordingResolve = null;
        }
      };

      this.mediaRecorder.onerror = () => {
        this.stopDurationTimer();
        this.isRecording.set(false);
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.start(100); // collect data every 100ms
      this.startTime = Date.now();
      this.isRecording.set(true);
      this.recordingDuration.set(0);
      this.startDurationTimer();
    });
  }

  // Stop recording
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  // Get the MIME type of current recorder
  getMimeType(): string {
    return this.mediaRecorder?.mimeType || 'audio/webm';
  }

  // Release the microphone stream
  releaseStream(): void {
    const stream = this.mediaStream();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.mediaStream.set(null);
    }
    this.hasPermission.set(false);
  }

  private startDurationTimer(): void {
    this.durationInterval = setInterval(() => {
      this.recordingDuration.set((Date.now() - this.startTime) / 1000);
    }, 100);
  }

  private stopDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'audio/webm';
  }

  private getErrorMessage(err: any): string {
    if (err.name === 'NotAllowedError') return 'Microphone permission denied. Please allow microphone access.';
    if (err.name === 'NotFoundError') return 'No microphone found. Please connect a microphone.';
    if (err.name === 'NotReadableError') return 'Microphone is already in use by another application.';
    return `Microphone error: ${err.message}`;
  }
}
