import {Routes} from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import { PersonFormComponent } from './components/person-form/person-form.component';
import { ActivityTrackerTogglePage } from './activity-tracker-toggle/activity-tracker-toggle.page';
import { FormPageComponent } from './components/form-page/form-page.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { AccountComponent } from './components/account/account';


export const SwiftmxRouting: Routes = [

  {path: 'components', component: AllComponentsPage},
  {path: 'person-form', component: PersonFormComponent},
  {path: 'activity-tracker-toggle', component: ActivityTrackerTogglePage},
  { path: 'notifications', component: NotificationCenterComponent },
  { path: 'form', component: FormPageComponent },
  
]