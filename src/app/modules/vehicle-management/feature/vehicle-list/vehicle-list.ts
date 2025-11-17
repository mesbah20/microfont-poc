import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpansionPanelHeader } from '../../../../shared/components/expansion-panel-header/expansion-panel-header';
import { ExpansionSubPanelHeader } from '../../../../shared/components/expansion-sub-panel-header/expansion-sub-panel-header';
import { Button } from '../../../../shared/components/input-types/button/button';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { ToastHelperService } from '../../../../shared/services/toast-helper.service';
import { VehicleInfoService } from '../../service/vehicle-info.service';
import { VehicleInfo } from '../../model/vehicle-info.model';
import { DataGridComponent } from '../../../../shared/components/data-grid';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExpansionPanelHeader,
    ExpansionSubPanelHeader,
    TextBaseInput,
    Button,
    DataGridComponent,
    
    
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss',
})
export class VehicleList implements OnInit {
  frmGroup!: FormGroup;

  // panel states
  headerPanel: WritableSignal<boolean> = signal(true);
  searchPanel: WritableSignal<boolean> = signal(true);
  resultPanel: WritableSignal<boolean> = signal(true);

  // grid data
  vehicles = signal<VehicleInfo[]>([]);
  isLoading = signal(false);
  totalRecords = signal(0);

  private readonly defaultPageIndex = 0;
  private readonly defaultPageSize = 100;

  constructor(
    private fb: FormBuilder,
    private vehicleInfoService: VehicleInfoService,
    private toast: ToastHelperService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVehicles();
  }

  onSearch(): void {
    if (this.frmGroup.invalid) {
      this.frmGroup.markAllAsTouched();
      return;
    }
    this.loadVehicles();
  }

  onReset(): void {
    this.frmGroup.reset();
    this.loadVehicles();
  }

  onAddVehicle(): void {
    this.router.navigate(['/vehicle/info']);
  }

  onEditVehicle(vehicle: VehicleInfo): void {
    if (!vehicle?.id) {
      this.toast.error('Vehicle record is missing required identifier.', 'Error');
      return;
    }

    this.vehicleInfoService.getById(Number(vehicle.id)).subscribe({
      next: (response) => {
        const vehicle = response?.payload ?? null;
        if (!vehicle) {
          this.toast.error('Vehicle details could not be found.', 'Error');
          return;
        }
        this.router.navigate(['/vehicle/info'], { state: { data: vehicle } });
      },
      error: () => this.toast.error('Failed to load vehicle details for editing.', 'Error'),
    });
  }

  onAddDetails(vehicle: VehicleInfo): void {
    if (!vehicle?.id) {
      this.toast.error('Vehicle record is missing required identifier.', 'Error');
      return;
    }
    this.router.navigate(['/vehicle/details', vehicle.id]);
  }

  onChangeStatus(vehicle: VehicleInfo): void {
    if (!vehicle?.id) {
      this.toast.error('Vehicle record is missing required identifier.', 'Error');
      return;
    }
    this.router.navigate(['/vehicle/status', vehicle.id]);
  }

  private initializeForm(): void {
    this.frmGroup = this.fb.group({
      vehicleName: [''],
      registrationNumber: [''],
      noOfSeats: [
        '',
        [
          Validators.pattern(/^\d+$/),
          Validators.max(99999),
        ],
      ],
    });
  }

  private loadVehicles(): void {
    this.isLoading.set(true);
    this.vehicleInfoService
      .searchVehicles(this.frmGroup.value, this.defaultPageIndex, this.defaultPageSize)
      .subscribe({
        next: (res) => {
          if (!res?.status) {
            this.vehicles.set([]);
            this.totalRecords.set(0);
            this.toast.error(res?.message || 'Vehicle search failed.', 'Error');
            this.isLoading.set(false);
            return;
          }
          const page = res?.payload;
          const rows = page?.content ?? [];
          this.vehicles.set(rows);
          this.totalRecords.set(page?.totalElements ?? rows.length);
          this.isLoading.set(false);
        },
        error: () => {
          this.vehicles.set([]);
          this.totalRecords.set(0);
          this.isLoading.set(false);
          this.toast.error('Unable to load vehicle list.', 'Error');
        },
      });
  }
}
