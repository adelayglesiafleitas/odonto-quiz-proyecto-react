/**
 * Contenido de la Academia — libro "Inmaculada" (Odontología en Pacientes con
 * Necesidades Especiales, Inmaculada Tomás/USC, ed. 2022), asignatura
 * "Pacientes especiales".
 *
 * Piloto: solo el Capítulo 1 ("Discapacitado Físico") tiene contenido real.
 * El resto del índice se muestra en la pantalla del libro como "próximamente"
 * para dar sensación de escala, pero no tiene datos todavía.
 *
 * REDISEÑO 2026-09-14 — video + prueba (reemplaza el formato anterior de
 * "lección + autoevaluación de 2 preguntas" por tema): cada tema del
 * capítulo ahora es un video real (`VIDEOS_CAP1`) seguido de una prueba de 5
 * preguntas (`PRUEBAS_CAP1`) que hay que aprobar 5/5 para desbloquear el
 * siguiente paso — ver claude/academia-rediseno-capitulo1-videos.md en el
 * proyecto de Claude para el diseño completo.
 *
 * REDISEÑO 2026-09-17 — prueba1/prueba2 pasan de nodos propios de la ruta a
 * una ventana modal que se abre sola al terminar video1/video2 (evento
 * `ended`): la ruta baja de 7 a 5 nodos (intro, video1, video2, video3,
 * pruebaFinal). `PRUEBAS_CAP1.prueba1`/`.prueba2` NO cambiaron (mismos pools
 * de 5 preguntas) — lo que cambia es cómo se consumen, ver `VideoAcademia.
 * pruebaId` acá abajo y `ModalPruebaVideo` en Academia.tsx. video3 sigue
 * igual que antes (botón "Continuar a Prueba final", sin modal) porque no
 * tiene prueba intermedia asociada.
 *
 * - Los 3 videos son reales (subidos por el usuario), servidos como
 *   archivos estáticos desde `public/academia/pacientes-especiales/cap-1/`.
 * - Las 15 preguntas de `PRUEBAS_CAP1` vienen tal cual del documento
 *   "Examen de Odontología Especial" que pasó el usuario (3 opciones por
 *   pregunta, con justificación clínica) — no son una reescritura, es el
 *   examen real que armó para este capítulo.
 * - `TEMAS_CAP1` (resumen/conceptos/tabla/mnemo/caso/figuras) es el
 *   contenido del formato ANTERIOR. Se conserva solo el campo `resumen` de
 *   cada tema, reutilizado como texto de acompañamiento debajo de cada
 *   video — el resto (figuras del libro, casos, mnemotecnias, quiz viejo de
 *   2 preguntas) queda sin usar en la ruta nueva, pero no se borra por si
 *   sirve más adelante para una sección de repaso aparte.
 *
 * IMPORTANTE — derechos de autor: las 3 fotos de `figuras` (en
 * TEMAS_CAP1.pc) son recortes reales del libro físico, usados solo en el
 * piloto anterior y HOY NO SE MUESTRAN en ningún lado de la ruta nueva. Si
 * se reutilizan en el futuro, siguen sin poder publicarse en producción tal
 * cual — hay que reemplazarlas por ilustraciones propias o licenciadas.
 *
 * CORRECCIÓN 2026-09-18 — los 3 videos son en realidad las 3 partes de UN
 * solo tema (Parálisis Cerebral), no un video por tema como decía el
 * comentario de más arriba: `VIDEOS_CAP1`/`NODOS_CAP1` etiquetaban video2 y
 * video3 con `temaId: 'epi'`/`'dm'` por error, cuando el usuario confirmó
 * que Epilepsia y Distrofia Muscular todavía NO tienen video propio grabado
 * — quedan como temas "próximamente" del Capítulo 1 hasta que se filmen.
 * Se corrige `temaId`/`titulo` de v2/v3 a Parálisis Cerebral (parte 2/3) —
 * así el título de pantalla y el texto de acompañamiento (`TEMAS_CAP1.pc.
 * resumen`) que se ven mientras se mira el video coinciden con lo que
 * realmente se está mostrando. OJO: las preguntas de `PRUEBAS_CAP1.prueba2`
 * y `.pruebaFinal` siguen siendo las reales del documento fuente y ya
 * cubrían temáticamente Epilepsia/Distrofia Muscular (ver nota de la
 * pregunta 10 más abajo) — por ahora se dejan tal cual como cierre general
 * del capítulo aunque el video que las precede sea de Parálisis Cerebral;
 * se pueden re-vincular a sus propios videos el día que existan.
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
  /** Quiz corto del formato anterior — sin uso en la ruta actual (ver PRUEBAS_CAP1). */
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
    {
      titulo: 'Cómo está armado',
      texto:
        'El capítulo empieza con el vídeo de Parálisis Cerebral. El vídeo se para dos veces con una pregunta: hay que acertarla para seguir y, si fallas, se repite. Al terminar el vídeo viene una prueba final que cierra el capítulo. Epilepsia y Distrofias Musculares se sumarán más adelante.',
    },
  ],
}

