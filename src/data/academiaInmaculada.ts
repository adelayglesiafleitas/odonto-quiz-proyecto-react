/**
 * Contenido de la Academia — libro "Inmaculada" (Odontología en Pacientes con
 * Necesidades Especiales, Inmaculada Tomás/USC, ed. 2022), asignatura
 * "Pacientes especiales".
 *
 * Piloto: solo el Capítulo 1 ("Discapacitado Físico") tiene contenido real.
 * El resto del índice se muestra en la pantalla del libro como "próximamente"
 * para dar sensación de escala, pero no tiene datos todavía.
 *
 * IMPORTANTE — derechos de autor (decisión tomada con el usuario):
 * - El texto de abajo (resumen, conceptos, mnemotecnias, casos, preguntas) es
 *   una reescritura propia a partir de la información del libro, no una
 *   transcripción ni un parafraseo cercano. Mantiene el contenido, cambia la
 *   redacción.
 * - Las 3 fotos (`figuras` en PARALISIS_CEREBRAL) son recortes reales del
 *   libro físico, usados SOLO para este piloto/prueba interna. Antes de que
 *   este capítulo llegue a usuarios reales hay que reemplazarlas por
 *   ilustraciones propias, licenciadas o encargadas — no se pueden publicar
 *   las fotos del libro en producción. Quedan marcadas como `temporal: true`.
 */

export interface PreguntaAcademia {
  /** Enunciado de la pregunta. */
  pregunta: string
  /** Opciones de respuesta, en el mismo orden en que se muestran. */
  opciones: string[]
  /** Índice (0-based) de la opción correcta dentro de `opciones`. */
  correcta: number
  /** Retroalimentación que se muestra apenas el usuario responde. */
  feedback: string
}

export interface FiguraAcademia {
  /** Ruta pública de la imagen (carpeta /public). */
  src: string
  /** Pie de foto. */
  caption: string
  /** true = imagen provisoria (recorte del libro), pendiente de reemplazo. */
  temporal: boolean
}

export type TemaId = 'pc' | 'epi' | 'dm'

export interface TemaAcademia {
  id: TemaId
  nombre: string
  resumen: string
  conceptos: string[]
  /** Tabla de clasificación rápida: pares [etiqueta, descripción]. */
  tabla: [string, string][]
  mnemo: string
  figuras?: FiguraAcademia[]
  caso: string
  respuesta: string
  quiz: PreguntaAcademia[]
}

