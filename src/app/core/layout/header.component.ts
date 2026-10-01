import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AudioRecorderService } from '../services/audio-recorder.service';
import { TranslateService } from '../services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageSelectComponent } from '../../shared/components/language-select/language-select.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LanguageSelectComponent, ThemeToggleComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  recorderService = inject(AudioRecorderService);
  router = inject(Router);
  
  isListenMode = false;
  activeTab = 'youtube';
  
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isListenMode = event.urlAfterRedirects.includes('/listen');
      if (this.isListenMode) {
        this.activeTab = 'favorites';
      } else {
        const urlParams = new URLSearchParams(event.urlAfterRedirects.split('?')[1]);
        const tab = urlParams.get('tab');
        if (tab === 'local') {
          this.activeTab = 'local';
        } else {
          this.activeTab = 'youtube';
        }
      }
    });
  }
  
  goToStudio(tab: string) {
    if (tab === 'favorites') {
      this.router.navigate(['/listen']);
    } else {
      this.router.navigate(['/'], { queryParams: { tab } });
    }
  }
}

