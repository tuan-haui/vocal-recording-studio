import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" 
            [class.is-light]="themeService.resolvedTheme() === 'light'"
            (click)="themeService.toggleTheme()"
            title="Bật/tắt giao diện Sáng/Tối">
      <div class="theme-toggle__track">
        <div class="theme-toggle__stars">
          <span class="star star-1"></span>
          <span class="star star-2"></span>
          <span class="star star-3"></span>
        </div>
        <div class="theme-toggle__clouds">
          <i class="fa-solid fa-cloud cloud-1"></i>
          <i class="fa-solid fa-cloud cloud-2"></i>
        </div>
        
        <div class="theme-toggle__thumb">
          <div class="icon-container">
            <i class="fa-solid fa-sun sun-icon"></i>
            <i class="fa-solid fa-moon moon-icon"></i>
          </div>
        </div>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .theme-toggle {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 999px;
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .theme-toggle__track {
      position: relative;
      width: 56px;
      height: 28px;
      border-radius: 999px;
      background: #1a1a2e; /* Đêm */
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
      transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    /* Thumb chứa icon */
    .theme-toggle__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a99bc4 0%, #ffffff 100%); /* Trăng */
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1), background 0.5s;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .icon-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .sun-icon, .moon-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sun-icon {
      color: #ffb547;
      /* Ban đêm: mặt trời lặn (rơi xuống) */
      transform: translate(-50%, 150%) rotate(45deg);
      opacity: 0;
    }

    .moon-icon {
      color: #4a4a68;
      /* Ban đêm: mặt trăng lên */
      transform: translate(-50%, -50%) rotate(0deg);
      opacity: 1;
    }

    /* Các yếu tố phụ (sao, mây) */
    .theme-toggle__stars {
      position: absolute;
      inset: 0;
      transition: opacity 0.5s, transform 0.5s;
      opacity: 1;
      transform: translateY(0);
    }

    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
    }
    .star-1 { width: 2px; height: 2px; top: 6px; left: 28px; animation: twinkle 2s infinite; }
    .star-2 { width: 1.5px; height: 1.5px; top: 14px; left: 40px; animation: twinkle 3s infinite 1s; }
    .star-3 { width: 1px; height: 1px; top: 8px; left: 46px; animation: twinkle 2.5s infinite 0.5s; }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }

    .theme-toggle__clouds {
      position: absolute;
      inset: 0;
      transition: opacity 0.5s, transform 0.5s;
      opacity: 0;
      transform: translateY(10px);
      color: rgba(255, 255, 255, 0.8);
      font-size: 10px;
    }

    .cloud-1 { position: absolute; top: 12px; left: 8px; }
    .cloud-2 { position: absolute; top: 8px; left: 20px; font-size: 14px; opacity: 0.6; }

    /* ============ LIGHT MODE STATE ============ */
    .is-light .theme-toggle__track {
      background: #60a5fa; /* Bầu trời sáng */
      border-color: rgba(255, 255, 255, 0.5);
    }

    .is-light .theme-toggle__thumb {
      transform: translateX(28px);
      background: linear-gradient(135deg, #ffed4a 0%, #ffb547 100%); /* Mặt trời */
    }

    .is-light .sun-icon {
      /* Ban ngày: mặt trời lên */
      transform: translate(-50%, -50%) rotate(0);
      opacity: 1;
      color: #b45309;
    }

    .is-light .moon-icon {
      /* Ban ngày: mặt trăng lặn */
      transform: translate(-50%, -150%) rotate(-45deg);
      opacity: 0;
    }

    .is-light .theme-toggle__stars {
      opacity: 0;
      transform: translateY(-10px);
    }

    .is-light .theme-toggle__clouds {
      opacity: 1;
      transform: translateY(0);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
