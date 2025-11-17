import {RouterModule, Routes} from '@angular/router';
import {UserProfile} from './user-profile/user-profile';
import {AllComponentsPage} from '../../shared/components/all-components-page/all-components-page';
import {AssignRolesToUser} from './assign-roles-to-user/assign-roles-to-user';
import {WorkflowDesigner} from './workflow-designer/workflow-designer';
import {DefineRoles} from './define-roles/define-roles';
import {PasswordPolicy} from './password-policy/password-policy';
import {NgModule} from '@angular/core';
import {routes} from '../../app.routes';

export const SentinelRouting: Routes = [
  { path: 'AllComponent', component: AllComponentsPage },
  { path: 'UserProfile', component: UserProfile },
  { path: 'AssignRoleToUser', component: AssignRolesToUser },
  { path: 'WorkflowDesigner', component: WorkflowDesigner },
  { path: 'DefineRoles', component: DefineRoles },
  { path: 'PasswordPolicy', component: PasswordPolicy },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SentinelRoutingModule {}
