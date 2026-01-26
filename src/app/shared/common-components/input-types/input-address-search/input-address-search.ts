import { Component, forwardRef, input, output, OnDestroy, inject, computed, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
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
  // Input properties
  readonly label = input<string>('Address');
  readonly placeholder = input<string>('Search for area, thana, post office, or district...');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  
  // Output events
  readonly addressSelected = output<AddressDto>();
  readonly searchChanged = output<string>();
  
  // Services
  private addressService = inject(AddressService);
  private destroy$ = new Subject<void>();
  
  // Form controls
  searchControl = new FormControl('');
  
  // State management
  private selectedAddress$ = new BehaviorSubject<AddressDto | null>(null);
  filteredAddresses$: Observable<AddressDto[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  
  // ControlValueAccessor properties
  private onChange = (value: AddressDto | null) => {};
  private onTouched = () => {};
  
  // Computed properties
  readonly isDisabled = computed(() => this.disabled());
  readonly isRequired = computed(() => this.required());
  
  constructor() {
    // Setup the search pipeline
    this.filteredAddresses$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      filter(value => typeof value === 'string'), // Only process string values
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.isLoading$.next(false);
          return [];
        }
        
        this.isLoading$.next(true);
        this.searchChanged.emit(query);
        
        return this.addressService.searchAddress(query.trim()).pipe(
          map(response => {
            this.isLoading$.next(false);
            return response.data || [];
          }),
          catchError((error) => {
            console.error('Address search error:', error);
            this.isLoading$.next(false);
            return EMPTY;
          }),
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    );
    
    // Effect to handle disabled state changes
    effect(() => {
      if (this.isDisabled()) {
        this.searchControl.disable();
      } else {
        this.searchControl.enable();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedAddress$.complete();
    this.isLoading$.complete();
  }
  
  // ControlValueAccessor implementation
  writeValue(value: AddressDto | null): void {
    this.selectedAddress$.next(value);
    if (value) {
      this.searchControl.setValue(this.getDisplayValue(value), { emitEvent: false });
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }
  
  registerOnChange(fn: (value: AddressDto | null) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // The disabled state is handled by the effect in constructor
  }
  
  // Event handlers
  onAddressSelected(address: AddressDto): void {
    this.selectedAddress$.next(address);
    this.searchControl.setValue(this.getDisplayValue(address));
    this.onChange(address);
    this.addressSelected.emit(address);
  }
  
  onBlur(): void {
    this.onTouched();
  }
  
  onFocus(): void {
    // Clear the search when focusing to allow new search
    const currentAddress = this.selectedAddress$.value;
    if (currentAddress) {
      this.searchControl.setValue('');
    }
  }
  
  // Helper methods
  getDisplayValue(address: AddressDto | null): string {
    if (!address) return '';
    return `${address.areaName}, ${address.thana}, ${address.postOffice}, ${address.district}`;
  }
  
  displayFn = (address: AddressDto | null): string => {
    return address ? this.getDisplayValue(address) : '';
  };
  
  trackByFn(index: number, address: AddressDto): string {
    return address.id || `${address.areaName}-${address.thana}-${address.postOffice}-${address.district}`;
  }
  
  clearSearch(): void {
    this.searchControl.setValue('');
    this.selectedAddress$.next(null);
    this.onChange(null);
  }
}