/**
 * REDISEÑO 2026-09-23 — UN SOLO VIDEO con pausas. Los 3 videos anteriores
 * (video1/2/3.mp4) se reemplazan por un único video del Tema 1
 * (`cap01-tema01.mp4`, 12:06, 1080p) que se va PARANDO solo en los puntos
 * de `pausas`: al llegar a cada uno se pausa, sale de pantalla completa y
 * abre la misma ventana modal de siempre (`ModalPruebaVideo`) con 1 pregunta
 * de esa prueba intermedia. Al acertar, el video sigue desde ahí. No se
 * puede adelantar más allá de la próxima pausa sin responder. Al terminar
 * el video → botón "Continuar a Prueba final" (igual que antes con video3).
 *
 * Tramos del video (medidos sobre la etiqueta de sección que se ve abajo a
 * la izquierda): Introducción 0:00 · Parálisis cerebral 1:30 · Epilepsia
 * 4:18 · Distrofias musculares 7:51 · Síntesis 10:01.
 */
export type VideoId = 'v1'

export interface PausaVideo {
  /** Segundo del video en el que se para (justo antes de que cambie de tramo). */
  seg: number
  pruebaId: PruebaId
  /**
   * Índices de `PRUEBAS_CAP1[pruebaId]` para esta pausa. La pregunta es FIJA
   * (2026-09-23): sale siempre el PRIMER índice de la lista y, si se falla, se
   * repite esa misma hasta acertarla. Para cambiar la pregunta de una pausa,
   * poner su índice primero. Sin este campo, sale la pregunta 0 del pool.
   * Estas preguntas no dan puntos; cada fallo se guarda en el progreso.
   */
  preguntas?: number[]
}

export interface SeccionVideo {
  /** Segundo en que empieza el tramo. */
  desde: number
  titulo: string
  /** Tema cuyo resumen se muestra debajo del video durante este tramo. */
  temaId: TemaId
}

export interface VideoAcademia {
  id: VideoId
  temaId: TemaId
  titulo: string
  /** Ruta pública del archivo (carpeta /public). */
  src: string
  duracionSeg: number
  /** Puntos donde el video se para para la prueba intermedia, en orden. */
  pausas: PausaVideo[]
  /** Tramos del video, en orden — cambian el título y el resumen de la pantalla. */
  secciones: SeccionVideo[]
}

