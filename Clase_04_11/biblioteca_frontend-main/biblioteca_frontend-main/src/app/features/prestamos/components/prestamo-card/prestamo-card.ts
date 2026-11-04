import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Prestamo } from '../../../../core/models/prestamo.model';
import { formatearFecha } from '../../../../shared/util/fechas';

/** Fila/tarjeta de un préstamo. Componente presentacional: recibe datos y avisa con eventos. */
@Component({
  selector: 'app-prestamo-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prestamo-card.html',
  styleUrl: './prestamo-card.css',
})
export class PrestamoCard {
  readonly prestamo = input.required<Prestamo>();
  readonly ocupado = input(false);

  readonly devolver = output<Prestamo>();

  protected readonly desde = computed(() => formatearFecha(this.prestamo().fechaPrestamo));
  protected readonly hasta = computed(() => formatearFecha(this.prestamo().fechaVencimiento));
  protected readonly devuelto = computed(() => {
    const iso = this.prestamo().fechaDevolucion;
    return iso ? formatearFecha(iso) : null;
  });
}
