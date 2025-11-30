import { Routes } from '@angular/router';
import { GlChartOfAccounts } from './gl-chart/gl-chart-of-accounts/gl-chart-of-accounts';
import { GlSubsidiary } from './gl-subsidiary/Subsidiary/gl-subsidiary';


export const FinBookRouting: Routes = [
    { path: 'GlChart', component: GlChartOfAccounts  },   // ParamGLChartTree
    { path: 'GlSubsidiary', component: GlSubsidiary  },
];
