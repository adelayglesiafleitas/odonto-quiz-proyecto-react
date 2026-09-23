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
        'Por ahora el capítulo tiene el video de Parálisis Cerebral, dividido en 3 partes. Al terminar cada parte aparece una pregunta y hay que responderla bien para pasar a la siguiente — si sale mal, se puede reintentar. Al final de las 3 partes hay una prueba que cierra el capítulo. Epilepsia y Distrofias Musculares se van a sumar más adelante.',
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
  {
    id: 'v1',
    temaId: 'pc',
    titulo: 'Tema 1',
    src: '/academia/pacientes-especiales/cap-1/cap01-tema01.mp4',
    duracionSeg: 727,
    pausas: [
      // Fin de Parálisis cerebral (Epilepsia arranca en 4:18).
      // Pregunta fija: prueba1[0] (espástica, 50-75 %).
      { seg: 257.5, pruebaId: 'prueba1', preguntas: [0] },
      // Fin de Epilepsia (Distrofias arranca en 7:51). Ojo: prueba2[4] (ECG /
      // función pulmonar) es de Distrofia Muscular — no usarla en esta pausa.
      // Pregunta fija: prueba2[0] (fase estable, más de 2 años sin crisis).
      { seg: 471, pruebaId: 'prueba2', preguntas: [0] },
    ],
    secciones: [
      { desde: 0, titulo: 'Introducción', temaId: 'pc' },
      { desde: 90.5, titulo: 'Parálisis Cerebral', temaId: 'pc' },
      { desde: 257.5, titulo: 'Epilepsia', temaId: 'epi' },
      { desde: 471, titulo: 'Distrofias Musculares', temaId: 'dm' },
      { desde: 601.5, titulo: 'Síntesis', temaId: 'dm' },
    ],
  },
]

/**
 * Las 3 pruebas del capítulo (5 preguntas cada una), tal como vienen del
 * documento "Examen de Odontología Especial" que pasó el usuario — 3
 * opciones por pregunta, con la justificación clínica ya integrada como
 * feedback. Hay que responder las 5 bien para aprobar (ver `quizCompleto`/
 * lógica de aprobación en Academia.tsx) — no es un puntaje parcial.
 *
 * Nota: la pregunta 10 (dentro de `prueba2`) es sobre Distrofia Muscular,
 * no Epilepsia — así está agrupada en el documento original ("Tramo 2:
 * Epilepsia y Comorbilidades Sistémicas", preguntas 6 a 10), se mantiene
 * fiel a la fuente.
 */
export type PruebaId = 'prueba1' | 'prueba2' | 'pruebaFinal'

