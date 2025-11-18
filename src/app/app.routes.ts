import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './core/auth/login/login';
import { Landing } from './modules/landing/landing/landing';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Landing },

  {
    path: 'landing', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./modules/landing/landing.routing').then(m => m.landingRouting) },
    ]
  },
  {
    path: '', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: 'mx', loadChildren: () => import('./modules/swiftmx/swiftmx.routing').then(m => m.SwiftmxRouting) },
      { path: 'dashboard', loadChildren: () => import('./modules/landing/landing.routing').then(m => m.landingRouting) },
      { path: 'hrm', loadChildren: () => import('./modules/poc/poc.routing').then(m => m.PocRouting) },
    ]
  },
   {
  path: '', component: Layout,
    data: {
       layout: 'empty'
     },
    children: [
        {
      path: 'vehicle',
       loadChildren: () =>
         import('./modules/vehicle-management/vehicle-management.routing')
          .then(m => m.VehicleManagementRouting),
     },
     ]
   },

  {path: '', redirectTo: 'usernote', pathMatch: 'full'},
  {
    path: 'poc', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/poc/poc.routing').then(m => m.PocRouting)
      },
    ]
  },
  {
    path: 'feature', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./features/feature.routing').then(m => m.featureRoutes) },
    ]
  },
  {
    path: 'Sentinel', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/Components/sentinel-routing').then(m => m.SentinelRouting)
      },
    ]
  },
  {
    path: 'report', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./features/report/report.routing').then(m => m.reportRoutes) },
    ]
  },
];


// { path: 'dashboard', loadChildren: () => import('./modules/landing/landing.routing').then(m => m.landingRouting) },

