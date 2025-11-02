// multi-select-option-field.component.ts
import {
  Component, 
  input, 
  signal, 
  effect, 
  ElementRef, 
  ViewChild, 
  HostListener,
  OnInit
} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgFor, NgIf} from '@angular/common';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

type Option = { key: any; value: string };

@Component({
  selector: 'app-multi-select-option-field',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgFor,
    NgIf,
    MatPseudoCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule
  ],
  templateUrl: './multi-select-option-field.html',
  styleUrl: './multi-select-option-field.scss',
  standalone: true
})
export class MultiSelectOptionField implements OnInit {
  @ViewChild('selectTrigger') selectTrigger!: ElementRef<HTMLDivElement>;
  @ViewChild('multiSelectWrapper') multiSelectWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly frmGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly label = input.required<string>();
  readonly isReadonly = input<boolean>();
  readonly options = input<Option[] | null>(null);
  readonly isVertical = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly showSelectAll = input<boolean>(true);
  readonly searchable = input<boolean>(true); // New input to control search functionality
  readonly searchPlaceholder = input<string>('Search options...');
  readonly minSearchLength = input<number>(0); // Minimum characters before filtering
  readonly tooltip = input<string>('Select options');
  readonly tooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');
  readonly tooltipDelay = input<number>(500);
  readonly tooltipClass = input<string>('custom-tooltip');

  // Component state
  isOpen = signal(false);
  selectedValues = signal<any[]>([]);
  searchTerm = signal<string>('');
  filteredOptions = signal<Option[]>([]);

  constructor() {
    // Sync with form control value
    effect(() => {
      const control = this.frmGroup().get(this.controlName());
      if (control) {
        const controlValue = control.value || [];
        this.selectedValues.set(Array.isArray(controlValue) ? controlValue : []);
      }
    });

    // Update filtered options when search term or options change
    effect(() => {
      const opts = this.options() || [];
      const search = this.searchTerm().toLowerCase().trim();
      
      if (!search || search.length < this.minSearchLength()) {
        this.filteredOptions.set(opts);
      } else {
        const filtered = opts.filter(option => 
          option.value.toLowerCase().includes(search)
        );
        this.filteredOptions.set(filtered);
      }
    });
  }

