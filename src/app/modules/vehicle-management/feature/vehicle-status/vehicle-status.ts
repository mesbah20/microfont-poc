import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpansionPanelHeader } from '../../../../shared/components/expansion-panel-header/expansion-panel-header';
import { Button } from '../../../../shared/components/input-types/button/button';
import { ToastHelperService } from '../../../../shared/services/toast-helper.service';
import { VehicleInfoService } from '../../service/vehicle-info.service';
import { VehicleInfo } from '../../model/vehicle-info.model';

@Component({
  selector: 'app-vehicle-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExpansionPanelHeader, Button],
  templateUrl: './vehicle-status.html',
  styleUrl: './vehicle-status.scss',
})
export class VehicleStatus implements OnInit {
  frmGroup!: FormGroup;
  vehicle = signal<VehicleInfo | null>(null);
  isLoading = signal(true);
  panelOpen = signal(true);

  statusOptions = [
    { key: 'AVAILABLE', value: 'Available' },
    { key: 'IN_USE', value: 'In Use' },
    { key: 'MAINTENANCE', value: 'Maintenance' },
    { key: 'UNAVAILABLE', value: 'Unavailable' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleInfoService,
    private toast: ToastHelperService
  ) {}

  ngOnInit(): void {
    this.frmGroup = this.fb.group({
      availability: ['', Validators.required],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toast.error('Vehicle identifier is missing.', 'Error');
      this.router.navigate(['/vehicle/list']);
      return;
    }
    this.loadVehicle(id);
  }

  backToList(): void {
    this.router.navigate(['/vehicle/list']);
  }

  onSubmit(): void {
    if (!this.vehicle()?.id || this.frmGroup.invalid) {
      this.frmGroup.markAllAsTouched();
      this.toast.error('Please select a status.', 'Validation');
      return;
    }

    const id = Number(this.vehicle()?.id);
    if (Number.isNaN(id)) {
      this.toast.error('Invalid vehicle identifier.', 'Error');
      return;
    }

    this.vehicleService.updateVehicleStatus(id, this.frmGroup.value.availability).subscribe({
      next: (res) => {
        if (res?.status) {
          this.toast.success('Vehicle status updated successfully.', 'Success');
          this.backToList();
        } else {
          this.toast.error(res?.message || 'Status update failed.', 'Error');
        }
      },
      error: () => this.toast.error('Failed to update vehicle status.', 'Error'),
    });
  }

  private loadVehicle(id: string): void {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      this.toast.error('Invalid vehicle identifier.', 'Error');
      this.router.navigate(['/vehicle/list']);
      return;
    }
    this.vehicleService.getById(numericId).subscribe({
      next: (res) => {
        if (!res?.payload) {
          this.toast.error('Vehicle information not found.', 'Error');
          this.router.navigate(['/vehicle/list']);
          return;
        }
        this.vehicle.set(res.payload);
        this.frmGroup.patchValue({
          availability: res.payload.availability || 'AVAILABLE',
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load vehicle information.', 'Error');
        this.router.navigate(['/vehicle/list']);
      },
    });
  }
}
