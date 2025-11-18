import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpansionPanelHeader } from '../../../../shared/components/expansion-panel-header/expansion-panel-header';
import { Button } from '../../../../shared/components/input-types/button/button';
import { ToastHelperService } from '../../../../shared/services/toast-helper.service';
import { VehicleInfoService } from '../../service/vehicle-info.service';
import { VehicleInfo } from '../../model/vehicle-info.model';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, ExpansionPanelHeader, Button],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.scss',
})
export class VehicleDetails implements OnInit {
  vehicle = signal<VehicleInfo | null>(null);
  isLoading = signal(true);
  panelOpen = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleInfoService,
    private toast: ToastHelperService
  ) {}

  ngOnInit(): void {
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
          this.toast.error('Vehicle details not found.', 'Error');
          this.router.navigate(['/vehicle/list']);
          return;
        }
        this.vehicle.set(res.payload);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load vehicle details.', 'Error');
        this.router.navigate(['/vehicle/list']);
      },
    });
  }
}
