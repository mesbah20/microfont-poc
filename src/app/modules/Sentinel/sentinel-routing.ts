import {RouterModule, Routes} from '@angular/router';
import {UserProfile} from './feature/user-profile/user-profile';
import { AllComponentsPage } from '../../shared/common-components/test-component-page/all-components-page/all-components-page';
import {WorkflowDesigner} from './feature/workflow-designer/workflow-designer';
import {DefineRoles} from './feature/define-roles/define-roles';
import {PasswordPolicy} from './feature/password-policy/password-policy';
import {NgModule} from '@angular/core';
import {routes} from '../../app.routes';
import {AssignWorkflow} from './feature/assign-workflow/assign-workflow';
import {AssignRolesToUser} from './feature/assign-roles-to-user/assign-roles-to-user';

export const SentinelRouting: Routes = [
  { path: 'AllComponent', component: AllComponentsPage },
  { path: 'UserProfile', component: UserProfile },
  { path: 'AssignRoleToUser', component: AssignRolesToUser },
  { path: 'WorkflowDesigner', component: WorkflowDesigner },
  { path: 'DefineRoles', component: DefineRoles },
  { path: 'PasswordPolicy', component: PasswordPolicy },
  { path: 'assign-workflow', component: AssignWorkflow },
];
// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
export class SentinelRoutingModule {}
