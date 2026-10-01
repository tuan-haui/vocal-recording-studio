export interface VocalEffectConfig {
  bass: number;       // LowShelf gain (-10 to 10 dB)
  treble: number;     // HighShelf gain (-10 to 10 dB)
  reverb: number;     // Convolver wet/dry mix (0 to 100)
  echo: number;       // Delay feedback mix (0 to 100)
  compression: number; // Compressor threshold/ratio mix (0 to 100)
}

export type PresetName = 'original' | 'studio' | 'echo' | 'deep' | 'bright';

export const VOCAL_PRESETS: Record<PresetName, VocalEffectConfig> = {
  original: {
    bass: 0,
    treble: 0,
    reverb: 0,
    echo: 0,
    compression: 0
  },
  studio: {
    bass: 1,
    treble: 2,
    reverb: 15,
    echo: 0,
    compression: 60
  },
  echo: {
    bass: 0,
    treble: 1,
    reverb: 35,
    echo: 45,
    compression: 40
  },
  deep: {
    bass: 5,
    treble: -1,
    reverb: 10,
    echo: 0,
    compression: 55
  },
  bright: {
    bass: -1,
    treble: 5,
    reverb: 8,
    echo: 0,
    compression: 45
  }
};