export const TEMAS_CAP1: Record<TemaId, TemaAcademia> = {
  pc: {
    id: 'pc',
    nombre: 'Parálisis Cerebral',
    resumen:
      'Trastorno motor de origen prenatal, natal o postnatal. Se clasifica en espástica (la más frecuente), atetoide, atáxica o mixta. Hasta la mitad de los pacientes asocia epilepsia. En consulta pesa más el manejo de los movimientos involuntarios y la comunicación que el nivel intelectual real del paciente.',
    conceptos: ['Espástica', 'Atetoide', 'Atáxica', 'Mixta', 'Sialorrea', 'Toxina botulínica', 'Maloclusión clase II'],
    tabla: [
      ['Espástica', 'Hipertonía, contracturas (50-75% de los casos)'],
      ['Atetoide', 'Movimientos lentos o bruscos involuntarios'],
      ['Atáxica', 'Alteración del equilibrio y la marcha'],
      ['Mixta', 'Combinación de los anteriores'],
    ],
    mnemo: 'La espástica se pone rígida, la atetoide se retuerce, la atáxica se tambalea — y la mixta hace un poco de todo.',
    figuras: [
      { src: '/academia/inmaculada/cap1/fig-1-1.jpg', caption: 'Fig. 1.1 — Paciente con PC en actitud colaboradora, con uso de tecnología láser.', temporal: true },
      { src: '/academia/inmaculada/cap1/fig-1-2.jpg', caption: 'Fig. 1.2 — Toxina botulínica en la glándula submaxilar, bajo control ecográfico, para el babeo.', temporal: true },
      { src: '/academia/inmaculada/cap1/fig-1-4.jpg', caption: 'Fig. 1.4 — Transferencia del paciente al sillón dental con ayuda de dispositivos específicos.', temporal: true },
    ],
    caso: 'Paciente de 8 años con PC espástica tetrapléjica, en silla de ruedas, con babeo importante y bruxismo severo. Toca revisión antes de una obturación.',
    respuesta:
      'Priorizar la transferencia asistida a la silla de ruedas o al sillón según el caso, dique de goma para controlar secreciones, y valorar con el equipo médico si el babeo justifica toxina botulínica. El bruxismo orienta a proteger las superficies oclusales, no a forzar una prótesis compleja en esta primera fase.',
    quiz: [
      {
        pregunta: '¿Cuál es la conducta más adecuada ante los movimientos incontrolables de un paciente con PC atetoide?',
        opciones: [
          'Sujetar con fuerza sin avisar antes',
          'Aplicar restricción física con consentimiento previo, sujetando cabeza y miembros con firmeza pero suavidad',
          'Suspender siempre el tratamiento',
          'Indicar anestesia general en todos los casos',
        ],
        correcta: 1,
        feedback: 'La restricción física es válida solo con consentimiento específico previo, y debe hacerse con firmeza pero sin brusquedad — no es la primera opción por defecto.',
      },
      {
        pregunta: 'Un niño con PC tiene babeo con infecciones micóticas comisurales recurrentes. ¿Qué NO es una primera línea de manejo?',
        opciones: ['Terapia del habla', 'Programa de biofeedback', 'Cirugía sobre las glándulas salivales', 'Toxina botulínica, tras valorar riesgos'],
        correcta: 2,
        feedback: 'La cirugía sobre glándulas salivales se reserva para cuando fallan las alternativas menos invasivas, no es punto de partida.',
      },
    ],
  },
  epi: {
    id: 'epi',
    nombre: 'Epilepsia',
    resumen:
      'El objetivo antes de un tratamiento electivo es confirmar que el paciente está en "fase estable" (más de un año sin crisis) y evitar desencadenantes como estrés, fatiga o luces parpadeantes. Varios antiepilépticos dejan huella en la boca: la fenitoína agranda la encía, el valproato aumenta el riesgo de sangrado.',
    conceptos: ['Gran mal', 'Petit mal (ausencias)', 'Aura', 'Estado epiléptico', 'Hiperplasia gingival'],
    tabla: [
      ['Gran mal', 'Pérdida de conciencia, fase tónica y clónica, 3-7 min'],
      ['Petit mal', 'Ausencias breves (<30 s), casi sin movimiento'],
      ['Aura', 'Señal previa: irritabilidad, alucinaciones, cefalea'],
      ['Status', 'Crisis repetidas sin recuperación — emergencia real'],
    ],
    mnemo: 'Ante una crisis en el sillón, los 5 NO: no sujetar, no forzar la boca, no boca arriba, no nada por vía oral, no dejarlo solo.',
    caso: 'Paciente en tratamiento con fenitoína, con hiperplasia gingival marcada, programado para una exodoncia sencilla.',
    respuesta:
      'Antes de la extracción conviene revisar la coagulación si además recibe valproato o carbamazepina, confirmar que no ha tenido crisis en el último año, y coordinar el horario de la medicación del propio día de la cita.',
    quiz: [
      {
        pregunta: '¿Cuándo se considera a un paciente epiléptico en condiciones de recibir tratamiento dental electivo?',
        opciones: ['Nunca, si toma medicación', 'Cuando lleva más de un año sin crisis', 'Solo si se trata siempre en medio hospitalario', 'Cuando desaparece el aura'],
        correcta: 1,
        feedback: '"Fase estable" se define como más de un año sin crisis, no la ausencia de medicación ni el entorno de la cita.',
      },
      {
        pregunta: 'Durante una crisis tónico-clónica en el sillón, ¿qué NO se debe hacer?',
        opciones: ['Retirar objetos alrededor del paciente', 'Introducir un abrebocas para "proteger" la lengua', 'Girarlo hacia un lado', 'Aflojar ropa ceñida'],
        correcta: 1,
        feedback: 'Nunca se introducen objetos duros en la boca durante la crisis — es la causa más común de lesiones evitables en dientes y tejidos blandos.',
      },
    ],
  },
  dm: {
    id: 'dm',
    nombre: 'Distrofia Muscular',
    resumen:
      'Grupo de enfermedades con debilidad muscular progresiva; Duchenne es la forma más frecuente. La afectación cardiorrespiratoria condiciona la anestesia general, que muchas veces está contraindicada o exige cuidados especiales. El trismo dificulta tanto la higiene diaria como los tratamientos conservadores.',
    conceptos: ['Duchenne', 'Signo de Gower', 'Cardiomiopatía', 'Trismo', 'Remoción químico-mecánica'],
    tabla: [
      ['Duchenne', 'Marcha de pato, debilidad progresiva, la más frecuente'],
      ['Becker', 'Evolución más lenta que Duchenne'],
      ['Steinert', 'Forma miotónica, aparición variable'],
      ['Comorbilidad clave', 'Cardiomiopatía + afectación respiratoria'],
    ],
    mnemo: 'Antes de tratar, pregunta CARE: Corazón (cardiomiopatía), Aire (función respiratoria), Riesgo anestésico, Evolución de la enfermedad.',
    caso: 'Adolescente con Duchenne en fase avanzada, capacidad vital reducida, trismo marcado y varias caries activas.',
    respuesta:
      'Con esa capacidad vital, la anestesia general queda descartada como primera opción; conviene priorizar un abordaje conservador en sesiones cortas y, si el trismo impide el instrumental rotatorio, recurrir a remoción química-mecánica del tejido cariado.',
    quiz: [
      {
        pregunta: '¿Por qué la anestesia general es especialmente delicada en distrofia muscular avanzada?',
        opciones: ['Por riesgo de xerostomía', 'Por la afectación cardiorrespiratoria y el riesgo de hipertermia maligna', 'Porque el paciente siempre rechaza la vía oral', 'Por el bajo riesgo de caries'],
        correcta: 1,
        feedback: 'El compromiso cardíaco y respiratorio, sumado al riesgo de hipertermia maligna con ciertos anestésicos, es lo que obliga a extremar la valoración previa.',
      },
      {
        pregunta: 'Con trismo severo que impide el uso de instrumental rotatorio, ¿qué alternativa se plantea para el tejido cariado?',
        opciones: ['Aumentar solo la sedación', 'Sistema de remoción química-mecánica', 'Anestesia general de forma sistemática', 'Posponer el tratamiento indefinidamente'],
        correcta: 1,
        feedback: 'La remoción químico-mecánica permite tratar la caries sin depender de una apertura bucal amplia ni de instrumental rotatorio.',
      },
    ],
  },
}

