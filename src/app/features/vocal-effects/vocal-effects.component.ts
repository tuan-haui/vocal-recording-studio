import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VocalEffectsService } from '../../core/services/vocal-effects.service';
import { PresetName, VOCAL_PRESETS } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-vocal-effects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vocal-effects.component.html',
  styleUrls: ['./vocal-effects.component.scss']
})
export class VocalEffectsComponent {
  effectsService = inject(VocalEffectsService);
  
  presets: { id: PresetName, icon: string, label: string }[] = [
    { id: 'original', icon: 'fa-microphone', label: 'Original' },
    { id: 'studio', icon: 'fa-star', label: 'Studio' },
    { id: 'echo', icon: 'fa-podcast', label: 'Echo' },
    { id: 'deep', icon: 'fa-wave-square', label: 'Deep' },
    { id: 'bright', icon: 'fa-gem', label: 'Bright' }
  ];

  selectPreset(preset: PresetName) {
    this.effectsService.setPreset(preset);
  }

  updateConfig(key: keyof typeof VOCAL_PRESETS['original'], value: string) {
    this.effectsService.updateConfig({ [key]: parseFloat(value) });
  }
}
