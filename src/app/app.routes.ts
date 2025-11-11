import {Routes} from '@angular/router';
import {Layout} from './layout/layout';
import {Login} from './core/auth/login/login';
import { Landing } from './modules/landing/landing/landing';

export const routes: Routes = [

  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: Login},
  {path: 'landing', component: Landing},
  {
    path: '', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      {path: '', loadChildren: () => import('./modules/landing/landing.routing').then(m => m.landingRouting)},
    ]
  },
  {
    path: 'mx', component: Layout,
    data: {
      layout: 'empty'
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/swiftmx/swiftmx.routing').then(m => m.SwiftmxRouting)
      },
    ]
  },
  {
    path: 'config', component: Layout,
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
  // {
  //   path: 'mx', component: Layout,
  //   data: {
  //     layout: 'empty'
  //   },
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () => import('./modules/swift-messaging/swift-messaging.routing').then(m => m.swiftMessagingRouting)
  //     },
  //   ]
  // }

];