export const VIDEOS_CAP1: VideoAcademia[] = [
  // 2026-09-28 — VÍDEO NUEVO del Tema 1 ("Odontología y Parálisis Cerebral",
  // 5:27, 720p, 11 diapositivas en 6 segmentos). Sustituye al de 12:06 (el
  // anterior y su cuestionario dejan de usarse). Dos pausas en los segundos
  // que pidió el usuario, cada una con 1 pregunta FIJA de `tema1Pc`:
  {
    id: 'v1',
    temaId: 'pc',
    titulo: 'Tema 1',
    src: '/academia/pacientes-especiales/cap-1/cap01-tema01.mp4',
    duracionSeg: 327,
    pausas: [
      // 2:00 — fin de Complicaciones (diapositivas 2-4). Pregunta 3:
      // reflejo de morder → abrebocas; deglución/tos → dique de goma.
      { seg: 120, pruebaId: 'tema1Pc', preguntas: [2] },
      // 3:30 — fin de Cita y sillón dental (diapositiva 7). Pregunta 8:
      // sillón a 45º para prevenir aspiraciones.
      { seg: 210, pruebaId: 'tema1Pc', preguntas: [7] },
    ],
    // Medido sobre la etiqueta de segmento de abajo a la izquierda.
    secciones: [
      { desde: 0, titulo: 'Introducción', temaId: 'pc' },
      { desde: 23.6, titulo: 'Complicaciones', temaId: 'pc' },
      { desde: 121, titulo: 'Técnicas anestésicas', temaId: 'pc' },
      { desde: 179.5, titulo: 'Cita y sillón dental', temaId: 'pc' },
      { desde: 210.5, titulo: 'Tratamiento odontológico', temaId: 'pc' },
      { desde: 269.5, titulo: 'Farmacología', temaId: 'pc' },
      { desde: 297.9, titulo: 'Emergencia médica', temaId: 'pc' },
    ],
  },
]

/**
 * 2026-09-28 — Preguntas del Tema 1 (docx "Odontología y Parálisis Cerebral —
 * Test Cap01 tema 01"): 15 preguntas, 4 opciones, en el orden del docx; la
 * justificación de la clave va como feedback (sin las referencias numéricas).
 * - `tema1Pc`: el pool entero; las pausas del vídeo usan índices fijos.
 * - `finalTema1`: la prueba final (la única que puntúa) — 3 preguntas fijas
 *   de todo el tema. Para cambiarlas, cambiar `ORDEN_FINAL_TEMA1`.
 * El Tema 2 viejo (Técnicas anestésicas: vídeo + cuestionario) se quitó de
 * la ruta; el Tema 1 es un solo vídeo. El nuevo Tema 2 llegará aparte.
 * Las pruebas del vídeo anterior (prueba1/prueba2/pruebaFinal) se quitaron.
 */
export type PruebaId = 'tema1Pc' | 'finalTema1'

