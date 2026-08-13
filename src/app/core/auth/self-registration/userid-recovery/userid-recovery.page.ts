import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-userid-recovery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 class="text-2xl font-semibold text-[#940103] mb-2">Forgot User ID?</h1>
        <p class="text-sm text-slate-500 mb-6">Enter your registered email to retrieve your Customer ID.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">email</mat-icon>
            <input formControlName="email" type="email" placeholder="Registered Email"
              class="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#940103]/30 focus:border-[#940103]" />
          </div>
          <div *ngIf="sent" class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            If the email exists, your Customer ID has been sent.
          </div>
          <button type="submit"
            class="w-full bg-[#940103] hover:bg-[#7a0102] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition">
            Retrieve User ID
          </button>
          <a routerLink="/login" class="block text-center text-sm text-[#940103] hover:underline">Back to Login</a>
        </form>
      </div>
    </div>
  `,
})
export class UserIdRecoveryPage {
  form: FormGroup;
  sent = false;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }
  submit() {
    if (this.form.invalid) return;
    this.sent = true;
  }
}