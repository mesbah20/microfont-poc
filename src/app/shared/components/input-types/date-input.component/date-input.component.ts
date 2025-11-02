import { ChangeDetectionStrategy, Component, input, effect, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatInput, MatSuffix } from '@angular/material/input';
import { NgClass } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../adapter/custom-date.adapter';
import { AppDateFormatsConstant } from '../../../constant/app-date-formats.constant';
import { MatTooltipModule } from '@angular/material/tooltip';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD' | 'DD MMM, YYYY';

@Component({
  selector: 'lds-date-input',
  imports: [
    FormsModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatInput,
    ReactiveFormsModule,
    MatSuffix,
    MatTooltipModule,
    NgClass
  ],
  templateUrl: './date-input.component.html',
  standalone: true,
  styleUrl: './date-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: AppDateFormatsConstant }
  ],
})
export class DateInputComponent {
  readonly frmGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly label = input.required<string>();
  readonly isReadonly = input<boolean>(false);
  readonly dateFormat = input<DateFormat>('DD/MM/YYYY');
  readonly isVertical = input<boolean>(false);

  private dateAdapter = inject(DateAdapter) as CustomDateAdapter;
  readonly tooltip = input<string>('Select a date');
  readonly tooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');
  readonly tooltipDelay = input<number>(500);
  readonly tooltipClass = input<string>('custom-tooltip');
  constructor() {
    // Add custom validator when component initializes
    effect(() => {
      const control = this.frmGroup().get(this.controlName());
      if (control) {
        const existingValidators = control.validator;
        control.setValidators([
          ...(existingValidators ? [existingValidators] : []),
          this.dateFormatValidator.bind(this)
        ]);
        control.updateValueAndValidity();
      }
    });

    // Update date adapter format when dateFormat input changes
    effect(() => {
      this.dateAdapter.setFormat(this.dateFormat());
    });
  }

  isRequired(): boolean {
    const control = this.frmGroup().get(this.controlName());
    if (!control?.validator) return false;
    const validation = control.validator({} as any);
    return !!validation?.['required'];
  }

  // Method to get display format (always 'DD MMM, YYYY')
  getDisplayFormat(): string {
    return 'DD MMM, YYYY';
  }

  // Method to get the actual date format for validation
  getActualDateFormat(): DateFormat {
    return this.dateFormat();
  }

  getDateSeparator(): string {
    if (this.dateFormat() === 'DD MMM, YYYY') {
      return ' '; 
    }
    return this.dateFormat().includes('/') ? '/' : '-';
  }

