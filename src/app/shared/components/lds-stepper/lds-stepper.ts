// lds-stepper.component.ts (with Material UI)
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface Step {
  title: string;
  subtitle: string;
  form: string;
  formContent: TemplateRef<any>;
  icon?: TemplateRef<any>; 
}

@Component({
  selector: 'lds-stepper',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule // Import Material button module if using mat-button
  ],
  templateUrl: './lds-stepper.html',
  styleUrls: ['./lds-stepper.scss']
})
export class LdsStepperComponent {
  @Input() cssClass: string = '';
  @Input() id: string = '';
  @Input() steps: Step[] = [];
  @Output() onSubmitCallback = new EventEmitter<void>();

  currentStepIndex: number = 0;

  nextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  previousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  goToStep(index: number) {
    this.currentStepIndex = index;
  }

  submit() {
    this.onSubmitCallback.emit();
  }
}