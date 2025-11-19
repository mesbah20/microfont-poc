import {Routes} from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import {ApprovalItems} from './approval-items/approval-items';
import {ApprovalMovement} from './approval-movement/approval-movement';
import {ViewApprovalActivitiesComponent} from './view-approval-activities/view-approval-activities.component';
import {EmployeeOnboard} from './employee-onboard/employee-onboard';
import {EmployeeList} from './employee-list/employee-list';
import { GlSubsidiary } from '../../features/gl-subsidiary/gl-subsidiary';


export const PocRouting: Routes = [


  {path: 'employee-onboard', component: EmployeeOnboard},
  {path: 'employee-list', component: EmployeeList},
  {path: 'components', component: AllComponentsPage},
  {path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
  {path: 'approval-activities', component: ViewApprovalActivitiesComponent},
  {path: 'GlSubsidiary', component: GlSubsidiary },
];