  ngOnInit() {
    // Initialize with form control value
    const control = this.frmGroup().get(this.controlName());
    if (control && control.value) {
      const controlValue = Array.isArray(control.value) ? control.value : [];
      this.selectedValues.set(controlValue);
    }

    // Initialize filtered options
    this.filteredOptions.set(this.options() || []);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.multiSelectWrapper?.nativeElement?.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeDropdown();
    }
  }

  trackByKey(index: number, option: Option): any {
    return option.key;
  }

  isRequired(): boolean {
    const control = this.frmGroup().get(this.controlName());
    if (!control?.validator) return false;
    const validation = control.validator({} as any);
    return !!validation?.['required'];
  }

  getSelectedOptions(): Option[] {
    const selected = this.selectedValues();
    const opts = this.options() || [];
    return opts.filter(option => selected.includes(option.key));
  }

  getDisplayText(): string {
    const selectedOptions = this.getSelectedOptions();
    const totalOptions = this.options()?.length || 0;
    
    if (selectedOptions.length === 0) {
      return '';
    }

    if (selectedOptions.length === totalOptions && totalOptions > 0) {
      return 'All selected';
    }

    if (selectedOptions.length <= 2) {
      return selectedOptions.map(opt => opt.value).join(', ');
    }
    
    return `${selectedOptions.length} items selected`;
  }

  // Check if all filtered options are selected
  isAllFilteredSelected(): boolean {
    const filtered = this.filteredOptions();
    const selected = this.selectedValues();
    return filtered.length > 0 && filtered.every(option => selected.includes(option.key));
  }

  // Check if some (but not all) filtered options are selected
  isFilteredIndeterminate(): boolean {
    const filtered = this.filteredOptions();
    const selected = this.selectedValues();
    const selectedCount = filtered.filter(option => selected.includes(option.key)).length;
    return selectedCount > 0 && selectedCount < filtered.length;
  }

  // Handle select all for filtered results
  toggleSelectAllFiltered(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isReadonly()) return;

    const filtered = this.filteredOptions();
    const currentValues = [...this.selectedValues()];
    
    if (this.isAllFilteredSelected()) {
      // Deselect all filtered options
      filtered.forEach(option => {
        const index = currentValues.indexOf(option.key);
        if (index !== -1) {
          currentValues.splice(index, 1);
        }
      });
    } else {
      // Select all filtered options
      filtered.forEach(option => {
        if (!currentValues.includes(option.key)) {
          currentValues.push(option.key);
        }
      });
    }

    this.selectedValues.set(currentValues);
    
    // Update form control
    const control = this.frmGroup().get(this.controlName());
    if (control) {
      control.setValue(currentValues);
      control.markAsTouched();
    }
  }

  toggleOption(option: Option, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isReadonly()) return;

    const currentValues = [...this.selectedValues()];
    const index = currentValues.indexOf(option.key);

    if (index === -1) {
      currentValues.push(option.key);
    } else {
      currentValues.splice(index, 1);
    }

    this.selectedValues.set(currentValues);
    
    // Update form control
    const control = this.frmGroup().get(this.controlName());
    if (control) {
      control.setValue(currentValues);
      control.markAsTouched();
    }
  }

  isOptionSelected(option: Option): boolean {
    return this.selectedValues().includes(option.key);
  }

  onTriggerClick(): void {
    if (!this.isReadonly()) {
      this.toggleDropdown();
    }
  }

  onInputClick(event: Event): void {
    if (!this.searchable()) {
      this.toggleDropdown();
    } else if (!this.isOpen()) {
      this.openDropdown();
    }
  }

  onToggleClick(event: Event): void {
    event.stopPropagation();
    if (!this.isReadonly()) {
      this.toggleDropdown();
      // Focus the input when opening via toggle button
      if (this.isOpen() && this.searchable()) {
        setTimeout(() => {
          if (this.searchInput) {
            this.searchInput.nativeElement.focus();
          }
        });
      }
    }
  }

  onInputFocus(): void {
    if (!this.isReadonly() && this.searchable()) {
      this.openDropdown();
    }
  }

  onInputBlur(): void {
    // Delay closing to allow option clicks
    setTimeout(() => {
      this.closeDropdown();
      // Reset search term when closing if searchable
      if (this.searchable()) {
        this.clearSearch();
      }
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isReadonly()) return;

    const filteredOpts = this.filteredOptions();

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.searchable() || event.key === 'Enter') {
          event.preventDefault();
          if (!this.isOpen()) {
            this.toggleDropdown();
          }
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
          if (this.searchInput) {
            this.searchInput.nativeElement.blur();
          }
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.closeDropdown();
        }
        break;
    }
  }

  onSearchInput(event: Event): void {
    if (!this.searchable()) return;
    
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    
    if (!this.isOpen()) {
      this.openDropdown();
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    // This method is no longer needed since search is in the main input
    // Keeping for backward compatibility but functionality moved to onKeyDown
    event.stopPropagation();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  openDropdown(): void {
    if (!this.isReadonly()) {
      this.isOpen.set(true);
      // Focus search input after dropdown opens only if searchable
      if (this.searchable()) {
        setTimeout(() => {
          if (this.searchInput) {
            this.searchInput.nativeElement.focus();
          }
        });
      }
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.clearSearch();
  }

  toggleDropdown(): void {
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  hasSearchResults(): boolean {
    return this.filteredOptions().length > 0;
  }

  getSearchResultsText(): string {
    const filtered = this.filteredOptions().length;
    const total = this.options()?.length || 0;
    return filtered === total ? '' : `${filtered} of ${total} options`;
  }
}