/** Preguntas del repaso final del capítulo: mezcla una de cada tema. */
export const REPASO_CAP1_PREGUNTAS: PreguntaAcademia[] = [TEMAS_CAP1.pc.quiz[0], TEMAS_CAP1.epi.quiz[1], TEMAS_CAP1.dm.quiz[0]]

export const INTRO_CAP1 = {
  titulo: 'Introducción',
  bloques: [
    {
      titulo: 'De qué trata este capítulo',
      texto:
        'Agrupa tres condiciones donde el compromiso principal es motor: parálisis cerebral, epilepsia y distrofia muscular. En consulta comparten un mismo hilo conductor: la dificultad de acceso y traslado al sillón, el manejo de movimientos o crisis imprevisibles, y decisiones de anestesia que dependen mucho más del estado sistémico que de la "colaboración" del paciente.',
    },
    {
      titulo: 'Qué vas a poder hacer al terminar',
      texto:
        'Reconocer la clasificación de cada condición, elegir la técnica anestésica y la posición en el sillón según el caso, anticipar los hallazgos orales típicos, y reaccionar correctamente ante una crisis epiléptica en el gabinete.',
    },
  ],
}

export type TipoNodo = 'intro' | 'leccion' | 'repaso'

export interface NodoRuta {
  id: string
  tipo: TipoNodo
  titulo: string
  temaId?: TemaId
}

/** Ruta del Capítulo 1: 5 nodos en orden fijo. */
export const NODOS_CAP1: NodoRuta[] = [
  { id: 'intro', tipo: 'intro', titulo: 'Introducción' },
  { id: 'pc', tipo: 'leccion', titulo: 'Parálisis Cerebral', temaId: 'pc' },
  { id: 'epi', tipo: 'leccion', titulo: 'Epilepsia', temaId: 'epi' },
  { id: 'dm', tipo: 'leccion', titulo: 'Distrofia Muscular', temaId: 'dm' },
  { id: 'repaso', tipo: 'repaso', titulo: 'Repaso del capítulo' },
]

export interface CapituloLibro {
  numero: number
  titulo: string
  subtitulo?: string
  /** true = tiene contenido real cargado; false = todavía no (solo índice). */
  listo: boolean
}

/**
 * Índice real de los 16 capítulos del libro. Solo el Capítulo 1 tiene
 * contenido armado (piloto) — el resto se muestra como "próximamente".
 */
export const CAPITULOS_INMACULADA: CapituloLibro[] = [
  { numero: 1, titulo: 'Discapacitado Físico', subtitulo: 'Parálisis cerebral · Epilepsia · Distrofia muscular', listo: true },
  { numero: 2, titulo: 'Discapacitado Psíquico', subtitulo: 'TDI · Síndrome de Down · TEA', listo: false },
  { numero: 3, titulo: 'Discapacitado Sensorial', subtitulo: 'Visual · Auditivo', listo: false },
  { numero: 4, titulo: 'Patología Infecciosa', subtitulo: 'VIH · Hepatitis · Tuberculosis', listo: false },
  { numero: 5, titulo: 'Patología Cardiovascular', subtitulo: 'Cardiopatías · Endocarditis', listo: false },
  { numero: 6, titulo: 'Patología Respiratoria', subtitulo: 'Asma · EPOC', listo: false },
  { numero: 7, titulo: 'Patología Hepática', listo: false },
  { numero: 8, titulo: 'Patología Renal', listo: false },
  { numero: 9, titulo: 'Patología Endocrina', listo: false },
  { numero: 10, titulo: 'Alteración Hematológica', listo: false },
  { numero: 11, titulo: 'Discrasia Sanguínea', listo: false },
  { numero: 12, titulo: 'Cáncer de Cabeza y Cuello', listo: false },
  { numero: 13, titulo: 'Medicación y Osteonecrosis', listo: false },
  { numero: 14, titulo: 'Patología Neurológica', listo: false },
  { numero: 15, titulo: 'Embarazo y Lactancia', listo: false },
  { numero: 16, titulo: 'Emergencia de Origen Alérgico', listo: false },
]

export const LIBRO_INMACULADA = {
  id: 'inmaculada',
  titulo: 'Odontología en Pacientes con Necesidades Especiales',
  autora: 'Inmaculada Tomás (coord.) · Universidad de Santiago de Compostela',
  edicion: '2022',
  totalCapitulos: CAPITULOS_INMACULADA.length,
}
