export type Idioma = 'es' | 'en'

export interface Diccionario {
  comun: {
    nombreApp: string
    tagline: string
    tema: string
    modoOscuro: string
    modoClaro: string
    idioma: string
    bienvenidoOscuro: string
    bienvenidoClaro: string
    cancelar: string
  }
  login: {
    bienvenida: string
    subtitulo: string
    usuario: string
    contrasena: string
    error: string
    ingresando: string
    iniciarSesion: string
    demo: string
    demoNota: string
  }
  cursos: {
    odontologia: { nombre: string; descripcion: string }
    nacionalidad: { nombre: string; descripcion: string }
    conducir: { nombre: string; descripcion: string }
  }
  seleccionCurso: {
    titulo: string
    subtitulo: string
    empezar: string
    cerrarSesion: string
  }
  home: {
    hola: string
    estudiante: string
    cambiarCurso: string
    progreso: string
    promedioSufijo: (n: number) => string
    mejorPuntaje: string
    meta: (n: number) => string
    empezar: string
    cerrarSesion: string
    simulacroTitulo: string
    simulacroDesc: (cantidad: number, umbral: number) => string
    configurarTitulo: string
    configurarDesc: string
    estudioTitulo: string
    estudioDesc: string
    ayudaTitulo: string
    ayudaDesc: string
    modalTitulo: string
    modalSubtitulo: (cantidad: number) => string
    modalAnio: string
    comenzarSimulacro: string
  }
  configurar: {
    titulo: string
    cantidadPreguntas: string
    conLimite: string
    sinTiempo: string
    conTiempo: string
    duracion: string
    duracionOficial: string
    capitulo: string
    todosCapitulos: string
    anio: string
    todosAnios: string
    preguntas: string
    comenzar: string
  }
  examen: {
    preguntaContador: (a: number, b: number) => string
    multipleAyuda: string
    anterior: string
    siguiente: string
    finalizar: string
    salirTitulo: string
    salirDesc: (a: number, b: number) => string
    continuar: string
    salir: string
  }
  resultados: {
    aprobado: string
    noAprobado: string
    correctasSufijo: string
    minimoAprobatorio: string
    tuPromedio: string
    deMin: (n: number) => string
    sinLimite: string
    agotoTiempo: string
    repaso: string
    inicio: string
    repetir: string
    convocatoria: (anio: number | 'todos') => string
  }
  estudio: {
    titulo: string
    todos: string
    preguntaContador: (a: number, b: number) => string
    tocaVer: string
  }
  ayuda: {
    titulo: string
    simulacroTitulo: string
    simulacroTexto: string
    configurarTitulo: string
    configurarTexto: string
    puntuacionTitulo: string
    puntuacionTexto: (umbral: number) => string
    estudioTitulo: string
    estudioTexto: string
    formatoOficial: Record<
      'odontologia' | 'nacionalidad' | 'conducir',
      { titulo: string; texto: string; enlace?: { texto: string; url: string } }
    >
    footer: string
  }
}

