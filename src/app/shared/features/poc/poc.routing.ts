import {Routes} from '@angular/router';
import {ApprovalItems} from './approval-items/approval-items';
import {ApprovalMovement} from './approval-movement/approval-movement';
import {ViewApprovalActivitiesComponent} from './view-approval-activities/view-approval-activities.component';
import {EmployeeOnboard} from './employee-onboard/employee-onboard';
import {EmployeeList} from './employee-list/employee-list';
import { UserProfile } from '../../../modules/Sentinel/user-profile/user-profile';
import { AssignRolesToUser } from '../../../modules/Sentinel/assign-roles-to-user/assign-roles-to-user';
import { WorkflowDesigner } from '../../../modules/Sentinel/workflow-designer/workflow-designer';
import { DefineRoles } from '../../../modules/Sentinel/define-roles/define-roles';
import { PasswordPolicy } from '../../../modules/Sentinel/password-policy/password-policy';
import { AssignWorkflow } from '../../../modules/Sentinel/assign-workflow/assign-workflow';
import { AllComponentsPage } from '../../common-components/test-component-page/all-components-page/all-components-page';
import {GraphicalCalendarSetup} from '../../../modules/Sentinel/graphical-calendar-setup/graphical-calendar-setup';




export const PocRouting: Routes = [

  {path: 'employee-onboard', component: EmployeeOnboard},
  {path: 'employee-list', component: EmployeeList},
  {path: 'components', component: AllComponentsPage},
  {path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
  {path: 'approval-activities', component: ViewApprovalActivitiesComponent},
];
