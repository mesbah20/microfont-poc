import { Routes } from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import { ServiceRequestProcess } from '../../features/service-request/service-request-process/service-request-process';
import { ApprovalItems } from '../../features/poc/approval-items/approval-items';
import { ApprovalMovement } from '../../features/poc/approval-movement/approval-movement';
import { ActivityTrackerTogglePage } from '../../features/activity-tracker-toggle/activity-tracker-toggle.page';
import { PersonFormComponent } from '../../features/components/person-form/person-form.component';
import { NotificationCenterComponent } from '../../features/components/notification-center/notification-center.component';
import { FormPageComponent } from '../../features/components/form-page/form-page.component';


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
