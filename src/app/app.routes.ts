import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/outage-tracker/components/outage-grid/outage-grid.component').then(
        m => m.OutageGridComponent
      )
  },
  {
    path: 'releases',
    loadComponent: () =>
      import('./features/release-tracker/components/release-grid/release-grid.component').then(
        m => m.ReleaseGridComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
