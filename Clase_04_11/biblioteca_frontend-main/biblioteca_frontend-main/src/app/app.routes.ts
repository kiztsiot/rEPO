import { Routes } from '@angular/router';

/** Cada pantalla se carga "perezosamente" (lazy loading): solo se descarga cuando se visita. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalogo' },
  {
    path: 'catalogo',
    title: 'Catálogo · Biblioteca IPSS',
    loadComponent: () => import('./features/catalogo/pages/catalogo.page').then((m) => m.CatalogoPage),
  },
  {
    path: 'prestamos',
    title: 'Mis préstamos · Biblioteca IPSS',
    loadComponent: () => import('./features/prestamos/pages/prestamos.page').then((m) => m.PrestamosPage),
  },
  { path: '**', redirectTo: 'catalogo' },
];