  // Handle date selection from calendar
  onDateSelected(event: any): void {
    if (event.value instanceof Date) {
      const date = event.value as Date;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${String(date.getDate()).padStart(2, '0')} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
      
      // Update the form control with the formatted date string
      const control = this.frmGroup().get(this.controlName());
      if (control) {
        control.setValue(formattedDate);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
  const format = this.dateFormat();
  const input = event.target as HTMLInputElement;
  const currentValue = input.value;
  const cursorPosition = input.selectionStart || 0;
  const separator = this.getDateSeparator();

  // Allowed keys
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
    'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'
  ];

  const isNumberKey = (event.key >= '0' && event.key <= '9');
  const isSeparatorKey = event.key === separator;

  if (!allowedKeys.includes(event.key) && !isNumberKey && !isSeparatorKey) {
    event.preventDefault();
    return;
  }

  if (isNumberKey) {
    const newValue = currentValue.substring(0, cursorPosition) + event.key + currentValue.substring(cursorPosition);

    // 🚨 Check validity of the partial input before allowing
    if (!this.isPartialInputValid(newValue)) {
      event.preventDefault();
      return;
    }

    // If we should add a separator next, do it safely
    if (this.shouldAddSeparator(newValue, cursorPosition + 1)) {
      event.preventDefault();

      const valueWithSeparator = newValue + separator;
      input.value = valueWithSeparator;
      input.setSelectionRange(valueWithSeparator.length, valueWithSeparator.length);

      // Fire Angular change detection
      const changeEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(changeEvent);
    }
  }
}


  // onKeyDown(event: KeyboardEvent): void {
  //   const format = this.dateFormat();
    
  //   // Handle the 'DD MMM, YYYY' display format
  //   if (format === 'DD MMM, YYYY') {
  //     const allowedKeys = [
  //       'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
  //       'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste', ' '
  //     ];
      
  //     const isNumberKey = (event.key >= '0' && event.key <= '9');
  //     const isLetterKey = (event.key >= 'a' && event.key <= 'z') || (event.key >= 'A' && event.key <= 'Z');
  //     const isCommaKey = event.key === ',';
      
  //     if (!allowedKeys.includes(event.key) && !isNumberKey && !isLetterKey && !isCommaKey) {
  //       event.preventDefault();
  //       return;
  //     }
  //     return; // Don't apply auto-separator logic for this format
  //   }
    
  //   // Original logic for other formats
  //   const allowedKeys = [
  //     'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
  //     'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'
  //   ];
    
  //   const isNumberKey = (event.key >= '0' && event.key <= '9');
  //   const isSeparatorKey = event.key === this.getDateSeparator();
    
  //   if (!allowedKeys.includes(event.key) && !isNumberKey && !isSeparatorKey) {
  //     event.preventDefault();
  //     return;
  //   }
    
  //   // Auto-add separators but be less aggressive
  //   const input = event.target as HTMLInputElement;
  //   const currentValue = input.value;
  //   const cursorPosition = input.selectionStart || 0;
    
  //   if (isNumberKey) {
  //     const newValue = currentValue.substring(0, cursorPosition) + event.key + currentValue.substring(cursorPosition);
  //     console.log("New value:", newValue);
  //     // Only auto-add separator if we're at the right position and not in the middle of editing
  //     if (this.shouldAddSeparator(newValue, cursorPosition) && cursorPosition === currentValue.length) {
  //       event.preventDefault();
  //       const separator = this.getDateSeparator();
  //       const valueWithSeparator = currentValue + event.key + separator;
  //       input.value = valueWithSeparator;
  //       input.setSelectionRange(valueWithSeparator.length, valueWithSeparator.length);
        
  //       // Trigger Angular change detection
  //       const changeEvent = new Event('input', { bubbles: true });
  //       input.dispatchEvent(changeEvent);
  //     }
  //   }
  // }

  onInputChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Ensure we're working with a string
  if (typeof value !== 'string') {
    value = String(value || '');
  }
  
  const format = this.dateFormat();
  const control = this.frmGroup().get(this.controlName());
  
  // Handle the 'DD MMM, YYYY' display format
  if (format === 'DD MMM, YYYY') {
    // Allow letters, numbers, spaces, and commas for month abbreviation format
    const cleanValue = value.replace(/[^0-9A-Za-z\s,]/g, '');
    if (cleanValue !== value) {
      input.value = cleanValue;
      control?.setValue(cleanValue);
      // Set invalid characters error
      control?.setErrors({ ...control.errors, invalidCharacters: true });
      return;
    } else {
      // Remove invalidCharacters error if input is clean
      if (control?.errors?.['invalidCharacters']) {
        const errors = { ...control.errors };
        delete errors['invalidCharacters'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  } else {
    // Remove any characters that are not numbers or the expected separator
    const separator = this.getDateSeparator();
    const cleanValue = value.replace(new RegExp(`[^0-9\\${separator}]`, 'g'), '');
    
    if (cleanValue !== value) {
      input.value = cleanValue;
      control?.setValue(cleanValue);
      // Set invalid characters error
      control?.setErrors({ ...control.errors, invalidCharacters: true });
      return;
    } else {
      // Remove invalidCharacters error if input is clean
      if (control?.errors?.['invalidCharacters']) {
        const errors = { ...control.errors };
        delete errors['invalidCharacters'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }
  
  // Only validate if the input looks like it might be complete or nearly complete
  if (value.length > 0) {
    if (!this.isPartialInputValid(value)) {
      this.clearField();
    }
  }
}


getDetailedErrorMessage(): string {
  const control = this.frmGroup().get(this.controlName());
  if (!control || !control.touched) return '';
  
  const errors = control.errors;
  if (!errors) return '';
  
  // Check for required error first
  if (errors['required']) {
    return `${this.label()} is required!`;
  }
  
  // Check for invalid characters
  if (errors['invalidCharacters']) {
    if (this.dateFormat() === 'DD MMM, YYYY') {
      return 'Only numbers, letters, spaces and commas are allowed';
    } else {
      return `Only numbers and ${this.getDateSeparator()} are allowed`;
    }
  }
  
  // Check for format errors
  if (errors['invalidDateFormat']) {
    return `Please enter date in ${this.dateFormat()} format`;
  }
  
  // Check for invalid date with detailed info
  if (errors['invalidDate']) {
    const details = errors['invalidDateDetails'];
    if (details) {
      return `${details.monthName} ${details.year} only has ${details.maxDays} days. You entered day ${details.enteredDay}`;
    }
    return 'Please enter a valid date';
  }
  
  return 'Please enter a valid date';
}

  onBlur(): void {
    const control = this.frmGroup().get(this.controlName());
    if (control && control.value) {
      // Ensure we have a string value
      const stringValue = typeof control.value === 'string' ? control.value : String(control.value);
      
      // Only validate complete dates on blur - don't clear partial input
      if (this.isCompleteDateInput(stringValue)) {
        const format = this.dateFormat();
        let isValid = false;
        
        if (format === 'DD MMM, YYYY') {
          isValid = this.isValidMonthAbbreviationFormat(stringValue);
        } else {
          isValid = this.isValidDateFormat(stringValue);
        }
        
        if (!isValid) {
          this.clearField();
        }
      }
    }
  }

  private isCompleteDateInput(value: string): boolean {
    if (!value) return false;
    
    const format = this.dateFormat();
    
    // Handle the 'DD MMM, YYYY' display format
    if (format === 'DD MMM, YYYY') {
      // Check if it matches the pattern "18 Aug, 2025" or "18 Aug 2025"
      const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*,?\s*(\d{4})$/);
      return !!match;
    }
    
    const separator = this.getDateSeparator();
    const parts = value.split(separator);
    
    // Don't validate if it ends with separator (still typing)
    if (value.endsWith(separator)) return false;
    
    // Check if we have 3 non-empty parts
    if (parts.length !== 3) return false;
    
    // Check that all parts have content and reasonable lengths
    if (format.startsWith('YYYY')) {
      return parts[0].length === 4 && parts[1].length >= 1 && parts[1].length <= 2 && parts[2].length >= 1 && parts[2].length <= 2;
    } else {
      return parts[0].length >= 1 && parts[0].length <= 2 && parts[1].length >= 1 && parts[1].length <= 2 && parts[2].length === 4;
    }
  }

  private clearField(): void {
    const control = this.frmGroup().get(this.controlName());
    if (control) {
      control.disable;
      control.setValue('');
      control.markAsTouched();
    }
  }

  private preventFurtherWriting(): void {
  const control = this.frmGroup().get(this.controlName());
  if (control && !this.isPartialInputValid(control.value)) {
    const inputEl = document.querySelector(
      `[formcontrolname="${this.controlName()}"]`
    ) as HTMLInputElement;

    if (inputEl) {
      inputEl.readOnly = true; // 🚫 stops further writing
    }
  }
}


  private isPartialInputValid(value: string): boolean {
    if (!value) return true;
    
    const format = this.dateFormat();
    
    // Handle the 'DD MMM, YYYY' display format
    if (format === 'DD MMM, YYYY') {
      return this.isPartialMonthAbbreviationInputValid(value);
    }
    
    const separator = this.getDateSeparator();
    const parts = value.split(separator);
    
    // Allow trailing separators during typing (e.g., "02/03/")
    if (value.endsWith(separator)) {
      return true;
    }
    
    // Very lenient validation for partial input - only check obvious errors
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      // Allow completely empty parts during typing
      if (part === '') continue;
      
      const num = parseInt(part);
      if (isNaN(num)) return false;
      
      // Basic range checks based on position and format
      if (format.startsWith('YYYY')) {
        if (i === 0) { // Year position
          if (part.length > 4) return false;
          if (part.length === 4 && (num < 1900 || num > 2030)) return false;
          if (part.length === 3 && num > 203) return false;
          if (part.length === 2 && num > 29) return false;
          if (part.length === 1 && num > 2) return false;
        } else if (i === 1) { // Month position
          if (part.length > 2) return false;
          if (part.length === 2 && (num > 12 || num < 1)) return false;
        } else if (i === 2) { // Day position  
          if (part.length > 2) return false;
          if (part.length === 2 && (num > 31 || num < 1)) return false;
          if (part.length === 1 && num > 3) return false;
        }
      } else if (format.startsWith('DD')) {
        console.log("DD format detected")
        if (i === 0) { // Day position
          if (part.length === 2 && (num > 31 || num < 1)) return false;
          if (part.length > 2) return false;
          if (part.length === 1 && num > 3) return false;
        } else if (i === 1) { // Month position
          if (part.length > 2) return false;
          if (part.length == 2 && (num > 12 || num < 1)) return false;
        } else if (i === 2) { // Year position
          if (part.length > 4) return false;
          if (part.length === 4 && (num < 1900 || num > 2030)) return false;
          if (part.length === 3 && num > 299) return false;
          if (part.length === 2 && num > 29) return false;
          if (part.length === 1 && num > 2) return false;
        }
      } else if (format.startsWith('MM')) {
        if (i === 0) { // Month position
          if (part.length > 2) return false;
          if (part.length === 2 && (num > 12 || num < 1)) return false;
        } else if (i === 1) { // Day position
          if (part.length > 2) return false;
          if (part.length === 2 && (num > 31 || num < 1)) return false;
          if (part.length === 1 && num > 3) return false;
        } else if (i === 2) { // Year position
          if (part.length > 4) return false;
          if (part.length === 4 && (num < 1900 || num > 2030)) return false;
          if (part.length === 3 && num > 299) return false;
          if (part.length === 2 && num > 29) return false;
          if (part.length === 1 && num > 2) return false;
        }
      }
    }
    
    return true;
  }



  private shouldAddSeparator(value: string, cursorPosition: number): boolean {
    const format = this.dateFormat();
    const separator = this.getDateSeparator();
    const parts = value.split(separator);
    const isSecondMonth = this.dateFormat().split(this.getDateSeparator())[1] === 'MM';
    const isFirstMonth = this.dateFormat().split(this.getDateSeparator())[0] === 'MM';
    if (parts.length === 1) {
      // First separator
      if (format.startsWith('YYYY')) {
        return parts[0].length === 4; // After year
      } else {
        if(isFirstMonth){
          if(parts[0]>'1') return true;
        }
        return parts[0].length === 2; // After day/month
      }
    } else if (parts.length === 2) {
      // Second separator
      if (format.startsWith('YYYY')) {
        return parts[1].length === 2; // After month
      } else {
        if(isSecondMonth){
          if(parts[1]>'1') return true;
        }
        return parts[1].length === 2; // After month/day
      }
    }
    
    return false;
  }

// Fixed validation methods - replace the existing ones in your component

private isValidDateFormat(value: any): boolean {
  if (!value) return true; // Empty is valid (let required validator handle it)
  
  // Convert to string if it's not already
  const stringValue = typeof value === 'string' ? value : String(value);
  
  const format = this.dateFormat();
  const separator = format.includes('/') ? '/' : '-';
  const parts = stringValue.split(separator);
  
  if (parts.length !== 3) return false;
  
  let day: number, month: number, year: number;
  
  switch (format) {
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
      [day, month, year] = parts.map(p => parseInt(p));
      break;
    case 'MM/DD/YYYY':
    case 'MM-DD-YYYY':
      [month, day, year] = parts.map(p => parseInt(p));
      break;
    case 'YYYY/MM/DD':
    case 'YYYY-MM-DD':
      [year, month, day] = parts.map(p => parseInt(p));
      break;
    default:
      return false;
  }
  
  // Check for NaN values
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  
  // Validate ranges
  if (year < 1900 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // FIXED: Proper date validation - this will catch invalid dates like June 31
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === (month - 1) && 
         date.getDate() === day;
}

private isValidMonthAbbreviationFormat(value: string): boolean {
  // Expected format: "18 Aug, 2025" or "18 Aug 2025"
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*,?\s*(\d{4})$/);
  
  if (!match) return false;
  
  const day = parseInt(match[1]);
  const monthAbbr = match[2].toLowerCase();
  const year = parseInt(match[3]);
  
  // Check for NaN values
  if (isNaN(day) || isNaN(year)) return false;
  
  // Month abbreviation mapping
  const monthMap: { [key: string]: number } = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  
  const month = monthMap[monthAbbr];
  if (month === undefined) return false;
  
  // Validate ranges
  if (year < 1900 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // FIXED: Proper date validation - this will catch invalid dates like "31 Jun, 2025"
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === (month - 1) && 
         date.getDate() === day;
}

private isPartialMonthAbbreviationInputValid(value: string): boolean {
  // Allow partial input during typing
  if (!value.trim()) return true;
  
  // For partial input, be more lenient
  // Check if it's a complete date first
  const completeMatch = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*,?\s*(\d{4})$/);
  
  if (completeMatch) {
    // If it looks complete, validate it properly
    return this.isValidMonthAbbreviationFormat(value);
  }
  
  // For partial input, just check basic patterns
  const partialPattern = /^(\d{0,2})(\s+([A-Za-z]{0,3})(\s*,?\s*(\d{0,4}))?)?$/;
  const match = value.match(partialPattern);
  
  if (!match) return false;
  
  const dayPart = match[1];
  const monthPart = match[3] || '';
  const yearPart = match[5] || '';
  
  // Basic validation for partial input
  if (dayPart) {
    const day = parseInt(dayPart);
    if (!isNaN(day) && (day < 1 || day > 31)) return false;
  }
  
  if (monthPart && monthPart.length === 3) {
    const monthMap: { [key: string]: number } = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    if (!monthMap[monthPart.toLowerCase()]) return false;
  }
  
  if (yearPart && yearPart.length === 4) {
    const year = parseInt(yearPart);
    if (!isNaN(year) && (year < 1900 || year > 2030)) return false;
  }
  
  return true;
}

private dateFormatValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.value) return null;

  let value: string;

  // Check if the value is a Date object
  if (control.value instanceof Date) {
    const date = control.value as Date;
    const format = this.dateFormat();
    
    // Format the Date object based on the current dateFormat
    if (format === 'DD MMM, YYYY') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      value = `${String(date.getDate()).padStart(2, '0')} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
    } else {
      const separator = this.getDateSeparator();
      value = format
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(date.getDate()).padStart(2, '0'));
    }
  } else {
    value = String(control.value || '');
  }

  // Validate based on the current format
  const format = this.dateFormat();
  
  if (format === 'DD MMM, YYYY') {
    return this.validateMonthAbbreviationFormat(value);
  } else {
    return this.validateStandardDateFormat(value);
  }
}

private validateMonthAbbreviationFormat(value: string): { [key: string]: any } | null {
  // Expected format: "18 Aug, 2025" or "18 Aug 2025"
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s*,?\s*(\d{4})$/);
  
  if (!match) {
    return { invalidDateFormat: true };
  }
  
  const day = parseInt(match[1]);
  const monthAbbr = match[2].toLowerCase();
  const year = parseInt(match[3]);
  
  // Check for NaN values
  if (isNaN(day) || isNaN(year)) {
    return { invalidDateFormat: true };
  }
  
  // Month abbreviation mapping
  const monthMap: { [key: string]: number } = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  
  const month = monthMap[monthAbbr];
  if (month === undefined) {
    return { invalidDateFormat: true };
  }
  
  // Validate year range
  if (year < 1900 || year > 2030) {
    return { invalidDate: true };
  }
  
  // Validate day range
  if (day < 1 || day > 31) {
    return { invalidDate: true };
  }
  
  // IMPORTANT: Check if the date actually exists (catches cases like June 31)
  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year && 
                      date.getMonth() === (month - 1) && 
                      date.getDate() === day;
  
  if (!isValidDate) {
    // Store additional info for better error messages
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return { 
      invalidDate: true,
      invalidDateDetails: {
        monthName: monthNames[month - 1],
        year: year,
        maxDays: daysInMonth,
        enteredDay: day
      }
    };
  }
  
  return null;
}
private validateStandardDateFormat(value: string): { [key: string]: any } | null {
  const format = this.dateFormat();
  const separator = format.includes('/') ? '/' : '-';
  const parts = value.split(separator);
  
  if (parts.length !== 3) {
    return { invalidDateFormat: true };
  }
  
  let day: number, month: number, year: number;
  
  switch (format) {
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
      [day, month, year] = parts.map(p => parseInt(p));
      break;
    case 'MM/DD/YYYY':
    case 'MM-DD-YYYY':
      [month, day, year] = parts.map(p => parseInt(p));
      break;
    case 'YYYY/MM/DD':
    case 'YYYY-MM-DD':
      [year, month, day] = parts.map(p => parseInt(p));
      break;
    default:
      return { invalidDateFormat: true };
  }
  
  // Check for NaN values
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { invalidDateFormat: true };
  }
  
  // Validate basic ranges
  if (year < 1900 || year > 2030 || month < 1 || month > 12 || day < 1 || day > 31) {
    return { invalidDate: true };
  }
  
  // IMPORTANT: Check if the date actually exists (catches cases like June 31)
  const date = new Date(year, month - 1, day);
  const isValidDate = date.getFullYear() === year && 
                      date.getMonth() === (month - 1) && 
                      date.getDate() === day;
  
  if (!isValidDate) {
    // Store additional info for better error messages
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return { 
      invalidDate: true,
      invalidDateDetails: {
        monthName: monthNames[month - 1],
        year: year,
        maxDays: daysInMonth,
        enteredDay: day
      }
    };
  }
  
  return null;
}

// Helper method to get days in a specific month (you can add this for additional validation if needed)
private getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

  hasError(errorCode: string): boolean {
    const control = this.frmGroup().get(this.controlName());
    return !!control?.hasError(errorCode) && control.touched;
  }
}
