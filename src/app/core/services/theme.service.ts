import { Injectable, signal, effect, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'vocal_studio_theme';
  
  // Trạng thái theme người dùng chọn
  currentTheme = signal<Theme>(this.loadTheme());
  
  // Trạng thái theme thực tế đang áp dụng (resolved từ system)
  resolvedTheme = signal<'dark' | 'light'>('dark');

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Lắng nghe thay đổi từ system theme
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Effect để áp dụng theme khi currentTheme thay đổi
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem(this.THEME_KEY, theme);
      
      if (theme === 'system') {
        this.applyTheme(this.mediaQuery.matches ? 'dark' : 'light');
      } else {
        this.applyTheme(theme);
      }
    });
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved as Theme;
    }
    return 'system';
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  toggleTheme() {
    // Nếu đang là system, chuyển sang light hoặc dark tùy vào system
    // Còn bình thường cứ lặp: dark -> light -> dark
    const current = this.resolvedTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(resolved: 'dark' | 'light') {
    this.resolvedTheme.set(resolved);
    const body = this.document.body;
    
    if (resolved === 'light') {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } else {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    }
  }
}
