import {Routes} from '@angular/router';
import {Dashboard} from './feature/dashboard/dashboard';
import { AlertExamplePage } from './alert-example-page/alert-example-page';
import {Login} from '../../core/auth/login/login';
import {ApprovalItems} from '../poc/approval-items/approval-items';
import {Landing} from './landing/landing';
import {Home} from './home/home';

export const landingRouting: Routes = [
  {path: 'dashboard', component: Dashboard},
  {path: 'home', component: Home},
  {path: 'config/approval-items', component: ApprovalItems},
  {path: 'alert-example-page', component: AlertExamplePage}
];

