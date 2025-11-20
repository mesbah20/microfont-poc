import { Routes } from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import { PersonFormComponent } from './components/person-form/person-form.component';
import { ActivityTrackerTogglePage } from './activity-tracker-toggle/activity-tracker-toggle.page';
import { FormPageComponent } from './components/form-page/form-page.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { ServiceRequestProcess } from './components/service-request-process/service-request-process';
import {ApprovalItems} from '../poc/approval-items/approval-items';
import {ApprovalMovement} from '../poc/approval-movement/approval-movement';

export const SwiftmxRouting: Routes = [
  { path: 'components', component: AllComponentsPage },
  { path: 'service-request', component: ServiceRequestProcess },
  { path: 'person-form', component: PersonFormComponent },
  { path: 'activity-tracker-toggle', component: ActivityTrackerTogglePage },
  { path: 'notifications', component: NotificationCenterComponent },
  { path: 'form', component: FormPageComponent },
  { path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
];
