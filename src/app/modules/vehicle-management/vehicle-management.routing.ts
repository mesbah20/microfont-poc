import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VehicleInfo } from './feature/vehicle-info/vehicle-info';

// …other route targets

export const VehicleManagementRouting: Routes = [
    {
      path: 'info',
      component: VehicleInfo
    }, 
  // child routes, guards, data, etc.
];
