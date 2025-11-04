import {Routes} from '@angular/router';
import { AllComponentsPage } from '../../shared/components/all-components-page/all-components-page';
import {ApprovalItems} from './approval-items/approval-items';
import {ApprovalMovement} from './approval-movement/approval-movement';
import {ApprovalSteps} from './approval-steps/approval-steps';


export const PocRouting: Routes = [


  {path: 'components', component: AllComponentsPage},
  {path: 'approval-items', component: ApprovalItems},
  {path: 'approval-movement', component: ApprovalMovement},
  {path: 'approval-steps', component: ApprovalSteps},
];
