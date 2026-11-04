import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, merge } from 'rxjs';

import { Disponibilidad, Libro, LibroRequest } from '../../../core/models/libro.model';
import { PrestamosStore } from '../../prestamos/prestamos.store';
import { SociosStore } from '../../socios/socios.store';
import { CatalogoStore } from '../catalogo.store';
import { LibroCard } from '../components/libro-card/libro-card';
import { LibroForm } from '../components/libro-form/libro-form';

/** Pantalla principal: buscar libros, ver su disponibilidad y prestarlos. Solo habla con los stores. */
@Component({
  selector: 'app-catalogo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LibroCard, LibroForm],
  templateUrl: './catalogo.page.html',
  styleUrl: './catalogo.page.css',
})
export class CatalogoPage implements OnInit {
  protected readonly store = inject(CatalogoStore);
  protected readonly socios = inject(SociosStore);
  private readonly prestamos = inject(PrestamosStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly soloDisponibles = new FormControl(false, { nonNullable: true });

  protected readonly formularioAbierto = signal(false);
  protected readonly guardando = signal(false);
  /** Libro que se está prestando en este momento (evita doble clic). */
  protected readonly prestandoId = signal<number | null>(null);
  /** Última disponibilidad consultada por libro. */
  protected readonly disponibilidades = signal<Partial<Record<number, Disponibilidad>>>({});

  ngOnInit(): void {
    this.store.cargar();
    // la búsqueda espera 300 ms tras dejar de escribir; el filtro de disponibles consulta de inmediato
    merge(this.busqueda.valueChanges.pipe(debounceTime(300)), this.soloDisponibles.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.store.buscar(this.busqueda.value, this.soloDisponibles.value));
  }

  protected limpiar(): void {
    this.busqueda.setValue('', { emitEvent: false });
    this.soloDisponibles.setValue(false, { emitEvent: false });
    this.store.buscar('', false);
  }

  protected consultar(libro: Libro): void {
    this.store.consultarDisponibilidad(libro.id).subscribe((d) => {
      this.disponibilidades.update((actual) => ({ ...actual, [libro.id]: d }));
    });
  }

  protected prestar(libro: Libro): void {
    const socio = this.socios.socioActual();
    if (!socio) {
      return;
    }
    this.prestandoId.set(libro.id);
    this.prestamos.prestar(libro.id, socio.id).subscribe({
      next: () => {
        this.limpiarDisponibilidad(libro.id);
        this.store.cargar();
      },
      complete: () => this.prestandoId.set(null),
    });
  }

  protected guardar(request: LibroRequest): void {
    this.guardando.set(true);
    this.store.crear(request).subscribe({
      next: () => this.formularioAbierto.set(false),
      complete: () => this.guardando.set(false),
    });
  }

  private limpiarDisponibilidad(id: number): void {
    this.disponibilidades.update(({ [id]: _descartada, ...resto }) => resto);
  }
}
