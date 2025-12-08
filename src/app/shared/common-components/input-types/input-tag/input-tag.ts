 import {Component, input, output, effect} from '@angular/core';
 import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
  import {MatInputModule} from "@angular/material/input";
  import {MatTooltipModule} from "@angular/material/tooltip";
  import {NgClass} from '@angular/common';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatIconModule } from '@angular/material/icon';
  import { MatButtonModule } from '@angular/material/button';

  @Component({
    selector: 'input-tag',
    imports: [
      FormsModule,
      ReactiveFormsModule,
      NgClass,
      MatTooltipModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
    ],
    templateUrl: './input-tag.html',
    standalone: true,
    styleUrl: './input-tag.scss'
  })
  export class InputTag {
    readonly frmGroup = input.required<FormGroup>();
    readonly controlName = input.required<string>();
    readonly label = input.required<string>();
    readonly isReadonly = input<boolean>(false);
    readonly placeholder = input<string>('Add a tag...');
    readonly maxTags = input<number>(5);
    readonly displayMode = input<'horizontal' | 'vertical' | 'outline'>('vertical');
    readonly allowDuplicates = input<boolean>(false);
    readonly minLength = input<number>(1);
    readonly maxLength = input<number>(50);

    // Tooltip support
    readonly tooltip = input<string>('');
    readonly tooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');
    readonly tooltipClass = input<string>('custom-tooltip');

    // Custom error messages support
    readonly customErrorMessages = input<{ [key: string]: string }>({});

    // Outputs
    readonly onTagAdded = output<string>();
    readonly onTagRemoved = output<string>();
    readonly onTagsChanged = output<string[]>();

    currentInput = '';
    showError = false;
    errorMessage = '';

    constructor() {
      effect(() => {
        // Initialize with empty array if no value exists
        const control = this.frmGroup().get(this.controlName());
        if (control && !control.value) {
          control.setValue([]);
        }
      });
    }
    

    get tags(): string[] {
      const control = this.frmGroup().get(this.controlName());
      return control?.value || [];
    }

    get isRequired(): boolean {
      const control = this.frmGroup().get(this.controlName());
      return control?.hasValidator(this.requiredValidator) ?? false;
    }

    private requiredValidator = (control: any) => {
      return control?.value?.length > 0 ? null : { required: true };
    }

    onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Enter' && this.currentInput.trim() !== '') {
        event.preventDefault();
        this.addTag();
      }
    }

    addTag(): void {
      const newTag = this.currentInput.trim();

      if (!newTag) {
        return;
      }

      if (newTag.length < this.minLength()) {
        this.showErrorMessage(`Tag must be at least ${this.minLength()} characters`);
        return;
      }

      if (newTag.length > this.maxLength()) {
        this.showErrorMessage(`Tag cannot exceed ${this.maxLength()} characters`);
        return;
      }

      if (this.tags.length >= this.maxTags()) {
        this.showErrorMessage(`You can only add up to ${this.maxTags()} tags`);
        return;
      }

      if (!this.allowDuplicates() && this.tags.includes(newTag)) {
        this.showErrorMessage('Tag already exists');
        return;
      }

      const updatedTags = [...this.tags, newTag];
      this.updateControl(updatedTags);
      this.currentInput = '';
      this.hideError();

      this.onTagAdded.emit(newTag);
      this.onTagsChanged.emit(updatedTags);
    }

    removeTag(index: number): void {
      const tagToRemove = this.tags[index];
      const updatedTags = this.tags.filter((_, i) => i !== index);
      this.updateControl(updatedTags);
      this.hideError();

      this.onTagRemoved.emit(tagToRemove);
      this.onTagsChanged.emit(updatedTags);
    }

    private updateControl(tags: string[]): void {
      const control = this.frmGroup().get(this.controlName());
      if (control) {
        control.setValue(tags);
        control.markAsTouched();
        control.markAsDirty();
      }
    }

    private showErrorMessage(message: string): void {
      this.errorMessage = message;
      this.showError = true;
    }

    private hideError(): void {
      this.showError = false;
      this.errorMessage = '';
    }

    hasCustomErrors(): boolean {
      const control = this.frmGroup().get(this.controlName());
      if (!control?.errors) return false;

      const customKeys = Object.keys(this.customErrorMessages());
      return Object.keys(control.errors).some(key => customKeys.includes(key));
    }

    getCustomErrorKeys(): string[] {
      const control = this.frmGroup().get(this.controlName());
      if (!control?.errors) return [];

      const customKeys = Object.keys(this.customErrorMessages());
      return Object.keys(control.errors).filter(key => customKeys.includes(key));
    }

    getCustomErrorMessage(errorKey: string): string {
      return this.customErrorMessages()[errorKey] || `${this.label()} has an error.`;
    }
  }
