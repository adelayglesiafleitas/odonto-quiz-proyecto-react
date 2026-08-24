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
  // Enunciado del caso clínico que agrupa a esta pregunta con otras del
  // mismo caso (ej. capítulo "Examen Práctico"). Opcional: la gran mayoría
  // del banco no tiene caso y no se toca. Se guarda repetido en cada
  // pregunta del caso (no una sola vez) porque el examen baraja el banco
  // pregunta por pregunta — cada una tiene que ser autocontenida.
  caso?: string
}

// Aciertos/total de un capítulo dentro de un único intento. Se guarda un
// mapa capítulo -> conteo (no una fila por pregunta) para que la tabla de
// historial siga creciendo una fila por intento, no una fila por pregunta:
// con miles de usuarios, esa segunda forma multiplicaría el tamaño de la
// tabla por 20-40x sin necesidad, ya que para las estadísticas alcanza con
// el conteo agregado por capítulo.
export interface ConteoCapitulo {
  correctas: number
  total: number
}

export interface IntentoExamen {
  cursoId: string
  fecha: string
  totalPreguntas: number
  correctas: number
  porcentaje: number
  aprobado: boolean
  // Array vacío = "todos los capítulos" (mismo significado que antes tenía
  // el string 'todos'); con elementos = esos capítulos combinados.
  capitulos: string[]
  anio: number | 'todos'
  tiempoLimiteMinutos: number | null
  tiempoUsadoSeg: number
  agotoTiempo: boolean
  desgloseCapitulos: Record<string, ConteoCapitulo>
}

export type Pantalla =
  | 'splash'
  | 'login'
  | 'home'
  | 'asignaturas'
  | 'configurar'
  | 'examen'
  | 'resultados'
  | 'estudio'
  | 'ayuda'
  | 'academia'
  | 'config'
  | 'estadisticas'
