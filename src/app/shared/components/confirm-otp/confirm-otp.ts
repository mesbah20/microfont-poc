import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './confirm-otp.html',
  styleUrl: './confirm-otp.scss',
})
export class ConfirmOtp {
  @Input() isRegisterComponent = false;
  @Input() mobileHint = '';
  @Output() otpSubmit = new EventEmitter<string>();
  @Output() goBack = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.otpSubmit.emit(this.form.value.otp);
  }

  back(): void {
    this.goBack.emit();
  }
}