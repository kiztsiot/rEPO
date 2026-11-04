import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Socio } from '../models/socio.model';

@Injectable({ providedIn: 'root' })
export class SocioApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<Socio[]> {
    return this.http.get<Socio[]>('/api/socios');
  }
}
