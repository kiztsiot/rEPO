import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Disponibilidad, Libro } from '../../../../core/models/libro.model';
import { formatearFecha } from '../../../../shared/util/fechas';

/** Tarjeta de un libro. Componente presentacional: recibe datos y avisa con eventos. */
@Component({
  selector: 'app-libro-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './libro-card.html',
  styleUrl: './libro-card.css',
})
export class LibroCard {
  readonly libro = input.required<Libro>();
  /** Resultado de "Ver disponibilidad" (null mientras no se consulta). */
  readonly disponibilidad = input<Disponibilidad | null>(null);
  /** Si hay un socio elegido que puede pedir prestado (el backend valida las reglas igual). */
  readonly puedePrestar = input(false);
  readonly ocupado = input(false);

  readonly prestar = output<Libro>();
  readonly consultar = output<Libro>();

  protected readonly proxima = computed(() => {
    const iso = this.disponibilidad()?.proximaDevolucion;
    return iso ? formatearFecha(iso) : null;
  });
}
