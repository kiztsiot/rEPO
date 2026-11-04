/** Libro tal como lo entrega la API (GET /api/libros). Las fechas llegan como texto ISO. */
export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  anioPublicacion: number;
  ejemplaresTotales: number;
  ejemplaresDisponibles: number;
  disponible: boolean;
  creadoEn: string;
}

/** Datos para agregar un libro (POST). Todas sus copias nacen disponibles. */
export interface LibroRequest {
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  anioPublicacion: number;
  ejemplares: number;
}

/** Respuesta de GET /api/libros/{id}/disponibilidad. */
export interface Disponibilidad {
  libroId: number;
  titulo: string;
  ejemplaresTotales: number;
  ejemplaresDisponibles: number;
  disponible: boolean;
  proximaDevolucion: string | null;
}

/** Reglas que el formulario repite para avisar antes de enviar (el backend las valida igual). */
export const REGLAS_LIBRO = {
  tituloMaxLargo: 150,
  autorMaxLargo: 100,
  categoriaMaxLargo: 50,
  isbnPatron: /^[0-9Xx-]{10,17}$/,
  anioMin: 1000,
  anioMax: 2100,
  ejemplaresMin: 1,
  ejemplaresMax: 100,
} as const;
