import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, finalize, map, switchMap, tap } from 'rxjs';

import { LibroApi } from '../../core/api/libro.api';
import { ApiError } from '../../core/models/api-error';
import { Disponibilidad, Libro, LibroRequest } from '../../core/models/libro.model';
import { ToastService } from '../../shared/ui/toast.service';

/**
 * Estado del catálogo (patrón Store/Facade con signals).
 * Las páginas leen signals y llaman a métodos; nunca hablan con la API directamente.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoStore {
  private readonly api = inject(LibroApi);
  private readonly toast = inject(ToastService);

  /** Libros que cumplen la búsqueda actual. */
  readonly libros = signal<Libro[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Criterio de búsqueda vigente (la página lo cambia con buscar()). */
  readonly texto = signal('');
  readonly soloDisponibles = signal(false);

  /** Contadores del resultado. */
  readonly resumen = computed(() => {
    const libros = this.libros();
    const conCopias = libros.filter((l) => l.disponible).length;
    return { total: libros.length, conCopias, agotados: libros.length - conCopias };
  });

  /** Cambia el criterio y vuelve a consultar. */
  buscar(texto: string, soloDisponibles: boolean): void {
    this.texto.set(texto);
    this.soloDisponibles.set(soloDisponibles);
    this.cargar();
  }

  /** Vuelve a consultar con el criterio vigente. */
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.refrescar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: (e: ApiError) => this.error.set(e.message) });
  }

  /** Cuántas copias hay y cuándo vuelve la próxima. Emite solo si salió bien. */
  consultarDisponibilidad(id: number): Observable<Disponibilidad> {
    return this.api.disponibilidad(id).pipe(catchError(this.fallar));
  }

  /** Agrega un libro y refresca la lista. Emite solo si salió bien (la pantalla cierra el formulario). */
  crear(request: LibroRequest): Observable<void> {
    return this.api.crear(request).pipe(
      switchMap(() => this.refrescar()),
      tap(() => this.toast.exito('Libro agregado al catálogo')),
      catchError(this.fallar),
    );
  }

  private refrescar(): Observable<void> {
    return this.api.buscar(this.texto(), this.soloDisponibles()).pipe(
      tap((libros) => this.libros.set(libros)),
      map(() => undefined),
    );
  }

  /** Muestra el error y corta el flujo: el Observable termina sin emitir. */
  private readonly fallar = (error: ApiError): Observable<never> => {
    this.toast.error(error.message);
    return EMPTY;
  };
}
