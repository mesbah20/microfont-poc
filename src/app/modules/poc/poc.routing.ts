import {Routes} from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import {ApprovalItems} from './approval-items/approval-items';
import {ApprovalMovement} from './approval-movement/approval-movement';
import {ViewApprovalActivitiesComponent} from './view-approval-activities/view-approval-activities.component';


export const PocRouting: Routes = [


  {path: 'components', component: AllComponentsPage},
  {path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
  {path: 'approval-activities', component: ViewApprovalActivitiesComponent},
];
