/** Persona inscrita en la biblioteca (GET /api/socios). */
export interface Socio {
  id: number;
  nombre: string;
  email: string;
  creadoEn: string;
}
