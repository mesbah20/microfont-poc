import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  id: string;
  name: string;
  icon: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  btn?: string;
  cssVariables: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('blue');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  themes: Theme[] = [
    {
      id: 'blue',
      name: 'Ocean Blue',
      icon: 'waves',
      primary: '#086AD8',
      secondary: '#0456b8',
      accent: '#60a5fa',
      background: '#eff6ff',
      btn: '#096EFA',
      cssVariables: {
        '--primary-50': '#eff6ff',
        '--primary-100': '#dbeafe',
        '--primary-500': '#086AD8',
        '--primary-600': '#0456b8',
        '--primary-700': '#034a9a',
      }
    },
    {
      id: 'MidnightBlue',
      name: 'Midnight Blue',
      icon: 'waves',
      primary: '#010035',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#eff6ff',
      cssVariables: {
        '--primary-50': '#eff6ff',
        '--primary-100': '#dbeafe',
        '--primary-500': '#1e3a8a',
        '--primary-600': '#1e40af',
        '--primary-700': '#034a9a',
      }
    },
    {
      id: 'emerald',
      name: 'Forest Green',
      icon: 'eco',
      primary: '#1b5743ff',
      secondary: '#047857',
      accent: '#34d399',
      background: '#ecfdf5',
      cssVariables: {
        '--primary-50': '#ecfdf5',
        '--primary-100': '#d1fae5',
        '--primary-500': '#10b981',
        '--primary-600': '#059669',
        '--primary-700': '#047857',
      }
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      icon: 'auto_awesome',
      primary: '#301934',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      background: '#f5f3ff',
      cssVariables: {
        '--primary-50': '#f5f3ff',
        '--primary-100': '#ede9fe',
        '--primary-500': '#8b5cf6',
        '--primary-600': '#7c3aed',
        '--primary-700': '#6d28d9',
      }
    },
    // {
    //   id: 'orange',
    //   name: 'Sunset Orange',
    //   icon: 'wb_sunny',
    //   primary: '#f97316',
    //   secondary: '#c2410c',
    //   accent: '#fb923c',
    //   background: '#fff7ed',
    //   cssVariables: {
    //     '--primary-50': '#fff7ed',
    //     '--primary-100': '#ffedd5',
    //     '--primary-500': '#f97316',
    //     '--primary-600': '#ea580c',
    //     '--primary-700': '#c2410c',
    //   }
    // },
    {
      id: 'rose',
      name: 'Cherry Rose',
      icon: 'favorite',
      primary: '#5a1924ff',
      secondary: '#be123c',
      accent: '#fb7185',
      background: '#fff1f2',
      cssVariables: {
        '--primary-50': '#fff1f2',
        '--primary-100': '#ffe4e6',
        '--primary-500': '#f43f5e',
        '--primary-600': '#e11d48',
        '--primary-700': '#be123c',
      }
    },
    {
      id: 'Lavendar',
      name: 'Lavendar',
      icon: 'favorite',
      primary: '#78608dff',
      secondary: '#7a5d94ff',
      accent: '#b19cc2ff',
      background: '#e6dceeff',
      cssVariables: {
        '--primary-50': '#fff1f2',
        '--primary-100': '#ffe4e6',
        '--primary-500': '#f43f5e',
        '--primary-600': '#e11d48',
        '--primary-700': '#be123c',
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: 'dark_mode',
      primary: '#374151',
      secondary: '#111827',
      accent: '#6b7280',
      background: '#f9fafb',
      cssVariables: {
        '--primary-50': '#f9fafb',
        '--primary-100': '#f3f4f6',
        '--primary-500': '#374151',
        '--primary-600': '#374151',
        '--primary-700': '#111827',
      }
    }
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initializeTheme();
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'blue';
    this.applyTheme(savedTheme);
  }

  getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  getThemeById(id: string): Theme | undefined {
    return this.themes.find(theme => theme.id === id);
  }

  applyTheme(themeId: string) {
    const theme = this.getThemeById(themeId);
    if (!theme) return;

    // Remove existing theme classes
    this.themes.forEach(t => {
      this.document.body.classList.remove(`theme-${t.id}`);
    });

    // Add new theme class
    this.document.body.classList.add(`theme-${themeId}`);

    // Apply CSS variables
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      this.document.documentElement.style.setProperty(property, value);
    });

    // Apply main theme variables
    this.document.documentElement.style.setProperty('--theme-primary', theme.primary);
    this.document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    this.document.documentElement.style.setProperty('--theme-accent', theme.accent);
    this.document.documentElement.style.setProperty('--theme-background', theme.background);
    this.document.documentElement.style.setProperty('--theme-btn', theme.btn || '');

    // Save theme preference
    localStorage.setItem('selectedTheme', themeId);
    this.currentThemeSubject.next(themeId);
  }

  resetTheme() {
    this.applyTheme('blue');
    localStorage.removeItem('selectedTheme');
  }
}