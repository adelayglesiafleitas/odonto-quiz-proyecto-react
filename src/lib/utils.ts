import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Semáforo de desempeño usado en toda la app (anillos y barras de progreso
 * de Estadísticas y Home): rojo cuando el porcentaje es bajo, azul cuando es
 * medio, verde cuando es alto. Un solo lugar para los cortes (0-40 / 40-70 /
 * 70-100) así todas las pantallas quedan consistentes si se ajustan.
 */
export type NivelDesempeno = "bajo" | "medio" | "alto"

export function nivelDesempeno(porcentaje: number): NivelDesempeno {
  if (porcentaje >= 70) return "alto"
  if (porcentaje >= 40) return "medio"
  return "bajo"
}

const STROKE_POR_NIVEL: Record<NivelDesempeno, string> = {
  alto: "hsl(var(--success))",
  medio: "hsl(var(--info))",
  bajo: "hsl(var(--destructive))",
}

const BG_CLASE_POR_NIVEL: Record<NivelDesempeno, string> = {
  alto: "bg-success",
  medio: "bg-info",
  bajo: "bg-destructive",
}

const TEXT_CLASE_POR_NIVEL: Record<NivelDesempeno, string> = {
  alto: "text-success",
  medio: "text-info",
  bajo: "text-destructive",
}

/** Color de trazo (para stroke de SVG) según el porcentaje. */
export function colorStrokePorcentaje(porcentaje: number): string {
  return STROKE_POR_NIVEL[nivelDesempeno(porcentaje)]
}

/** Clase de fondo de Tailwind según el porcentaje. */
export function colorBgPorcentaje(porcentaje: number): string {
  return BG_CLASE_POR_NIVEL[nivelDesempeno(porcentaje)]
}

/** Clase de texto de Tailwind según el porcentaje. */
export function colorTextPorcentaje(porcentaje: number): string {
  return TEXT_CLASE_POR_NIVEL[nivelDesempeno(porcentaje)]
}
