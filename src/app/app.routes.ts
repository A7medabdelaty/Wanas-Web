import { Routes } from '@angular/router';

export const routes: Routes = [
  
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

 
  {
    path: 'auth/login',
    loadComponent: () => 
    import('./features/auth/Pages/login/login').then(m => m.LoginComponent)
  },

  { path: '**', redirectTo: 'auth/login' }
];