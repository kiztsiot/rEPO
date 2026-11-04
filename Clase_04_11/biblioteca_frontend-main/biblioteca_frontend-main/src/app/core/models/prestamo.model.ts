export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO';

/** Préstamo tal como lo entrega la API. "vencido" lo calcula el backend (ACTIVO con fecha ya pasada). */
export interface Prestamo {
  id: number;
  libroId: number;
  tituloLibro: string;
  socioId: number;
  nombreSocio: string;
  fechaPrestamo: string;
  fechaVencimiento: string;
  fechaDevolucion: string | null;
  estado: EstadoPrestamo;
  vencido: boolean;
}

/** Datos para prestar (POST): las fechas las calcula el servidor. */
export interface PrestamoRequest {
  libroId: number;
  socioId: number;
}

/** Máximo de préstamos activos por socio (el backend lo exige igual). */
export const LIMITE_PRESTAMOS_ACTIVOS = 3;

/** Días que dura un préstamo. */
export const DIAS_PRESTAMO = 14;
