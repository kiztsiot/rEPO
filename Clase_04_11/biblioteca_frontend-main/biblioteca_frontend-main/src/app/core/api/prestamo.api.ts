import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Prestamo, PrestamoRequest } from '../models/prestamo.model';

/** Único lugar que conoce las rutas HTTP de los préstamos (Spring Boot, /api/prestamos). */
@Injectable({ providedIn: 'root' })
export class PrestamoApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/prestamos';

  listarDeSocio(socioId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.base, { params: new HttpParams().set('socioId', socioId) });
  }

  prestar(request: PrestamoRequest): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.base, request);
  }

  devolver(id: number): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.base}/${id}/devolucion`, null);
  }
}
