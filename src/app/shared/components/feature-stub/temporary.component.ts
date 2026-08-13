import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-feature-stub',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-full bg-gradient-to-br from-slate-50 to-red-50 p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-3 mb-4">
          <a routerLink="/dashboard" class="text-slate-500 hover:text-[#940103] inline-flex items-center gap-1 text-sm">
            <mat-icon class="!text-base !w-4 !h-4">arrow_back</mat-icon> Dashboard
          </a>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-2xl bg-[#940103]/10 text-[#940103] flex items-center justify-center">
              <mat-icon class="!text-3xl !w-7 !h-7">{{ icon }}</mat-icon>
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-slate-800">{{ title }}</h1>
              <p *ngIf="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
            </div>
          </div>

          <div class="border-t border-slate-100 mt-4 pt-6">
            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <mat-icon class="!text-5xl !w-12 !h-12 text-slate-400">construction</mat-icon>
              <p class="mt-3 text-slate-600 font-medium">This module is under construction</p>
              <p class="text-sm text-slate-500 mt-1">Demo-faithful UI shell. Wire to backend API endpoints to enable.</p>
            </div>

            <div *ngIf="features.length" class="mt-6">
              <h2 class="text-sm font-semibold text-slate-700 mb-2">Capabilities</h2>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <li *ngFor="let f of features" class="flex items-start gap-2 text-sm text-slate-700">
                  <mat-icon class="!text-base !w-4 !h-4 text-emerald-600">check_circle</mat-icon>
                  <span>{{ f }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TemporaryComponent {
  @Input() title = 'Feature';
  @Input() subtitle = '';
  @Input() icon = 'widgets';
  @Input() features: string[] = [];
}
