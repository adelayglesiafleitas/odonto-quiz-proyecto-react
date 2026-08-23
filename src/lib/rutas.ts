import type { Pantalla } from '@/types'

// Mapa único entre las "pantallas lógicas" que ya usa toda la app (el mismo
// tipo Pantalla que reciben BottomNav y cada screen vía onNavigate) y las
// URLs reales que ahora existen gracias al router. El resto del código no
// necesita saber nada de react-router: le sigue pasando un valor de
// Pantalla a onNavigate, y acá es donde se traduce a una ruta real.
export const RUTA: Record<Pantalla, string> = {
  splash: '/',
  login: '/login',
  home: '/home',
  asignaturas: '/simulacro/asignatura',
  configurar: '/simulacro/configurar',
  examen: '/simulacro/examen',
  resultados: '/simulacro/resultados',
  estudio: '/academia/estudio',
  ayuda: '/ayuda',
  academia: '/academia',
  config: '/config',
  estadisticas: '/estadisticas',
}

// Atención al cliente: no son "pantallas lógicas" del enum Pantalla porque
// son rutas con id (un hilo de ticket concreto), así que viven fuera del
// mapa de arriba y se navegan con react-router directo (useNavigate), no
// con onNavigate. Ver claude/atencion-cliente-diseno.md.
export const RUTA_SOPORTE = '/ayuda/soporte'
export const RUTA_SOPORTE_DETALLE = '/ayuda/soporte/:id'
export function rutaSoporteDetalle(id: string): string {
  return `/ayuda/soporte/${id}`
}
