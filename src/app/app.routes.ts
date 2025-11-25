import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Landing } from './shared/features/landing/landing/landing';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Landing },

  {
    path: 'landing', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./shared/features/landing/landing.routing').then(m => m.landingRouting) },
    ]
  },
  {
    path: '', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: 'mx', loadChildren: () => import('./modules/swiftmx/swiftmx.routing').then(m => m.SwiftmxRouting) },
      { path: 'dashboard', loadChildren: () => import('./shared/features/landing/landing.routing').then(m => m.landingRouting) },
      { path: 'WF', loadChildren: () => import('./modules/Sentinel/sentinel-routing').then(m => m.SentinelRouting) },
      { path: 'gl', loadChildren: () => import('./modules/finbook/finbook-routing').then(m => m.FinBookRouting) },
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
        loadChildren: () => import('./shared/features/poc/poc.routing').then(m => m.PocRouting)
      },
    ]
  },
  {
    path: 'feature', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./shared/features/feature.routing').then(m => m.featureRoutes) },
    ]
  },
  {
    path: 'rpt', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      { path: '', loadChildren: () => import('./shared/features/report/report.routing').then(m => m.reportRoutes) },
    ]
  },
];


// { path: 'dashboard', loadChildren: () => import('./modules/landing/landing.routing').then(m => m.landingRouting) },

