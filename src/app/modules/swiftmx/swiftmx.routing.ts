import { Routes } from '@angular/router';
import { ServiceRequestProcess } from '../../shared/features/service-request/service-request-process/service-request-process';
import { PersonFormComponent } from '../../shared/features/components/person-form/person-form.component';
import { ActivityTrackerTogglePage } from '../../shared/features/activity-tracker-toggle/activity-tracker-toggle.page';
import { NotificationCenterComponent } from '../../shared/features/components/notification-center/notification-center.component';
import { FormPageComponent } from '../../shared/features/components/form-page/form-page.component';
import { ApprovalItems } from '../../shared/features/poc/approval-items/approval-items';
import { ApprovalMovement } from '../../shared/features/poc/approval-movement/approval-movement';
import { AllComponentsPage } from '../../shared/common-components/test-component-page/all-components-page/all-components-page';


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
