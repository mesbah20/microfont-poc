import { Routes } from '@angular/router';
import { Usernote } from './usernote/usernote'
import { GlSubsidiary } from './gl-subsidiary/gl-subsidiary';

export const featureRoutes: Routes = [
  { path: 'usernote', component: Usernote },
  { path: 'GlSubsidiary', component: GlSubsidiary },
];