const PREGUNTAS_TEMA1_PC: PreguntaAcademia[] = [
  // Bloque 1 — Complicaciones, manejo conductual, hallazgos orales, anestesia local / sedación IV
  // 1
  {
    pregunta: '¿Cuál es la forma clínica de Parálisis Cerebral más frecuente y cuáles son sus manifestaciones características?',
    opciones: [
      'Atetoide (15%), caracterizada por movimientos vermiformes e involuntarios.',
      'Atáxica (5-10%), caracterizada por la alteración del equilibrio y la marcha.',
      'Espástica (50-75%), caracterizada por hipertonía muscular, contracturas e hiperreflexia.',
      'Mixta, caracterizada exclusivamente por rigidez muscular severa e hipotonía facial.',
    ],
    correcta: 2,
    feedback: 'La forma espástica representa el 50-75% de los casos y cursa con hipertonía y contracturas.',
  },
  // 2
  {
    pregunta: '¿Cuál es la regla fundamental para aplicar la restricción física suave en pacientes con movimientos incontrolables (atetosis o corea)?',
    opciones: [
      'Inmovilizar con cinchas rígidas antes de iniciar la consulta sin requerir consentimiento.',
      'Sostener la cabeza y miembros de forma firme pero suave, haciendo fuerza únicamente durante el movimiento involuntario y con consentimiento previo.',
      'Aplicar fuerza continua e ininterrumpida durante toda la sesión sobre las articulaciones del paciente.',
      'Evitar cualquier contacto físico y realizar el tratamiento únicamente con sedación intravenosa obligatoria.',
    ],
    correcta: 1,
    feedback: 'La restricción física suave exige consentimiento previo y fuerza aplicada solo durante el movimiento involuntario.',
  },
  // 3
  {
    pregunta: 'Ante la presencia de reflejos patológicos en el gabinete, ¿qué dispositivos específicos están indicados para controlar el reflejo anormal de morder y el reflejo anormal de deglución/tos, respectivamente?',
    opciones: [
      'Dique de goma para el reflejo de morder y abrebocas para el reflejo de deglución.',
      'Parches de escopolamina para el reflejo de morder y eyector de saliva para el reflejo de deglución.',
      'Abrebocas para el reflejo de morder y dique de goma para el reflejo de deglución/tos.',
      'Cinchas de fijación para el reflejo de morder y mascarilla nasofaríngea para el reflejo de deglución.',
    ],
    correcta: 2,
    feedback: 'El abrebocas previene el cierre por el reflejo de morder y el dique de goma protege la vía respiratoria.',
  },
  // 4
  {
    pregunta: '¿Qué factores contribuyen principalmente al elevado riesgo de caries y atrición anormal (que afecta al 40-70% de los casos) en pacientes con parálisis cerebral?',
    opciones: [
      'Dieta blanda cariogénica, jarabes antiepilépticos con alto contenido de azúcares y bruxismo.',
      'Uso de enjuagues fluorados, hipotonía orofacial y hábito de deglución atípica.',
      'Falta de flujo salival, ausencia de reflejo de morder y uso de prótesis fijas.',
      'Dieta ácida exclusiva, tartrectomías frecuentes e hiperplasia gingival inducida por neurolépticos.',
    ],
    correcta: 0,
    feedback: 'La dieta blanda, la sacarosa/viscosidad de jarabes y el bruxismo explican la alta prevalencia de caries y atrición.',
  },
  // 5
  {
    pregunta: '¿Qué riesgo crítico se debe vigilar durante y después de la administración de sedación intravenosa (IV) en el gabinete?',
    opciones: [
      'Hipertermia maligna inmediata.',
      'Estenosis de la vía aérea superior.',
      'Paro cardíaco por fibrilación.',
      'Dislocación espontánea irreducible de la ATM.',
    ],
    correcta: 1,
    feedback: 'La sedación IV requiere vigilancia estrecha por el riesgo de estenosis de la vía aérea superior.',
  },
  // Bloque 2 — Anestesia general, cita y sillón dental, odontología preventiva y conservadora
  // 6
  {
    pregunta: '¿Cuáles son las tres complicaciones peri y posoperatorias principales a prevenir durante un procedimiento bajo Anestesia General?',
    opciones: [
      'Espasmos musculares, hipertensión e hiperplasia gingival.',
      'Aspiración, hipotermia y reflujo gastroesofágico.',
      'Estenosis de la vía aérea, queilitis comisural y atrición dentaria.',
      'Dislocación de ATM, arritmia ventricular y sialorrea aguda.',
    ],
    correcta: 1,
    feedback: 'En anestesia general los riesgos principales son aspiración, hipotermia y reflujo gastroesofágico.',
  },
  // 7
  {
    pregunta: 'Ante la necesidad de realizar un tratamiento dental simple en un paciente que acude en silla de ruedas, ¿cuál es la recomendación ergonómica de elección?',
    opciones: [
      'Trasladar obligatoriamente al paciente al sillón dental utilizando una grúa mecánica.',
      'Inducir sedación profunda para poder realizar la transferencia al sillón.',
      'Realizar la atención directamente en la propia silla de ruedas del paciente y programar sesiones cortas.',
      'Reclinar la silla de ruedas a 90º y colocar un abrebocas metálico de fijación rápida.',
    ],
    correcta: 2,
    feedback: 'Para intervenciones simples se recomienda la atención en la propia silla de ruedas para evitar traslados.',
  },
  // 8
  {
    pregunta: '¿A qué ángulo de inclinación debe mantenerse el sillón dental para prevenir eficazmente el riesgo de aspiraciones en el paciente?',
    opciones: [
      'En posición completamente horizontal (180º).',
      'En torno a los 45º.',
      'En posición vertical estricta a 90º.',
      'En posición de Trendelenburg (-15º).',
    ],
    correcta: 1,
    feedback: 'La inclinación a 45º previene eficazmente la aspiración de líquidos y secreciones.',
  },
  // 9
  {
    pregunta: '¿Por qué motivo están expresamente contraindicados los enjuagues bucales en pacientes con parálisis cerebral?',
    opciones: [
      'Por causar tinción irreversible en obturaciones de composite.',
      'Por la dificultad para enjuagarse y el riesgo de ingesta indeseada de líquidos.',
      'Por interactuar negativamente con los parches de escopolamina.',
      'Por desencadenar espasmos en la musculatura masticatoria.',
    ],
    correcta: 1,
    feedback: 'Los enjuagues se contraindican por la incapacidad de escupir y el riesgo de broncoaspiración o ingesta.',
  },
  // 10
  {
    pregunta: 'En odontología conservadora, si la técnica de restauración con composite se ve comprometida por movimientos incontrolables o humedad, ¿qué material de obturación en bloque está indicado?',
    opciones: [
      'Amalgama de plata con adhesivo sintético.',
      'Cemento de fosfato de zinc convencional.',
      'Sistema de restauración con vidrio híbrido.',
      'Resina fluida autograbante de curado dual.',
    ],
    correcta: 2,
    feedback: 'El vidrio híbrido permite la obturación en bloque cuando la técnica adhesiva con composite se compromete.',
  },
  // Bloque 3 — Especialidades complejas, farmacología / sialorrea y emergencias médicas
  // 11
  {
    pregunta: 'En la rehabilitación prostodóncica de pacientes con epilepsia o ataxia, ¿por qué razón se prioriza la prótesis fija frente a la removible?',
    opciones: [
      'Porque la prótesis fija es más económica y rápida de confeccionar.',
      'Porque la prótesis removible presenta dificultad de uso y un alto riesgo de desalojo, fractura o aspiración durante una crisis convulsiva.',
      'Porque las prótesis fijas no requieren higiene oral diaria.',
      'Porque el escáner intraoral no permite diseñar estructuras removibles.',
    ],
    correcta: 1,
    feedback: 'Las prótesis removibles conllevan riesgo de desalojo y aspiración accidental durante una convulsión.',
  },
  // 12
  {
    pregunta: '¿Cómo debe aplicarse la clorhexidina para el tratamiento periodontal precoz en estos pacientes?',
    opciones: [
      'Mediante colutorio con enjuagues de 1 minuto dos veces al día.',
      'En forma de spray, gel o gasa impregnada (evitando enjuagues bucales).',
      'Únicamente diluida en el agua del ultrasónico durante la tartrectomía.',
      'En irrigaciones subgingivales con jeringa de alta presión.',
    ],
    correcta: 1,
    feedback: 'La clorhexidina debe aplicarse en gel, spray o gasa impregnada sin recurrir a enjuagues.',
  },
  // 13
  {
    pregunta: '¿Qué técnica avanzada se utiliza para el control farmacológico del babeo o sialorrea mediante la inhibición directa de las glándulas submaxilares?',
    opciones: [
      'Aplicación de gel de fluoruro diamino de plata en el conducto de Stenon.',
      'Inyecciones de toxina botulínica bajo control ecográfico.',
      'Prescripción de neurolépticos orales en dosis masivas.',
      'Infiltración de anestesia local con vasoconstrictor cada 12 horas.',
    ],
    correcta: 1,
    feedback: 'La toxina botulínica ecoguiada en glándulas submaxilares es el tratamiento avanzado de elección para el babeo.',
  },
  // 14
  {
    pregunta: '¿Qué efecto secundario oral característico produce el uso continuado de fármacos antiepilépticos de base?',
    opciones: [
      'Necrosis pulpar espontánea.',
      'Agrandamiento e hiperplasia gingival.',
      'Atrofia del hueso alveolar en abanico.',
      'Hipersalivación ácida exclusivamente nocturna.',
    ],
    correcta: 1,
    feedback: 'Los antiepilépticos producen agrandamiento/hiperplasia gingival como efecto secundario común.',
  },
  // 15
  {
    pregunta: 'Ante el desencadenamiento de una crisis convulsiva en el gabinete odontológico, ¿cuál debe ser el primer paso del protocolo de emergencia?',
    opciones: [
      'Administrar inmediatamente agua o líquidos orales para calmar al paciente.',
      'Inclinar el sillón dental a 180º e iniciar respiración boca a boca.',
      'Interrumpir inmediatamente el procedimiento y despejar la cavidad oral de cualquier instrumento o material.',
      'Aplicar una inyección intramuscular de toxina botulínica.',
    ],
    correcta: 2,
    feedback: 'La prioridad ante una crisis es detener el trabajo y despejar la boca para proteger la vía aérea y evitar traumatismos.',
  },
]

