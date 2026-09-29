import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioAnalyserService } from '../../core/services/audio-analyser.service';

@Component({
  selector: 'app-waveform',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waveform.component.html',
  styleUrl: './waveform.component.scss'
})
export class WaveformComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waveformCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private analyserService = inject(AudioAnalyserService);
  private animationFrameId: number | null = null;
  private accentColor = '#ff3d8b';

  ngAfterViewInit() {
    this.drawLoop();
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private drawLoop() {
    this.drawWaveform();
    this.animationFrameId = requestAnimationFrame(() => this.drawLoop());
  }

  private drawWaveform() {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw center line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const timeDomainData = this.analyserService.getTimeDomainData();
    const isActive = this.analyserService.isActive();

    if (!timeDomainData || !isActive) {
      // Draw flat line
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = this.accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    const bufferLength = timeDomainData.length;
    const sliceWidth = width / bufferLength;
    let x = 0;

    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
      const v = timeDomainData[i] / 128.0; // 128 is center for 8-bit unsigned
      const y = v * (height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
