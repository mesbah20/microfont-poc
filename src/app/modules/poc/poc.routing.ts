import {Routes} from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import {ApprovalItems} from './approval-items/approval-items';
import {ApprovalMovement} from './approval-movement/approval-movement';
import {ViewApprovalActivitiesComponent} from './view-approval-activities/view-approval-activities.component';
import {EmployeeOnboard} from './employee-onboard/employee-onboard';
import {EmployeeList} from './employee-list/employee-list';
import {UserProfile} from '../Components/user-profile/user-profile';
import {AssignRolesToUser} from '../Components/assign-roles-to-user/assign-roles-to-user';
import {WorkflowDesigner} from '../Components/workflow-designer/workflow-designer';
import {DefineRoles} from '../Components/define-roles/define-roles';
import {PasswordPolicy} from '../Components/password-policy/password-policy';
import {AssignWorkflow} from '../Components/assign-workflow/assign-workflow';


export const PocRouting: Routes = [

  {path: 'employee-onboard', component: EmployeeOnboard},
  {path: 'employee-list', component: EmployeeList},
  {path: 'components', component: AllComponentsPage},
  {path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
  {path: 'approval-activities', component: ViewApprovalActivitiesComponent},
  { path: 'AllComponent', component: AllComponentsPage },
  { path: 'UserProfile', component: UserProfile },
  { path: 'AssignRoleToUser', component: AssignRolesToUser },
  { path: 'WorkflowDesigner', component: WorkflowDesigner },
  { path: 'DefineRoles', component: DefineRoles },
  { path: 'PasswordPolicy', component: PasswordPolicy },
  { path: 'assign-workflow', component: AssignWorkflow },
];
