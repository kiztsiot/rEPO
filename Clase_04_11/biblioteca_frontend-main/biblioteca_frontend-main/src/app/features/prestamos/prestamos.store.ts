import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, map, switchMap, tap } from 'rxjs';

import { PrestamoApi } from '../../core/api/prestamo.api';
import { ApiError } from '../../core/models/api-error';
import { LIMITE_PRESTAMOS_ACTIVOS, Prestamo } from '../../core/models/prestamo.model';
import { ToastService } from '../../shared/ui/toast.service';

/**
 * Préstamos del socio activo (patrón Store/Facade con signals).
 * Los métodos de escritura devuelven Observable<void> y refrescan la lista.
 */
@Injectable({ providedIn: 'root' })
export class PrestamosStore {
  private readonly api = inject(PrestamoApi);
  private readonly toast = inject(ToastService);

  /** Todos los préstamos (activos e historial) del socio cuya lista se cargó. */
  readonly prestamos = signal<Prestamo[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private socioId: number | null = null;

  readonly activos = computed(() => this.prestamos().filter((p) => p.estado === 'ACTIVO'));
  readonly historial = computed(() => this.prestamos().filter((p) => p.estado === 'DEVUELTO'));

  /** Contadores y si el socio llegó al límite de préstamos activos. */
  readonly resumen = computed(() => {
    const activos = this.activos();
    return {
      activos: activos.length,
      vencidos: activos.filter((p) => p.vencido).length,
      devueltos: this.historial().length,
      limiteAlcanzado: activos.length >= LIMITE_PRESTAMOS_ACTIVOS,
    };
  });

  /** Carga los préstamos de un socio. */
  cargar(socioId: number): void {
    this.socioId = socioId;
    this.cargando.set(true);
    this.error.set(null);
    this.refrescar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: (e: ApiError) => this.error.set(e.message) });
  }

  /** Presta un libro. Las reglas (copias, límite de 3, duplicado) las valida el backend. */
  prestar(libroId: number, socioId: number): Observable<void> {
    return this.api.prestar({ libroId, socioId }).pipe(
      tap(() => (this.socioId = socioId)),
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Préstamo realizado')),
      catchError(this.fallar),
    );
  }

  devolver(id: number): Observable<void> {
    return this.api.devolver(id).pipe(
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Devolución registrada')),
      catchError(this.fallar),
    );
  }

  /** Vuelve a pedir la lista del socio al servidor. */
  private refrescar(): Observable<void> {
    if (this.socioId === null) {
      return EMPTY;
    }
    return this.api.listarDeSocio(this.socioId).pipe(
      tap((prestamos) => this.prestamos.set(prestamos)),
      map(() => undefined),
    );
  }

  /** Muestra el error y corta el flujo: el Observable termina sin emitir. */
  private readonly fallar = (error: ApiError): Observable<never> => {
    this.toast.error(error.message);
    return EMPTY;
  };
}
