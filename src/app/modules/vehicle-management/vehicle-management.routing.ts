import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { VehicleInfo } from './feature/vehicle-info/vehicle-info';
import { VehicleList } from './feature/vehicle-list/vehicle-list';
import { VehicleDetails } from './feature/vehicle-details/vehicle-details';
import { VehicleStatus } from './feature/vehicle-status/vehicle-status';

// …other route targets

export const VehicleManagementRouting: Routes = [
    {
      path: 'info',
      component: VehicleInfo
    }, 

    {
      path: 'list',
      component: VehicleList
    }, 
    {
      path: 'details/:id',
      component: VehicleDetails
    },
    {
      path: 'status/:id',
      component: VehicleStatus
    },
  // child routes, guards, data, etc.
];