/** Prueba final: 1 (espástica), 10 (vidrio híbrido) y 13 (toxina botulínica). */
const ORDEN_FINAL_TEMA1 = [0, 9, 12]

export const PRUEBAS_CAP1: Record<PruebaId, PreguntaAcademia[]> = {
  tema1Pc: PREGUNTAS_TEMA1_PC,
  finalTema1: ORDEN_FINAL_TEMA1.map((i) => PREGUNTAS_TEMA1_PC[i]),
}

/**
 * Cambio 2026-09-19 — las pruebas de después de video1/video2 ya NO dan
 * puntos (solo guardan los errores). La prueba final es la única que
 * puntúa y ahora tiene 3 preguntas FIJAS: las primeras 3 de
 * `PRUEBAS_CAP1.pruebaFinal`, siempre en ese orden. El resto del pool queda
 * guardado por si se quiere cambiar cuáles son (basta con reordenar el array).
 */
export const PREGUNTAS_PRUEBA_FINAL_CAP1 = 3

export type TipoNodo = 'intro' | 'video' | 'prueba'

export interface NodoRuta {
  id: string
  tipo: TipoNodo
  titulo: string
  temaId?: TemaId
  videoId?: VideoId
  pruebaId?: PruebaId
  /** true = es la prueba final del capítulo (nodo "jefe": squircle grande, ámbar, trofeo). */
  esFinal?: boolean
}

