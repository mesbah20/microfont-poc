import {Routes} from '@angular/router';
import {Layout} from './layout/layout';
import {Login} from './core/auth/login/login';

export const routes: Routes = [

  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: Login},
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

