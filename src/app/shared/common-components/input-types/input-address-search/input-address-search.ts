import { Component, forwardRef, input, output, OnDestroy, inject, computed, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Observable, Subject, BehaviorSubject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, startWith, takeUntil, map, catchError } from 'rxjs/operators';
import { AddressService } from '../../../services/address.service';
import { AddressDto } from '../../../models/address.model';

@Component({
  selector: 'input-address-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  templateUrl: './input-address-search.html',
  styleUrls: ['./input-address-search.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputAddressSearch),
      multi: true
    }
  ]
})
export class InputAddressSearch implements ControlValueAccessor, OnDestroy {
  // Input properties matching the pattern from other components
  readonly frmGroup = input.required<FormGroup>();
  readonly controlName = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('Search for area, thana, post office, or district...');
  readonly displayMode = input<'horizontal' | 'vertical' | 'outline'>('vertical');
  readonly isReadonly = input<boolean>(false);
  readonly tooltip = input<string>('');
  readonly tooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');
  readonly tooltipClass = input<string>('custom-tooltip');
  readonly customErrorMessages = input<{ [key: string]: string }>({});

  // Output events
  readonly addressSelected = output<AddressDto>();
  readonly searchChanged = output<string>();
  readonly valueChanged = output<AddressDto | null>();

  // Services
  private addressService = inject(AddressService);
  private destroy$ = new Subject<void>();

  // State management
  public selectedAddress$ = new BehaviorSubject<AddressDto | null>(null);
  filteredAddresses$: Observable<AddressDto[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  showDropdown$ = new BehaviorSubject<boolean>(false);
  searchValue = '';

  // ControlValueAccessor properties
  private onChange = (value: AddressDto | null) => {};
  private onTouched = () => {};

  // Computed properties
  readonly isDisabled = computed(() => this.frmGroup().get(this.controlName())?.disabled || false);
  readonly isRequired = computed(() => this.isRequiredField());

  constructor() {
    // Setup the search pipeline
    this.filteredAddresses$ = new Observable(subscriber => {
      // This will be handled by the search input changes
    });

    // Effect to handle form control changes
    effect(() => {
      const control = this.frmGroup().get(this.controlName());
      if (control) {
        control.valueChanges.pipe(
          takeUntil(this.destroy$)
        ).subscribe(value => {
          if (value !== this.selectedAddress$.value) {
            this.selectedAddress$.next(value);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedAddress$.complete();
    this.isLoading$.complete();
    this.showDropdown$.complete();
  }

  // Form validation methods
  isRequiredField(): boolean {
    const control = this.frmGroup().get(this.controlName());
    if (!control?.validator) return false;
    const validation = control.validator({} as any);
    return !!validation?.['required'];
  }

  hasCustomMessage(errorKey: string): boolean {
    const messages = this.customErrorMessages();
    return !!messages && errorKey in messages;
  }

  getCustomErrorMessage(errorKey: string): string {
    const customMessages = this.customErrorMessages();
    const control = this.frmGroup().get(this.controlName());
    let message = `${this.label()} has validation error: ${errorKey}`;

    if (typeof customMessages[errorKey] === 'string') {
      message = customMessages[errorKey];
    } else if (control?.errors?.[errorKey]) {
      const errorValue = control.errors[errorKey];
      if (typeof errorValue === 'string') {
        message = errorValue;
      }
    }
    return message;
  }

  // Search functionality
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value;
    this.searchValue = value;
    this.searchChanged.emit(value);

    if (!value || value.trim().length < 2) {
      this.showDropdown$.next(false);
      this.isLoading$.next(false);
      return;
    }

    this.isLoading$.next(true);
    this.showDropdown$.next(true);

    // Debounced search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(value.trim());
    }, 300);
  }

  private searchTimeout: any;
  public searchResults: AddressDto[] = [];

  private performSearch(query: string): void {
    this.addressService.searchAddress(query).pipe(
      map(response => response.data || []),
      catchError((error) => {
        console.error('Address search error:', error);
        this.isLoading$.next(false);
        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe(addresses => {
      this.searchResults = addresses;
      this.isLoading$.next(false);
    });
  }

  // Event handlers
  onAddressSelected(address: AddressDto): void {
    this.selectedAddress$.next(address);
    this.searchValue = this.getDisplayValue(address);
    this.showDropdown$.next(false);

    // Update form control
    const control = this.frmGroup().get(this.controlName());
    if (control) {
      control.setValue(address);
      control.markAsTouched();
    }

    this.addressSelected.emit(address);
    this.valueChanged.emit(address);
    this.onChange(address);
  }

  onInputFocus(): void {
    if (this.selectedAddress$.value) {
      this.searchValue = '';
    }
    this.showDropdown$.next(this.searchResults.length > 0);
  }

  onInputBlur(): void {
    // Delay hiding dropdown to allow for option selection
    setTimeout(() => {
      this.showDropdown$.next(false);
      this.onTouched();
    }, 150);
  }

  clearInput(): void {
    this.searchValue = '';
    this.selectedAddress$.next(null);
    this.showDropdown$.next(false);

    const control = this.frmGroup().get(this.controlName());
    if (control) {
      control.setValue(null);
      control.markAsTouched();
    }

    this.valueChanged.emit(null);
    this.onChange(null);
  }

  // Helper methods
  getDisplayValue(address: AddressDto | null): string {
    if (!address) return '';
    return `${address.areaName}, ${address.thana}, ${address.postOffice}, ${address.district}`;
  }

  trackByFn(index: number, address: AddressDto): string {
    return address.id || `${address.areaName}-${address.thana}-${address.postOffice}-${address.district}`;
  }

  // ControlValueAccessor implementation
  writeValue(value: AddressDto | null): void {
    this.selectedAddress$.next(value);
    this.searchValue = value ? this.getDisplayValue(value) : '';
  }

  registerOnChange(fn: (value: AddressDto | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled by computed property
  }
}