export const es: Diccionario = {
  comun: {
    nombreApp: 'ExamPrep',
    tagline: 'Simulacros de examen oficiales',
    tema: 'Tema',
    modoOscuro: 'Oscuro',
    modoClaro: 'Claro',
    idioma: 'Idioma',
    bienvenidoOscuro: 'Bienvenido al lado oscuro',
    bienvenidoClaro: 'Bienvenido a la luz',
    cancelar: 'Cancelar',
  },
  login: {
    bienvenida: 'Bienvenido de nuevo',
    subtitulo: 'Inicia sesión para practicar tu examen',
    usuario: 'Usuario',
    contrasena: 'Contraseña',
    error: 'Usuario o contraseña incorrectos. Usa 123 / 123.',
    ingresando: 'Ingresando…',
    iniciarSesion: 'Iniciar sesión',
    demo: 'Acceso demo · usuario 123 · contraseña 123',
    demoNota: 'El inicio de sesión dinámico llegará próximamente',
  },
  cursos: {
    odontologia: {
      nombre: 'Homologación de Odontología',
      descripcion: 'Prueba de conjunto para ejercer como odontólogo en España',
    },
    nacionalidad: {
      nombre: 'Nacionalidad española (CCSE)',
      descripcion: 'Conocimientos constitucionales y socioculturales de España',
    },
    conducir: {
      nombre: 'Permiso de conducir (B)',
      descripcion: 'Examen teórico de la DGT: señales, normativa y seguridad vial',
    },
  },
  seleccionCurso: {
    titulo: '¿Qué vas a estudiar?',
    subtitulo: 'Elige la prueba que quieres practicar',
    empezar: 'Entrar',
    cerrarSesion: 'Cerrar sesión',
  },
  home: {
    hola: 'Hola,',
    estudiante: 'Estudiante',
    cambiarCurso: 'Cambiar de prueba',
    progreso: 'Tu progreso general',
    promedioSufijo: (n) => `promedio en ${n} simulacro${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'mejor puntaje',
    meta: (n) => `Meta: ${n}%`,
    empezar: 'Empezar',
    cerrarSesion: 'Cerrar sesión',
    simulacroTitulo: 'Simulacro de examen',
    simulacroDesc: (cantidad, umbral) => `${cantidad} preguntas aleatorias · ${umbral}% para aprobar`,
    configurarTitulo: 'Configurar examen',
    configurarDesc: 'Elige cantidad de preguntas y capítulo',
    estudioTitulo: 'Modo estudio',
    estudioDesc: 'Repasa preguntas y respuestas por capítulo',
    ayudaTitulo: 'Ayuda',
    ayudaDesc: 'Cómo funciona la app y la puntuación',
    modalTitulo: '¿Con límite de tiempo?',
    modalSubtitulo: (cantidad) => `Elige convocatoria y cómo quieres hacer tu simulacro de ${cantidad} preguntas`,
    modalAnio: 'Convocatoria',
    comenzarSimulacro: 'Comenzar simulacro',
  },
  configurar: {
    titulo: 'Configurar examen',
    cantidadPreguntas: 'Cantidad de preguntas',
    conLimite: '¿Con límite de tiempo?',
    sinTiempo: 'Sin tiempo',
    conTiempo: 'Con tiempo',
    duracion: 'Duración del examen',
    duracionOficial: 'oficial',
    capitulo: 'Capítulo',
    todosCapitulos: 'Todos los capítulos',
    anio: 'Convocatoria',
    todosAnios: 'Todas las convocatorias',
    preguntas: 'preguntas',
    comenzar: 'Comenzar examen',
  },
  examen: {
    preguntaContador: (a, b) => `Pregunta ${a} / ${b}`,
    multipleAyuda: 'Selecciona todas las opciones correctas',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    finalizar: 'Finalizar',
    salirTitulo: '¿Salir del examen?',
    salirDesc: (a, b) => `Perderás el progreso de esta sesión (${a}/${b} respondidas).`,
    continuar: 'Continuar',
    salir: 'Salir',
  },
  resultados: {
    aprobado: 'Examen aprobado',
    noAprobado: 'Examen no aprobado',
    correctasSufijo: 'correctas',
    minimoAprobatorio: 'mínimo aprobatorio',
    tuPromedio: 'tu promedio',
    deMin: (n) => `de ${n} min`,
    sinLimite: 'sin límite',
    agotoTiempo: 'Se agotó el tiempo y el examen se envió automáticamente',
    repaso: 'Repaso de respuestas',
    inicio: 'Inicio',
    repetir: 'Repetir',
    convocatoria: (anio) => (anio === 'todos' ? 'Todas las convocatorias' : `Convocatoria ${anio}`),
  },
  estudio: {
    titulo: 'Modo estudio',
    todos: 'Todos',
    preguntaContador: (a, b) => `Pregunta ${a} de ${b}`,
    tocaVer: 'Toca para ver la respuesta',
  },
  ayuda: {
    titulo: 'Ayuda',
    simulacroTitulo: 'Simulacro de examen',
    simulacroTexto: 'Responde preguntas aleatorias tal como en el examen real. Puedes navegar entre preguntas antes de finalizar.',
    configurarTitulo: 'Configurar examen',
    configurarTexto: 'Elige cuántas preguntas quieres, si tendrá límite de tiempo y si deseas practicar un capítulo específico o todos.',
    puntuacionTitulo: 'Puntuación y aprobación',
    puntuacionTexto: (umbral) =>
      `Cada simulacro se califica sobre 100%. Necesitas ${umbral}% o más para aprobar. Tu historial se promedia automáticamente y se muestra en el inicio.`,
    estudioTitulo: 'Modo estudio',
    estudioTexto: 'Repasa las preguntas sin presión: revela la respuesta correcta cuando quieras y avanza a tu ritmo por capítulo.',
    formatoOficial: {
      odontologia: {
        titulo: 'Cómo es la prueba oficial real',
        texto:
          'La prueba de conjunto para la homologación de Odontología en España dura 40 minutos por asignatura (sin prórroga). Cada pregunta tiene 4 opciones con 1 válida: acertar suma 1 punto, fallar o dejar en blanco no penaliza. Para aprobar una asignatura hacen falta 20/30 puntos en la parte teórica o 10/15 en la práctica (3 casos clínicos de 5 preguntas). El día del examen hay que llevar DNI/pasaporte, la resolución del Ministerio y bolígrafo azul o negro tipo BIC; no se permite ningún dispositivo electrónico. Elige la convocatoria en "Configurar examen" o en el simulacro rápido para practicar con el formato de un año concreto. Las convocatorias 2022-2026 reparten el mismo banco de preguntas de estudio entre varios años: ninguna universidad publica el enunciado real de sus exámenes, así que esto es material de práctica, no las preguntas exactas de cada convocatoria.',
      },
      nacionalidad: {
        titulo: 'Cómo es la prueba CCSE real',
        texto:
          'La prueba CCSE (Conocimientos Constitucionales y Socioculturales de España) del Instituto Cervantes consta de 25 preguntas repartidas en 5 tareas: 10 de selección múltiple sobre gobierno y participación ciudadana, 3 de verdadero/falso sobre derechos y deberes, 2 sobre geografía con apoyo de mapa, 3 sobre cultura e historia y 7 sobre vida en sociedad y trámites. Tienes 45 minutos y necesitas acertar 15 de 25 (60%) para obtener el "Apto". Las preguntas de gobierno, verdadero/falso y geografía de esta app están tomadas del Manual CCSE 2026 del Instituto Cervantes (el único manual vigente: cada edición anual sustituye a la anterior); las de cultura y sociedad se basan en su contenido oficial. El Instituto Cervantes no publica por adelantado el examen exacto que te tocará.',
      },
      conducir: {
        titulo: 'Cómo es el examen teórico real de la DGT',
        texto:
          'El examen teórico del permiso B tiene 30 preguntas tipo test y dura 30 minutos. Puedes fallar como máximo 3 preguntas: necesitas acertar 27 de 30 (90%) para aprobar, y una pregunta sin responder cuenta como fallo. La DGT no publica su banco de preguntas exacto (para preservar la validez del examen), así que las preguntas de esta app se basan en normativa real y vigente: el Reglamento General de Circulación, la Ley de Tráfico, las notas de prensa oficiales de la DGT (incluyendo cambios recientes como la baliza V16) y el "Diccionario en Lectura Fácil. Permiso B" de la propia DGT, del que se han tomado varias definiciones oficiales para generar preguntas adicionales.',
        enlace: {
          texto: 'Descargar el Diccionario en Lectura Fácil (PDF oficial de la DGT)',
          url: 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/permisos-de-conducir/Accesibilidad/Diccionario-en-Lectura-Facil.-Permiso-B.pdf',
        },
      },
    },
    footer:
      'El inicio de sesión es una versión demo (usuario y contraseña: 123). Tus preferencias, tu curso activo y tus puntuaciones se guardan en cookies en este navegador.',
  },
}

export const en: Diccionario = {
  comun: {
    nombreApp: 'ExamPrep',
    tagline: 'Official exam simulations',
    tema: 'Theme',
    modoOscuro: 'Dark',
    modoClaro: 'Light',
    idioma: 'Language',
    bienvenidoOscuro: 'Welcome to the dark side',
    bienvenidoClaro: 'Welcome to the light',
    cancelar: 'Cancel',
  },
  login: {
    bienvenida: 'Welcome back',
    subtitulo: 'Sign in to practice your exam',
    usuario: 'Username',
    contrasena: 'Password',
    error: 'Incorrect username or password. Use 123 / 123.',
    ingresando: 'Signing in…',
    iniciarSesion: 'Sign in',
    demo: 'Demo access · username 123 · password 123',
    demoNota: 'Dynamic sign-in is coming soon',
  },
  cursos: {
    odontologia: {
      nombre: 'Dentistry degree recognition',
      descripcion: 'Test to practice as a dentist in Spain',
    },
    nacionalidad: {
      nombre: 'Spanish nationality (CCSE)',
      descripcion: 'Constitutional and sociocultural knowledge of Spain',
    },
    conducir: {
      nombre: 'Driving licence (category B)',
      descripcion: 'DGT theory test: road signs, rules and road safety',
    },
  },
  seleccionCurso: {
    titulo: 'What are you studying for?',
    subtitulo: 'Choose the exam you want to practice',
    empezar: 'Enter',
    cerrarSesion: 'Sign out',
  },
  home: {
    hola: 'Hi,',
    estudiante: 'Student',
    cambiarCurso: 'Switch exam',
    progreso: 'Your overall progress',
    promedioSufijo: (n) => `average across ${n} mock exam${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'best score',
    meta: (n) => `Goal: ${n}%`,
    empezar: 'Get started',
    cerrarSesion: 'Sign out',
    simulacroTitulo: 'Mock exam',
    simulacroDesc: (cantidad, umbral) => `${cantidad} random questions · ${umbral}% to pass`,
    configurarTitulo: 'Configure exam',
    configurarDesc: 'Choose question count and chapter',
    estudioTitulo: 'Study mode',
    estudioDesc: 'Review questions and answers by chapter',
    ayudaTitulo: 'Help',
    ayudaDesc: 'How the app and scoring work',
    modalTitulo: 'Time limit?',
    modalSubtitulo: (cantidad) => `Choose the exam year and how you want to take your ${cantidad}-question mock exam`,
    modalAnio: 'Exam year',
    comenzarSimulacro: 'Start mock exam',
  },
  configurar: {
    titulo: 'Configure exam',
    cantidadPreguntas: 'Number of questions',
    conLimite: 'Time limit?',
    sinTiempo: 'No time limit',
    conTiempo: 'Timed',
    duracion: 'Exam duration',
    duracionOficial: 'official',
    capitulo: 'Chapter',
    todosCapitulos: 'All chapters',
    anio: 'Exam year',
    todosAnios: 'All years',
    preguntas: 'questions',
    comenzar: 'Start exam',
  },
  examen: {
    preguntaContador: (a, b) => `Question ${a} / ${b}`,
    multipleAyuda: 'Select all correct options',
    anterior: 'Previous',
    siguiente: 'Next',
    finalizar: 'Finish',
    salirTitulo: 'Exit the exam?',
    salirDesc: (a, b) => `You will lose this session's progress (${a}/${b} answered).`,
    continuar: 'Continue',
    salir: 'Exit',
  },
  resultados: {
    aprobado: 'Exam passed',
    noAprobado: 'Exam not passed',
    correctasSufijo: 'correct',
    minimoAprobatorio: 'minimum to pass',
    tuPromedio: 'your average',
    deMin: (n) => `of ${n} min`,
    sinLimite: 'no limit',
    agotoTiempo: 'Time ran out and the exam was submitted automatically',
    repaso: 'Answer review',
    inicio: 'Home',
    repetir: 'Retry',
    convocatoria: (anio) => (anio === 'todos' ? 'All years' : `${anio} exam year`),
  },
  estudio: {
    titulo: 'Study mode',
    todos: 'All',
    preguntaContador: (a, b) => `Question ${a} of ${b}`,
    tocaVer: 'Tap to reveal the answer',
  },
  ayuda: {
    titulo: 'Help',
    simulacroTitulo: 'Mock exam',
    simulacroTexto: 'Answer random questions just like the real exam. You can navigate between questions before finishing.',
    configurarTitulo: 'Configure exam',
    configurarTexto: 'Choose how many questions you want, whether it has a time limit, and whether to practice a specific chapter or all of them.',
    puntuacionTitulo: 'Scoring and passing',
    puntuacionTexto: (umbral) =>
      `Each mock exam is scored out of 100%. You need ${umbral}% or more to pass. Your history is averaged automatically and shown on the home screen.`,
    estudioTitulo: 'Study mode',
    estudioTexto: 'Review questions with no pressure: reveal the correct answer whenever you want and move at your own pace by chapter.',
    formatoOficial: {
      odontologia: {
        titulo: 'What the real official exam is like',
        texto:
          'The official "prueba de conjunto" for Dentistry degree recognition in Spain lasts 40 minutes per subject (no extensions). Each question has 4 options with 1 correct answer: a correct answer scores 1 point, a wrong or blank answer scores 0 (no penalty). Passing a subject requires 20/30 points in the theory part or 10/15 in the practical part (3 clinical cases of 5 questions each). On exam day you must bring your ID/passport, the Ministry resolution letter, and a blue or black oil-based pen; no electronic devices are allowed. Pick a specific exam year in "Configure exam" or the quick mock exam to practice that year\'s format. The 2022-2026 exam years split the same study question bank across several years: no university publishes the real wording of its exams, so this is practice material, not the exact questions from any given year.',
      },
      nacionalidad: {
        titulo: 'What the real CCSE exam is like',
        texto:
          'The Instituto Cervantes CCSE exam (Constitutional and Sociocultural Knowledge of Spain) has 25 questions across 5 tasks: 10 multiple-choice on government and civic participation, 3 true/false on rights and duties, 2 on geography with a map, 3 on culture and history, and 7 on everyday life and paperwork. You have 45 minutes and need 15 out of 25 correct (60%) to pass. The government, true/false and geography questions in this app are taken directly from the Instituto Cervantes CCSE 2026 Manual (the only edition in force — each yearly edition replaces the previous one); the culture and society questions are based on its official content. The Instituto Cervantes does not publish the exact exam you will get in advance.',
      },
      conducir: {
        titulo: 'What the real DGT theory test is like',
        texto:
          'The category-B theory test has 30 multiple-choice questions and lasts 30 minutes. You can miss at most 3 questions: you need 27 out of 30 correct (90%) to pass, and an unanswered question counts as a mistake. The DGT does not publish its exact question bank (to keep the exam valid), so this app\'s questions are based on real, current regulations: the General Traffic Regulations, the Traffic Law, official DGT press releases (including recent changes like the V16 beacon), and the DGT\'s own "Easy-to-Read Dictionary for Licence B", from which several official definitions were used to generate additional questions.',
        enlace: {
          texto: 'Download the Easy-to-Read Dictionary (official DGT PDF)',
          url: 'https://www.dgt.es/export/sites/web-DGT/.galleries/downloads/nuestros_servicios/permisos-de-conducir/Accesibilidad/Diccionario-en-Lectura-Facil.-Permiso-B.pdf',
        },
      },
    },
    footer:
      'Sign-in is a demo version (username and password: 123). Your preferences, active exam, and scores are saved as cookies in this browser.',
  },
}

export function getDiccionario(idioma: Idioma): Diccionario {
  return idioma === 'en' ? en : es
}
