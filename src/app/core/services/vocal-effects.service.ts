import { Injectable, signal, effect } from '@angular/core';
import { VocalEffectConfig, VOCAL_PRESETS, PresetName } from '../models';

@Injectable({ providedIn: 'root' })
export class VocalEffectsService {
  currentPreset = signal<PresetName>('original');
  effectConfig = signal<VocalEffectConfig>(VOCAL_PRESETS['original']);

  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  
  private bassNode: BiquadFilterNode | null = null;
  private trebleNode: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  
  private delayNode: DelayNode | null = null;
  private delayFeedbackNode: GainNode | null = null;
  private echoLevelNode: GainNode | null = null;
  
  private convolverNode: ConvolverNode | null = null;
  private reverbLevelNode: GainNode | null = null;
  
  private masterGainNode: GainNode | null = null;

  constructor() {
    effect(() => {
      this.applyEffectConfig(this.effectConfig());
    });
  }

  setPreset(preset: PresetName) {
    this.currentPreset.set(preset);
    this.effectConfig.set({ ...VOCAL_PRESETS[preset] });
  }

  updateConfig(config: Partial<VocalEffectConfig>) {
    this.effectConfig.update(c => ({ ...c, ...config }));
  }

  // Initialize the audio graph (called once)
  private initAudioGraph() {
    if (this.audioCtx) return;
    this.audioCtx = new AudioContext();

    // 1. EQ
    this.bassNode = this.audioCtx.createBiquadFilter();
    this.bassNode.type = 'lowshelf';
    this.bassNode.frequency.value = 200; 
    
    this.trebleNode = this.audioCtx.createBiquadFilter();
    this.trebleNode.type = 'highshelf';
    this.trebleNode.frequency.value = 3000;

    // 2. Compressor
    this.compressorNode = this.audioCtx.createDynamicsCompressor();

    // 3. Reverb
    this.convolverNode = this.audioCtx.createConvolver();
    this.reverbLevelNode = this.audioCtx.createGain();
    this.generateImpulseResponse(this.audioCtx).then(buffer => {
      if (this.convolverNode) {
        this.convolverNode.buffer = buffer;
      }
    });

    // 4. Echo (Delay)
    this.delayNode = this.audioCtx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.3; 
    
    this.delayFeedbackNode = this.audioCtx.createGain();
    this.delayFeedbackNode.gain.value = 0.3; 
    
    this.echoLevelNode = this.audioCtx.createGain();

    // 5. Output
    this.masterGainNode = this.audioCtx.createGain();
    this.masterGainNode.gain.value = 1.0; 

    // --- Connect the chain ---
    this.bassNode.connect(this.trebleNode);
    this.trebleNode.connect(this.compressorNode);

    // Compressor -> Master (Dry)
    this.compressorNode.connect(this.masterGainNode);

    // Reverb loop
    this.compressorNode.connect(this.convolverNode);
    this.convolverNode.connect(this.reverbLevelNode);
    this.reverbLevelNode.connect(this.masterGainNode);

    // Echo loop
    this.compressorNode.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedbackNode);
    this.delayFeedbackNode.connect(this.delayNode);
    this.delayNode.connect(this.echoLevelNode);
    this.echoLevelNode.connect(this.masterGainNode);

    // Master -> Speakers
    this.masterGainNode.connect(this.audioCtx.destination);

    this.applyEffectConfig(this.effectConfig());
  }

  // Connects a new HTMLAudioElement to the graph
  connectElement(audioElement: HTMLAudioElement) {
    this.initAudioGraph();

    // Disconnect old source if exists
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    // A MediaElement can only have ONE MediaElementAudioSourceNode created for it ever.
    // If we create a new Audio() element in AudioPlayerService each time, we just create a new source node.
    try {
      this.sourceNode = this.audioCtx!.createMediaElementSource(audioElement);
      // Connect new source to the start of our chain
      if (this.bassNode) {
        this.sourceNode.connect(this.bassNode);
      }
    } catch (e) {
      console.error('Error connecting audio element to VocalEffectsService', e);
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private async generateImpulseResponse(ctx: AudioContext): Promise<AudioBuffer> {
    const rate = ctx.sampleRate;
    const length = rate * 2.0; 
    const impulse = ctx.createBuffer(2, length, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      }
    }
    return impulse;
  }
  
  private applyEffectConfig(config: VocalEffectConfig): void {
    if (!this.audioCtx) return;

    if (this.bassNode) this.bassNode.gain.value = config.bass;
    if (this.trebleNode) this.trebleNode.gain.value = config.treble;
    
    if (this.compressorNode) {
      this.compressorNode.threshold.value = -10 - (config.compression / 100) * 50; 
      this.compressorNode.ratio.value = 1 + (config.compression / 100) * 9; 
    }

    if (this.reverbLevelNode) {
      this.reverbLevelNode.gain.value = config.reverb / 100;
    }

    if (this.echoLevelNode) {
      this.echoLevelNode.gain.value = config.echo / 100;
    }
  }
}
