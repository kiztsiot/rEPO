import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { Prestamo } from '../../core/models/prestamo.model';
import { PrestamosStore } from './prestamos.store';

function prestamo(id: number, estado: Prestamo['estado'], vencido = false): Prestamo {
  return {
    id, libroId: id, tituloLibro: `Libro ${id}`, socioId: 1, nombreSocio: 'Ana Pérez',
    fechaPrestamo: '2026-10-01', fechaVencimiento: '2026-10-15',
    fechaDevolucion: estado === 'DEVUELTO' ? '2026-10-10' : null, estado, vencido,
  };
}

describe('PrestamosStore', () => {
  let store: PrestamosStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    store = TestBed.inject(PrestamosStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const listaDelSocio = () => http.expectOne((r) => r.url === '/api/prestamos' && r.method === 'GET');

  function cargarDatos(prestamos: Prestamo[]): void {
    store.cargar(1);
    listaDelSocio().flush(prestamos);
  }

  it('carga los préstamos del socio pidiendo solo los suyos', () => {
    store.cargar(1);
    expect(store.cargando()).toBe(true);

    const req = listaDelSocio();
    expect(req.request.params.get('socioId')).toBe('1');
    req.flush([prestamo(1, 'ACTIVO')]);

    expect(store.prestamos().length).toBe(1);
    expect(store.cargando()).toBe(false);
  });

  it('separa los préstamos activos del historial y cuenta los vencidos', () => {
    cargarDatos([prestamo(1, 'ACTIVO'), prestamo(2, 'ACTIVO', true), prestamo(3, 'DEVUELTO')]);

    expect(store.activos().map((p) => p.id)).toEqual([1, 2]);
    expect(store.historial().map((p) => p.id)).toEqual([3]);
    expect(store.resumen()).toEqual({ activos: 2, vencidos: 1, devueltos: 1, limiteAlcanzado: false });
  });

  it('avisa cuando el socio llega al límite de 3 préstamos activos', () => {
    cargarDatos([prestamo(1, 'ACTIVO'), prestamo(2, 'ACTIVO'), prestamo(3, 'ACTIVO')]);

    expect(store.resumen().limiteAlcanzado).toBe(true);
  });

  it('guarda el mensaje si el servidor no responde', () => {
    store.cargar(1);
    listaDelSocio().error(new ProgressEvent('error'), { status: 0 });

    expect(store.error()).toContain('No hay conexión');
    expect(store.cargando()).toBe(false);
  });

  it('presta con POST y recarga los préstamos del socio', () => {
    cargarDatos([]);
    let terminado = false;

    store.prestar(5, 1).subscribe(() => (terminado = true));

    const post = http.expectOne('/api/prestamos');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ libroId: 5, socioId: 1 });
    post.flush(prestamo(7, 'ACTIVO'));
    listaDelSocio().flush([prestamo(7, 'ACTIVO')]);

    expect(terminado).toBe(true);
    expect(store.activos().length).toBe(1);
  });

  it('si el servidor rechaza el préstamo (409) no emite y deja la lista igual', () => {
    cargarDatos([prestamo(1, 'ACTIVO')]);
    let terminado = false;

    store.prestar(5, 1).subscribe(() => (terminado = true));

    http
      .expectOne('/api/prestamos')
      .flush({ mensaje: 'No quedan ejemplares disponibles' }, { status: 409, statusText: 'Conflict' });

    expect(terminado).toBe(false);
    expect(store.prestamos().length).toBe(1);
  });

  it('devuelve con PATCH y recarga: el préstamo pasa al historial', () => {
    cargarDatos([prestamo(1, 'ACTIVO')]);

    store.devolver(1).subscribe();

    const patch = http.expectOne('/api/prestamos/1/devolucion');
    expect(patch.request.method).toBe('PATCH');
    patch.flush(prestamo(1, 'DEVUELTO'));
    listaDelSocio().flush([prestamo(1, 'DEVUELTO')]);

    expect(store.activos().length).toBe(0);
    expect(store.historial().length).toBe(1);
  });
});