export const PRUEBAS_CAP1: Record<PruebaId, PreguntaAcademia[]> = {
  prueba1: [
    {
      pregunta:
        '¿Qué porcentaje de pacientes con Parálisis Cerebral presenta el fenotipo de tipo espástico, caracterizado clínicamente por hipertonía muscular, contracturas e hiperreflexia tendinosa?',
      opciones: ['5% al 10%', '15%', '50% al 75%'],
      correcta: 2,
      feedback:
        'El fenotipo espástico es el más prevalente en la parálisis cerebral, afectando a un 50-75% de los pacientes, mientras que la atetosis representa el 15% y la ataxia un 5-10%.',
    },
    {
      pregunta: 'En el marco de la odontología preventiva para niños con Parálisis Cerebral, ¿por qué se recomienda la aplicación de flúor en barniz en lugar de flúor en gel?',
      opciones: [
        'Porque el gel destruye las restauraciones de amalgama previamente colocadas.',
        'Porque el barniz implica una menor cantidad de flúor ingerido en comparación con la aplicación en gel.',
        'Porque el gel de flúor induce espasmos musculares inmediatos al contacto oral.',
      ],
      correcta: 1,
      feedback: 'Se indica la aplicación de barniz de flúor para reducir la cantidad de flúor ingerido por el paciente al presentar reflejos de deglución alterados.',
    },
    {
      pregunta: 'Durante la atención de un paciente con Parálisis Cerebral en el sillón dental, ¿cuál es la inclinación máxima del asiento recomendada para prevenir aspiraciones?',
      opciones: ['Posición en decúbito supino completo a 0°.', 'Mantener una postura en torno a los 40°.', 'Posición vertical estricta a 90°.'],
      correcta: 1,
      feedback: 'No se debe inclinar en exceso el sillón dental; es necesario mantener al paciente en una postura cercana a los 40° para evitar la aparición de estertores y neumonías por aspiración.',
    },
    {
      pregunta: 'Ante la presencia confirmada del reflejo anormal de deglución y tos en un paciente con Parálisis Cerebral, ¿cuál es la medida de aislamiento u operativa de uso obligatorio?',
      opciones: ['El empleo del dique de goma.', 'La realización exclusiva de enjuagues con clorhexidina.', 'El uso de abrebocas de goma rígida únicamente.'],
      correcta: 0,
      feedback: 'El reflejo anormal de morder exige el uso de abrebocas, mientras que el reflejo anormal de deglución y tos requiere obligatoriamente el uso del dique de goma.',
    },
    {
      pregunta: 'Para el control clínico de la sialorrea (babeo excesivo) en pacientes con Parálisis Cerebral, ¿cuál de los siguientes tratamientos invasivos/farmacológicos se encuentra descrito?',
      opciones: [
        'La aplicación de inyecciones de toxina botulínica en la glándula submaxilar guiada por ecografía.',
        'La administración prolongada de jarabes antiepilépticos hiperconcentrados en azúcar.',
        'La exodoncia preventiva de todos los molares inferiores.',
      ],
      correcta: 0,
      feedback:
        'Entre los tratamientos descritos para la sialorrea se incluye la terapia de biofeedback, anticolinérgicos (escopolamina), cirugía salival y la inyección ecoguiada de toxina botulínica en glándulas submaxilares.',
    },
  ],
  prueba2: [
    {
      pregunta:
        'Para considerar que una epilepsia se encuentra en "fase estable" y poder realizar el tratamiento dental ambulatorio con seguridad, ¿cuánto tiempo debe haber transcurrido sin que el paciente presente crisis convulsivas?',
      opciones: ['Más de 6 meses.', 'Más de 1 año.', 'Más de 2 años.'],
      correcta: 2,
      feedback: 'La condición se considera activa si el último ataque ocurrió en los 2 años previos; se debe efectuar consulta médica y tratar en "fase estable" (más de 2 años sin crisis).',
    },
    {
      pregunta:
        '¿Por qué el uso de AINEs (como el ácido acetilsalicílico o ibuprofeno) se encuentra desaconsejado o contraindicado en pacientes epilépticos tratados con valproato sódico o carbamazepina?',
      opciones: [
        'Porque desencadenan de forma inmediata una crisis de falta de atención o "petit mal".',
        'Porque incrementan el riesgo de hemorragia al sumarse a la alteración de la agregación plaquetaria o trombocitopenia causada por estos fármacos.',
        'Porque inactivan de manera irreversible el efecto anticonvulsivante de la medicación.',
      ],
      correcta: 1,
      feedback:
        'El valproato sódico y la carbamazepina pueden causar trombocitopenia y alterar la agregación plaquetaria; el uso concomitante de AINEs eleva sustancialmente el riesgo de sangrado gingival o quirúrgico.',
    },
    {
      pregunta: 'En pacientes con epilepsia severa de tipo "gran mal", ¿cuál es la indicación protésica de elección y la contraindicación absoluta descrita?',
      opciones: [
        'Elección: prótesis removible de acrílico; contraindicación: prótesis fija de metal-porcelana.',
        'Elección: prótesis fija en dientes anteriores con caras palatinas metálicas; contraindicación: prótesis removible.',
        'Elección: prótesis removible parcial metálica; contraindicación: implantes osteointegrados.',
      ],
      correcta: 1,
      feedback:
        'En epilepsia severa ("gran mal"), la prótesis removible está contraindicada por riesgo de fractura e impacto/obstrucción de la vía aérea en una crisis; la elección es prótesis fija con caras palatinas metálicas.',
    },
    {
      pregunta: 'Durante la fase ictal o convulsiva activa de un ataque epiléptico "gran mal" en el gabinete, ¿cuál de las siguientes acciones representa una contraindicación estricta?',
      opciones: [
        'Girar suavemente al paciente hacia un lado para evitar la aspiración de secreciones.',
        'Introducir objetos duros entre los dientes o contener con fuerza los movimientos del paciente.',
        'Desaflojar la ropa apretada o ceñida y retirar objetos peligrosos del entorno.',
      ],
      correcta: 1,
      feedback: 'Ante una crisis convulsiva, jamás deben introducirse objetos duros en la boca ni intentar contener o agarrar al paciente con fuerza.',
    },
    {
      pregunta:
        'Antes de iniciar un tratamiento odontológico en un paciente con Distrofia Muscular, ¿qué pruebas de evaluación médica previa se deben requerir obligatoriamente debido a sus comorbilidades sistémicas?',
      opciones: ['Tests de función pulmonar, electrocardiograma (ECG) y radiografía de tórax.', 'Electroencefalograma de 24 horas y tomografía de cráneo.', 'Prueba de tolerancia a la glucosa y perfil tiroideo completo.'],
      correcta: 0,
      feedback: 'Debido al riesgo de cardiomiopatía, arritmias y fallo respiratorio, la interconsulta médica en distrofias musculares exige test de función pulmonar, ECG y radiografía de tórax.',
    },
  ],
  pruebaFinal: [
    {
      pregunta:
        'En la sedación consciente de un paciente con Distrofia Muscular, ¿qué grupo farmacológico se encuentra estrictamente prohibido debido a la posibilidad de desencadenar una depresión respiratoria letal?',
      opciones: ['Los anestésicos locales con vasoconstrictor tipo adrenalina.', 'Los fármacos opioides y las benzodiacepinas.', 'Los antisépticos bucales con clorhexidina.'],
      correcta: 1,
      feedback: 'En la sedación consciente de pacientes con distrofia muscular deben evitarse los opioides y las benzodiacepinas, ya que provocan una severa depresión respiratoria.',
    },
    {
      pregunta:
        '¿Cuál de las siguientes complicaciones anestésicas de máxima gravedad y riesgo vital se encuentra asociada a la anestesia general con agentes bloqueantes neuromusculares en pacientes con Distrofia Muscular?',
      opciones: ['Hipertermia maligna.', 'Hiperplasia gingival aguda.', 'Sialorrea masiva postoperatoria.'],
      correcta: 0,
      feedback: 'La anestesia general en distrofias musculares presenta riesgo de intubación difícil, depresión respiratoria, regurgitación y desarrollo de hipertermia maligna.',
    },
    {
      pregunta: '¿Cuál es la inclinación recomendada para el sillón dental y la modalidad de trabajo requerida para atender a un paciente con Distrofia Muscular?',
      opciones: [
        'Inclinación a 0° (horizontal) y sesiones extensas de más de 2 horas.',
        'Inclinación en torno a los 45° y sesiones cortas debido a la rápida fatiga muscular.',
        'Inclinación vertical a 90° sin uso de dique de goma ni aspiración.',
      ],
      correcta: 1,
      feedback: 'El sillón dental debe posicionarse a 45° para proteger la vía aérea y se deben programar citas cortas debido a la rápida fatiga producida por la debilidad muscular.',
    },
    {
      pregunta: '¿Por qué el tratamiento de ortodoncia en pacientes con Distrofias Musculares presenta un pronóstico impredecible?',
      opciones: [
        'Debido al desarrollo progresivo e ininterrumpido de las alteraciones dentofaciales y musculares.',
        'Por la imposibilidad absoluta de conseguir adhesión sobre el esmalte dental.',
        'Porque la medicación anticonvulsivante disuelve los aditamentos ortodóncicos.',
      ],
      correcta: 0,
      feedback: 'En la distrofia muscular, el tratamiento de ortodoncia es de pronóstico impredecible a causa de la evolución progresiva de las alteraciones dentofaciales y la miopatía facial.',
    },
    {
      pregunta: 'De acuerdo con la Matriz Maestra de Riesgos Clínicos, ¿cuál es la inclinación del sillón dental estandarizada para Parálisis Cerebral y Distrofia Muscular respectivamente?',
      opciones: ['10° en Parálisis Cerebral y 20° en Distrofia Muscular.', '40° en Parálisis Cerebral y 45° en Distrofia Muscular.', '80° en Parálisis Cerebral y 90° en Distrofia Muscular.'],
      correcta: 1,
      feedback: 'La postura estandarizada de prevención de aspiración en Parálisis Cerebral se fija en torno a los 40°, mientras que para las Distrofias Musculares se establece exactamente en 45°.',
    },
  ],
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
  { id: 'pruebaFinal', tipo: 'prueba', titulo: 'Prueba final', pruebaId: 'pruebaFinal', esFinal: true },
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
