import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./users/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