/**
 * Ruta del Capítulo 1: 5 nodos en orden fijo — Intro, Video 1, Video 2,
 * Video 3, Prueba final. prueba1/prueba2 dejaron de ser nodos propios
 * (rediseño 2026-09-17): viven ahora como ventana modal dentro de video1/
 * video2 — ver `VideoAcademia.pruebaId` arriba y `ModalPruebaVideo` en
 * Academia.tsx. video1/video2 solo se marcan `completado` cuando el video
 * se vio Y la pregunta del modal se acertó (ver `avanzarSinVolver` en
 * Academia.tsx), no con solo terminar el video.
 */
//
// Rediseño 2026-09-23: los 3 nodos de video (video1/video2/video3) pasan a
// ser UNO solo (`video`) — las pruebas intermedias viven ahora como pausas
// dentro de ese video (ver `VideoAcademia.pausas`). Ruta: Intro → Video →
// Prueba final. El progreso viejo con claves video1/2/3 se adapta al cargar
// (ver `normalizarProgresoAcademia` en academiaProgresoLocal.ts).
export const NODOS_CAP1: NodoRuta[] = [
  { id: 'intro', tipo: 'intro', titulo: 'Introducción' },
  { id: 'video', tipo: 'video', titulo: 'Video del tema', temaId: 'pc', videoId: 'v1' },
  { id: 'pruebaFinal', tipo: 'prueba', titulo: 'Prueba final', pruebaId: 'finalTema1', esFinal: true },
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
