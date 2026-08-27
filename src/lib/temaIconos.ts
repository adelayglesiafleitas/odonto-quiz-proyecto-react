import { Sparkles, Rocket, Zap, Flame, Heart, type LucideIcon } from 'lucide-react'
import type { Estilo } from '@/lib/settings'

/**
 * Ícono de la placa de la card de bienvenida y de la card "Empezá ya" en
 * Home: por defecto son Sparkles/Rocket (Clásico, Acqua y Galaxia — en
 * Galaxia ya encajan con lo cósmico, así que no hace falta cambiarlos), pero
 * algunos estilos los reinterpretan para reforzar su temática.
 */
export const ICONO_BIENVENIDA: Record<Estilo, LucideIcon> = {
  clasico: Sparkles,
  acqua: Sparkles,
  electrico: Zap,
  rockpop: Flame,
  fresita: Heart,
  galaxia: Sparkles,
}

export const ICONO_CTA: Record<Estilo, LucideIcon> = {
  clasico: Rocket,
  acqua: Rocket,
  electrico: Zap,
  rockpop: Flame,
  fresita: Heart,
  galaxia: Rocket,
}
