import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Disponibilidad, Libro, LibroRequest } from '../models/libro.model';

/** Único lugar que conoce las rutas HTTP del catálogo (Spring Boot, /api/libros). */
@Injectable({ providedIn: 'root' })
export class LibroApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/libros';

  buscar(texto: string, soloDisponibles: boolean): Observable<Libro[]> {
    let params = new HttpParams().set('soloDisponibles', soloDisponibles);
    if (texto.trim()) {
      params = params.set('q', texto.trim());
    }
    return this.http.get<Libro[]>(this.base, { params });
  }

  disponibilidad(id: number): Observable<Disponibilidad> {
    return this.http.get<Disponibilidad>(`${this.base}/${id}/disponibilidad`);
  }

  crear(request: LibroRequest): Observable<Libro> {
    return this.http.post<Libro>(this.base, request);
  }
}
