import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-language-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-select" [class.is-open]="isOpen()" (click)="toggleOpen()">
      <div class="lang-select__current">
        <img class="flag-icon" *ngIf="translateService.currentLang() === 'vi'" src="/vn.png" alt="VN">
        <img class="flag-icon" *ngIf="translateService.currentLang() === 'en'" src="/GB.png" alt="EN">
        <span class="lang-code">{{ translateService.currentLang() | uppercase }}</span>
        <i class="fa-solid fa-chevron-down caret"></i>
      </div>
      
      <div class="lang-select__dropdown" *ngIf="isOpen()">
        <button class="lang-option" [class.active]="translateService.currentLang() === 'vi'" (click)="selectLang('vi', $event)">
          <img class="flag-icon" src="/vn.png" alt="VN"> Tiếng Việt
          <i class="fa-solid fa-check check-icon" *ngIf="translateService.currentLang() === 'vi'"></i>
        </button>
        <button class="lang-option" [class.active]="translateService.currentLang() === 'en'" (click)="selectLang('en', $event)">
          <img class="flag-icon" src="/GB.png" alt="EN"> English
          <i class="fa-solid fa-check check-icon" *ngIf="translateService.currentLang() === 'en'"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }
    
    .lang-select {
      position: relative;
      cursor: pointer;
      user-select: none;
    }

    .lang-select__current {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 12px;
      border-radius: 999px;
      transition: all 0.2s ease;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
    }

    .lang-select.is-open .lang-select__current,
    .lang-select:hover .lang-select__current {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .flag-icon {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      display: inline-block;
    }

    .caret {
      font-size: 0.7rem;
      transition: transform 0.2s;
      opacity: 0.7;
    }

    .lang-select.is-open .caret {
      transform: rotate(180deg);
    }

    .lang-select__dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #1d1231;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 6px;
      min-width: 140px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 61, 139, 0.1);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 2px;
      animation: dropdownFade 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .lang-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: transparent;
      color: #a99bc4;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 8px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }

    .lang-option:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .lang-option.active {
      color: #fff;
      background: rgba(255, 61, 139, 0.15);
      font-weight: 600;
    }

    .check-icon {
      margin-left: auto;
      color: #ff3d8b;
      font-size: 0.8rem;
    }
  `]
})
export class LanguageSelectComponent {
  translateService = inject(TranslateService);
  private eRef = inject(ElementRef);
  isOpen = signal(false);

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  selectLang(lang: 'vi' | 'en', event: Event) {
    event.stopPropagation();
    this.translateService.setLang(lang);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
