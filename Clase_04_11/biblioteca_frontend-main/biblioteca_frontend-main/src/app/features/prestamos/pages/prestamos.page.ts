import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LIMITE_PRESTAMOS_ACTIVOS, Prestamo } from '../../../core/models/prestamo.model';
import { SociosStore } from '../../socios/socios.store';
import { PrestamoCard } from '../components/prestamo-card/prestamo-card';
import { PrestamosStore } from '../prestamos.store';

/** Préstamos del socio elegido en la cabecera: lo que tiene en su poder y su historial. Solo habla con los stores. */
@Component({
  selector: 'app-prestamos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrestamoCard, RouterLink],
  templateUrl: './prestamos.page.html',
  styleUrl: './prestamos.page.css',
})
export class PrestamosPage {
  protected readonly store = inject(PrestamosStore);
  protected readonly socios = inject(SociosStore);

  protected readonly limite = LIMITE_PRESTAMOS_ACTIVOS;
  /** Préstamo que se está devolviendo en este momento (evita doble clic). */
  protected readonly devolviendoId = signal<number | null>(null);

  constructor() {
    // cada vez que cambia el socio de la cabecera se vuelven a pedir sus préstamos
    effect(() => {
      const socio = this.socios.socioActual();
      if (socio) {
        this.store.cargar(socio.id);
      }
    });
  }

  protected devolver(prestamo: Prestamo): void {
    this.devolviendoId.set(prestamo.id);
    this.store.devolver(prestamo.id).subscribe({ complete: () => this.devolviendoId.set(null) });
  }
}
