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
}
