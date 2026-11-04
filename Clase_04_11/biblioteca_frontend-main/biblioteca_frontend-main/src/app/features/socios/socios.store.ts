import { Injectable, computed, inject, signal } from '@angular/core';

import { SocioApi } from '../../core/api/socio.api';
import { ApiError } from '../../core/models/api-error';
import { Socio } from '../../core/models/socio.model';
import { ToastService } from '../../shared/ui/toast.service';

/**
 * Socios y "socio activo" (Store/Facade con signals). No hay login: quien usa el sistema
 * elige en la cabecera con qué socio actúa, y el catálogo y los préstamos leen esa elección.
 */
@Injectable({ providedIn: 'root' })
export class SociosStore {
  private readonly api = inject(SocioApi);
  private readonly toast = inject(ToastService);

  readonly socios = signal<Socio[]>([]);
  readonly socioActualId = signal<number | null>(null);

  readonly socioActual = computed(() => this.socios().find((s) => s.id === this.socioActualId()) ?? null);

  cargar(): void {
    this.api.listar().subscribe({
      next: (socios) => {
        this.socios.set(socios);
        if (this.socioActual() === null) {
          this.socioActualId.set(socios[0]?.id ?? null);
        }
      },
      error: (e: ApiError) => this.toast.error(e.message),
    });
  }

  seleccionar(id: number | null): void {
    this.socioActualId.set(id);
  }
}
