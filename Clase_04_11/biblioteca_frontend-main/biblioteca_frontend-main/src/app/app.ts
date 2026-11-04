import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SociosStore } from './features/socios/socios.store';
import { Toast } from './shared/ui/toast';

/** Layout principal: cabecera (navegación + socio activo) + zona donde el router dibuja cada pantalla. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly socios = inject(SociosStore);

  ngOnInit(): void {
    this.socios.cargar();
  }

  protected cambiarSocio(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.socios.seleccionar(valor ? Number(valor) : null);
  }
}
