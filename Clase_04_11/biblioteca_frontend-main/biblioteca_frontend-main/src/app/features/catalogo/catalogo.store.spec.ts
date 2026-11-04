import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from '../../core/interceptors/error.interceptor';
import { Libro } from '../../core/models/libro.model';
import { CatalogoStore } from './catalogo.store';

const ahora = '2026-10-15T10:00:00';
function libro(id: number, disponibles: number): Libro {
  return {
    id, titulo: `Libro ${id}`, autor: 'Autor', isbn: '978-0132350884', categoria: 'Novela',
    anioPublicacion: 2000, ejemplaresTotales: 3, ejemplaresDisponibles: disponibles,
    disponible: disponibles > 0, creadoEn: ahora,
  };
}

describe('CatalogoStore', () => {
  let store: CatalogoStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()],
    });
    store = TestBed.inject(CatalogoStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const peticionLibros = () => http.expectOne((r) => r.url === '/api/libros' && r.method === 'GET');

  it('carga el catálogo completo', () => {
    store.cargar();
    expect(store.cargando()).toBe(true);

    const req = peticionLibros();
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.get('soloDisponibles')).toBe('false');
    req.flush([libro(1, 2)]);

    expect(store.libros().length).toBe(1);
    expect(store.cargando()).toBe(false);
  });

  it('busca por texto y manda los filtros al servidor', () => {
    store.buscar('  clean ', true);

    const req = peticionLibros();
    expect(req.request.params.get('q')).toBe('clean');
    expect(req.request.params.get('soloDisponibles')).toBe('true');
    req.flush([libro(2, 1)]);

    expect(store.libros()[0].id).toBe(2);
    expect(store.texto()).toBe('  clean ');
  });

  it('calcula cuántos libros tienen copias y cuántos están agotados', () => {
    store.cargar();
    peticionLibros().flush([libro(1, 2), libro(2, 0), libro(3, 0)]);

    expect(store.resumen()).toEqual({ total: 3, conCopias: 1, agotados: 2 });
  });

  it('guarda el mensaje si el servidor no responde', () => {
    store.cargar();
    peticionLibros().error(new ProgressEvent('error'), { status: 0 });

    expect(store.error()).toContain('No hay conexión');
    expect(store.cargando()).toBe(false);
  });

  it('consulta la disponibilidad de un libro', () => {
    let recibida: number | null = null;

    store.consultarDisponibilidad(3).subscribe((d) => (recibida = d.ejemplaresDisponibles));

    http.expectOne('/api/libros/3/disponibilidad').flush({
      libroId: 3, titulo: 'Libro 3', ejemplaresTotales: 1, ejemplaresDisponibles: 0,
      disponible: false, proximaDevolucion: '2026-11-05',
    });

    expect(recibida).toBe(0);
  });

  it('crea con POST y recarga la lista', () => {
    let terminado = false;

    store
      .crear({ titulo: 'Nuevo', autor: 'A', isbn: '978-0132350884', categoria: 'Novela', anioPublicacion: 2020, ejemplares: 2 })
      .subscribe(() => (terminado = true));

    const post = http.expectOne('/api/libros');
    expect(post.request.method).toBe('POST');
    post.flush(libro(9, 2));
    peticionLibros().flush([libro(9, 2)]);

    expect(terminado).toBe(true);
    expect(store.libros().length).toBe(1);
  });

  it('si el servidor rechaza el ISBN repetido (409) no emite', () => {
    let terminado = false;

    store
      .crear({ titulo: 'Nuevo', autor: 'A', isbn: '978-0132350884', categoria: 'Novela', anioPublicacion: 2020, ejemplares: 2 })
      .subscribe(() => (terminado = true));

    http
      .expectOne('/api/libros')
      .flush({ mensaje: 'Ya existe un registro con ISBN 978-0132350884' }, { status: 409, statusText: 'Conflict' });

    expect(terminado).toBe(false);
  });
});
