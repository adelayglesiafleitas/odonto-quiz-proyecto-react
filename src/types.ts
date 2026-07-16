export interface Opcion {
  letra: string
  texto: string
  correcta: boolean
}

export interface Pregunta {
  numero: number
  pregunta: string
  asignatura: string
  capitulo: string
  anio: number
  bibliografia: string
  opciones: Opcion[]
}

export interface IntentoExamen {
  cursoId: string
  fecha: string
  totalPreguntas: number
  correctas: number
  porcentaje: number
  aprobado: boolean
  capitulo: string | 'todos'
  anio: number | 'todos'
  tiempoLimiteMinutos: number | null
  tiempoUsadoSeg: number
  agotoTiempo: boolean
}

export type Pantalla =
  | 'splash'
  | 'login'
  | 'seleccionCurso'
  | 'home'
  | 'configurar'
  | 'examen'
  | 'resultados'
  | 'estudio'
  | 'ayuda'
