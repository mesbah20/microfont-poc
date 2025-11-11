import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DemoService } from '../../../../shared/services/demo.service';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { NumberInput } from '../../../../shared/components/input-types/number-input/number-input';
import { Save } from '../../../../layout/layouts/layouts/navbar/actions/save/save';
import { Button } from "../../../../shared/components/input-types/button/button";

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    TextBaseInput,
    NumberInput,
    Save,
    Button
],
  providers: [DemoService],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss'
})
export class FormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private demoService = inject(DemoService);

  form!: FormGroup;
  isSaving = false;
  responseMessage = '';
  localStatus = '';

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]]
    });
  }

  onSave() {
    debugger;
  if (this.form.invalid || this.isSaving) return;

  this.isSaving = true;
  this.localStatus = 'Saving...';
  this.responseMessage = '';

  const loggedInUserId = localStorage.getItem('userId') || 'unknown';

  const payload = {
    name: this.form.value.name,
    age: this.form.value.age,
    loggedInUserId // ← এটা পাঠান
  };

  this.demoService.saveData(payload).subscribe({
    next: (res) => {
      this.responseMessage = res.message || 'Saved successfully!';
      this.localStatus = 'Saved! Notification coming...';
      this.isSaving = false;
      setTimeout(() => this.localStatus = '', 3000);
    },
    error: () => {
      this.responseMessage = 'Error occurred!';
      this.localStatus = '';
      this.isSaving = false;
    }
  });
}
}