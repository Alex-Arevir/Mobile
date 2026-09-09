import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/tabs/tab1',
  },
];
