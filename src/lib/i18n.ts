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
    cargando: string
  }
  login: {
    tituloLogin: string
    tituloRegistro: string
    subtituloLogin: string
    subtituloRegistro: string
    nick: string
    correo: string
    contrasena: string
    confirmarContrasena: string
    iniciarSesion: string
    crearCuenta: string
    ingresando: string
    creandoCuenta: string
    noTengoCuenta: string
    yaTengoCuenta: string
    revisaCorreo: string
    error: string
    errorContrasenasNoCoinciden: string
    errorContrasenaCorta: string
    errorNickRequerido: string
  }
  dispositivo: {
    titulo: string
    mensaje: (n: number) => string
    cerrarOtrosBoton: string
    cancelarBoton: string
    cerrando: string
  }
  home: {
    hola: string
    estudiante: string
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
    fraseEtiqueta: string
    bienvenidaEtiqueta: string
    racha: (n: number) => string
    verEstadisticas: string
  }
  configurar: {
    titulo: string
    asignatura: string
    masAsignaturas: string
    cantidadPreguntas: string
    conLimite: string
    sinTiempo: string
    conTiempo: string
    duracion: string
    duracionOficial: string
    capitulo: string
    capituloAyuda: string
    todosCapitulos: string
    anio: string
    todosAnios: string
    preguntas: string
    comenzar: string
    heroTitulo: string
    heroDescripcion: string
    heroDuracionEtiqueta: string
    heroTodos: string
    heroCapitulosEtiqueta: string
    personalizarBoton: string
    personalizandoTitulo: string
    personalizandoBase: (cantidad: number, minutos: number) => string
    restablecer: string
  }
  examen: {
    preguntaContador: (a: number, b: number) => string
    casoClinico: string
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
    repasarFallosTitulo: string
    repasarFallosDesc: (n: number) => string
  }
  estudio: {
    titulo: string
    todos: string
    preguntaContador: (a: number, b: number) => string
    tocaVer: string
    totalPreguntas: (n: number) => string
  }
  ayuda: {
    titulo: string
    navegacionTitulo: string
    navegacionTexto: string
    simulacroTitulo: string
    simulacroTexto: string
    configurarTitulo: string
    configurarTexto: string
    repasarFallosTitulo: string
    repasarFallosTexto: string
    rachaTitulo: string
    rachaTexto: string
    puntuacionTitulo: string
    puntuacionTexto: (umbral: number) => string
    estudioTitulo: string
    estudioTexto: string
    formatoOficial: { titulo: string; texto: string; enlace?: { texto: string; url: string } }
    footer: string
    seccionUsarApp: string
    seccionAtencionCliente: string
    escribirSoporteTitulo: string
    escribirSoporteTexto: string
    misConsultasTitulo: string
    misConsultasResumen: (total: number, sinLeer: number) => string
    proximamente: string
  }
  reportarPregunta: {
    abrir: string
    titulo: string
    subtitulo: string
    motivos: Record<'respuesta_incorrecta' | 'opcion_ambigua_o_duplicada' | 'texto_con_error' | 'otro', string>
    comentarioPlaceholder: string
    enviar: string
    exito: string
    listo: string
    error: string
  }
  soporte: {
    tituloLista: string
    subtituloLista: string
    nuevaConsulta: string
    vacioTitulo: string
    vacioTexto: string
    estado: Record<'abierto' | 'en_progreso' | 'resuelto' | 'cerrado', string>
    motivo: Record<'cuenta' | 'pagos' | 'otro', string>
    preguntaChip: (numero: number) => string
    nuevoTitulo: string
    nuevoSubtitulo: string
    asuntoLabel: string
    asuntoPlaceholder: string
    mensajeLabel: string
    mensajePlaceholder: string
    enviar: string
    enviando: string
    error: string
    camposRequeridos: string
    escribirPlaceholder: string
    reabreAviso: string
    soporteAutor: string
    vos: string
  }
  nav: {
    home: string
    academia: string
    ayuda: string
    config: string
    simulacro: string
  }
  academia: {
    titulo: string
    bienvenidaTitulo: string
    bienvenidaTexto: string
    proximamente: string
  }
  config: {
    titulo: string
    cuenta: string
    preferencias: string
  }
  asignaturas: {
    titulo: string
    subtitulo: string
  }
  estadisticas: {
    titulo: string
    general: string
    promedioGeneral: string
    intentos: (n: number) => string
    actividadSemanal: string
    porCapitulo: string
    porAsignatura: string
    puntoDebil: string
    sinDatosTitulo: string
    sinDatosTexto: string
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
    cargando: 'Cargando...',
  },
  login: {
    tituloLogin: 'Bienvenido de nuevo',
    tituloRegistro: 'Crea tu cuenta',
    subtituloLogin: 'Inicia sesión para practicar tu examen',
    subtituloRegistro: 'Regístrate para guardar tu progreso',
    nick: 'Nick',
    correo: 'Correo electrónico',
    contrasena: 'Contraseña',
    confirmarContrasena: 'Confirma tu contraseña',
    iniciarSesion: 'Iniciar sesión',
    crearCuenta: 'Crear cuenta',
    ingresando: 'Ingresando…',
    creandoCuenta: 'Creando cuenta…',
    noTengoCuenta: '¿No tienes cuenta? Regístrate',
    yaTengoCuenta: '¿Ya tienes cuenta? Inicia sesión',
    revisaCorreo: 'Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
    error: 'Correo o contraseña incorrectos.',
    errorContrasenasNoCoinciden: 'Las contraseñas no coinciden.',
    errorContrasenaCorta: 'La contraseña debe tener al menos 6 caracteres.',
    errorNickRequerido: 'Escribe un nick.',
  },
  dispositivo: {
    titulo: 'Límite de dispositivos alcanzado',
    mensaje: (n) =>
      `Esta cuenta ya está iniciada en ${n} dispositivos. Por seguridad, solo se permiten 2 a la vez. Cierra sesión en otro dispositivo para continuar aquí.`,
    cerrarOtrosBoton: 'Cerrar sesión en los demás y continuar aquí',
    cancelarBoton: 'Cancelar',
    cerrando: 'Cerrando sesión en los demás dispositivos…',
  },
  home: {
    hola: 'Hola,',
    estudiante: 'Estudiante',
    progreso: 'Tu progreso general',
    promedioSufijo: (n) => `promedio en ${n} simulacro${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'mejor puntaje',
    meta: (n) => `Meta: ${n}%`,
    empezar: 'Empezar',
    cerrarSesion: 'Cerrar sesión',
    simulacroTitulo: 'Simulacro de examen: Pacientes Especiales',
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
    fraseEtiqueta: 'Frase del día',
    bienvenidaEtiqueta: 'Bienvenido',
    racha: (n) => `${n} día${n === 1 ? '' : 's'} seguidos`,
    verEstadisticas: 'Ver estadísticas completas',
  },
  configurar: {
    titulo: 'Configurar examen',
    asignatura: 'Asignatura',
    masAsignaturas: 'Más asignaturas próximamente',
    cantidadPreguntas: 'Cantidad de preguntas',
    conLimite: '¿Con límite de tiempo?',
    sinTiempo: 'Sin tiempo',
    conTiempo: 'Con tiempo',
    duracion: 'Duración del examen',
    duracionOficial: 'oficial',
    capitulo: 'Capítulo',
    capituloAyuda: 'Podés elegir más de uno',
    todosCapitulos: 'Todos los capítulos',
    anio: 'Convocatoria',
    todosAnios: 'Todas las convocatorias',
    preguntas: 'preguntas',
    comenzar: 'Comenzar examen',
    heroTitulo: 'Examen oficial',
    heroDescripcion:
      'Mismas condiciones que el examen real de homologación: mismo número de preguntas, mismo tiempo y el banco completo sin filtrar.',
    heroDuracionEtiqueta: 'duración',
    heroTodos: 'Todos',
    heroCapitulosEtiqueta: 'los capítulos',
    personalizarBoton: 'Personalizar cantidad, tiempo y capítulos',
    personalizandoTitulo: 'Personalizando el examen oficial',
    personalizandoBase: (cantidad, minutos) => `Base: ${cantidad} preguntas · ${minutos} min · todos los capítulos`,
    restablecer: 'Restablecer a valores oficiales',
  },
  examen: {
    preguntaContador: (a, b) => `Pregunta ${a} / ${b}`,
    casoClinico: 'Caso clínico',
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
    repasarFallosTitulo: 'Repasar lo que fallé',
    repasarFallosDesc: (n) => `${n} pregunta${n === 1 ? '' : 's'} para repasar`,
  },
  estudio: {
    titulo: 'Modo estudio',
    todos: 'Todos',
    preguntaContador: (a, b) => `Pregunta ${a} de ${b}`,
    tocaVer: 'Toca para ver la respuesta',
    totalPreguntas: (n) => `${n} pregunta${n === 1 ? '' : 's'}`,
  },
  ayuda: {
    titulo: 'Ayuda',
    navegacionTitulo: 'Cómo moverte por la app',
    navegacionTexto:
      'Abajo tenés 5 accesos siempre disponibles: Home (tu progreso y racha), Academia (modo estudio y contenido), el botón central de Simulacro (para rendir un examen), Ayuda y Configuración (tu cuenta y preferencias).',
    simulacroTitulo: 'Simulacro de examen',
    simulacroTexto: 'Toca el botón central de Simulacro para elegir la asignatura y luego responder preguntas aleatorias tal como en el examen real. Puedes navegar entre preguntas antes de finalizar.',
    configurarTitulo: 'Configurar examen',
    configurarTexto: 'Después de elegir la asignatura, elige cuántas preguntas quieres, si tendrá límite de tiempo y si deseas practicar un capítulo específico o todos.',
    repasarFallosTitulo: 'Repasa lo que fallaste',
    repasarFallosTexto:
      'Al terminar un simulacro, si fallaste alguna pregunta aparece un botón para armar al toque un mini-examen solo con esas preguntas. Es una herramienta de repaso: no cuenta como un intento nuevo, así que no cambia tu promedio ni tu racha.',
    rachaTitulo: 'Racha de estudio',
    rachaTexto: 'Cada día que completes al menos un simulacro suma un día a tu racha, visible en el inicio. Si pasa un día entero sin practicar, la racha vuelve a empezar desde cero.',
    puntuacionTitulo: 'Puntuación y aprobación',
    puntuacionTexto: (umbral) =>
      `Cada simulacro se califica sobre 100%. Necesitas ${umbral}% o más para aprobar. Tu historial se promedia automáticamente y se muestra en el inicio.`,
    estudioTitulo: 'Modo estudio',
    estudioTexto: 'Dentro de Academia, repasa las preguntas sin presión: revela la respuesta correcta cuando quieras y avanza a tu ritmo por capítulo.',
    formatoOficial: {
      titulo: 'Cómo es la prueba oficial real',
      texto:
        'La prueba de conjunto para la homologación de Odontología en España dura 40 minutos por asignatura (sin prórroga). Cada pregunta tiene 4 opciones con 1 válida: acertar suma 1 punto, fallar o dejar en blanco no penaliza. Para aprobar una asignatura hacen falta 20/30 puntos en la parte teórica o 10/15 en la práctica (3 casos clínicos de 5 preguntas). El día del examen hay que llevar DNI/pasaporte, la resolución del Ministerio y bolígrafo azul o negro tipo BIC; no se permite ningún dispositivo electrónico. Elige la convocatoria en "Configurar examen" o en el simulacro rápido para practicar con el formato de un año concreto. Las convocatorias 2022-2026 reparten el mismo banco de preguntas de estudio entre varios años: ninguna universidad publica el enunciado real de sus exámenes, así que esto es material de práctica, no las preguntas exactas de cada convocatoria.',
    },
    footer:
      'Tu cuenta y tu historial de puntuaciones se guardan de forma segura en tu perfil, así que los tienes disponibles en cualquier dispositivo en el que inicies sesión. Tus preferencias de tema e idioma se guardan solo en este navegador.',
    seccionUsarApp: 'Usar la app',
    seccionAtencionCliente: 'Atención al cliente',
    escribirSoporteTitulo: 'Escribir a soporte',
    escribirSoporteTexto: 'Contanos qué pasó y te respondemos por acá.',
    misConsultasTitulo: 'Mis consultas',
    misConsultasResumen: (total, sinLeer) => {
      if (total === 0) return 'Todavía no escribiste a soporte'
      if (sinLeer === 0) return `${total} conversación${total === 1 ? '' : 'es'}`
      return `${total} conversación${total === 1 ? '' : 'es'} · ${sinLeer} sin leer`
    },
    proximamente: 'Próximamente',
  },
  reportarPregunta: {
    abrir: 'Reportar esta pregunta',
    titulo: 'Reportar esta pregunta',
    subtitulo: '¿Qué está mal?',
    motivos: {
      respuesta_incorrecta: 'La respuesta marcada como correcta no lo es',
      opcion_ambigua_o_duplicada: 'Una opción es ambigua o está duplicada',
      texto_con_error: 'El enunciado o una opción tiene un error de texto',
      otro: 'Otro motivo',
    },
    comentarioPlaceholder: 'Contanos más (opcional)',
    enviar: 'Enviar reporte',
    exito: 'Gracias, lo vamos a revisar.',
    listo: 'Listo',
    error: 'No se pudo enviar. Intenta de nuevo.',
  },
  soporte: {
    tituloLista: 'Mis consultas',
    subtituloLista: 'Tus conversaciones con soporte',
    nuevaConsulta: 'Nueva consulta',
    vacioTitulo: 'Todavía no escribiste a soporte',
    vacioTexto: 'Cuando tengas una consulta o un problema, escribinos y te vamos a responder acá.',
    estado: {
      abierto: 'Abierto',
      en_progreso: 'En progreso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
    },
    motivo: {
      cuenta: 'Mi cuenta o mi perfil',
      pagos: 'Pagos y suscripción',
      otro: 'Otra consulta',
    },
    preguntaChip: (numero) => `Pregunta N.º ${numero}`,
    nuevoTitulo: 'Nueva consulta',
    nuevoSubtitulo: 'Elegí el motivo y contanos qué necesitás',
    asuntoLabel: 'Asunto',
    asuntoPlaceholder: 'Resumí tu consulta en pocas palabras',
    mensajeLabel: 'Contanos más',
    mensajePlaceholder: 'Dános el mayor detalle posible…',
    enviar: 'Enviar',
    enviando: 'Enviando…',
    error: 'No se pudo enviar. Intenta de nuevo.',
    camposRequeridos: 'Completá el asunto y el mensaje.',
    escribirPlaceholder: 'Escribí un mensaje…',
    reabreAviso: 'Esta consulta está resuelta — si escribís un mensaje, se reabre automáticamente.',
    soporteAutor: 'Soporte',
    vos: 'Vos',
  },
  nav: {
    home: 'Home',
    academia: 'Academia',
    ayuda: 'Ayuda',
    config: 'Config',
    simulacro: 'Examinarse',
  },
  academia: {
    titulo: 'Academia',
    bienvenidaTitulo: 'Bienvenido a la Academia',
    bienvenidaTexto: 'Este va a ser tu espacio para aprender: acá vas a encontrar clases y contenido de estudio más adelante.',
    proximamente: 'Contenido próximamente',
  },
  config: {
    titulo: 'Configuración',
    cuenta: 'Tu cuenta',
    preferencias: 'Preferencias',
  },
  asignaturas: {
    titulo: '¿Qué vas a examinar?',
    subtitulo: 'Elige la asignatura para configurar tu simulacro.',
  },
  estadisticas: {
    titulo: 'Estadísticas',
    general: 'General',
    promedioGeneral: 'Promedio general',
    intentos: (n) => `${n} simulacro${n === 1 ? '' : 's'} realizados`,
    actividadSemanal: 'Actividad de esta semana',
    porCapitulo: 'Por capítulo',
    porAsignatura: 'Por asignatura',
    puntoDebil: 'Punto débil',
    sinDatosTitulo: 'Todavía no hay datos',
    sinDatosTexto: 'Completa tu primer simulacro para ver tus estadísticas acá.',
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
    cargando: 'Loading...',
  },
  login: {
    tituloLogin: 'Welcome back',
    tituloRegistro: 'Create your account',
    subtituloLogin: 'Sign in to practice your exam',
    subtituloRegistro: 'Sign up to save your progress',
    nick: 'Nickname',
    correo: 'Email',
    contrasena: 'Password',
    confirmarContrasena: 'Confirm your password',
    iniciarSesion: 'Sign in',
    crearCuenta: 'Create account',
    ingresando: 'Signing in…',
    creandoCuenta: 'Creating account…',
    noTengoCuenta: "Don't have an account? Sign up",
    yaTengoCuenta: 'Already have an account? Sign in',
    revisaCorreo: 'Check your email to confirm your account before signing in.',
    error: 'Incorrect email or password.',
    errorContrasenasNoCoinciden: 'Passwords do not match.',
    errorContrasenaCorta: 'Password must be at least 6 characters.',
    errorNickRequerido: 'Enter a nickname.',
  },
  dispositivo: {
    titulo: 'Device limit reached',
    mensaje: (n) =>
      `This account is already signed in on ${n} devices. For security, only 2 are allowed at once. Sign out on another device to continue here.`,
    cerrarOtrosBoton: 'Sign out everywhere else and continue here',
    cancelarBoton: 'Cancel',
    cerrando: 'Signing out on other devices…',
  },
  home: {
    hola: 'Hi,',
    estudiante: 'Student',
    progreso: 'Your overall progress',
    promedioSufijo: (n) => `average across ${n} mock exam${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'best score',
    meta: (n) => `Goal: ${n}%`,
    empezar: 'Get started',
    cerrarSesion: 'Sign out',
    simulacroTitulo: 'Mock exam: Special-Needs Patients',
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
    fraseEtiqueta: 'Quote of the day',
    bienvenidaEtiqueta: 'Welcome',
    racha: (n) => `${n}-day streak`,
    verEstadisticas: 'View full statistics',
  },
  configurar: {
    titulo: 'Configure exam',
    asignatura: 'Subject',
    masAsignaturas: 'More subjects coming soon',
    cantidadPreguntas: 'Number of questions',
    conLimite: 'Time limit?',
    sinTiempo: 'No time limit',
    conTiempo: 'Timed',
    duracion: 'Exam duration',
    duracionOficial: 'official',
    capitulo: 'Chapter',
    capituloAyuda: 'You can pick more than one',
    todosCapitulos: 'All chapters',
    anio: 'Exam year',
    todosAnios: 'All years',
    preguntas: 'questions',
    comenzar: 'Start exam',
    heroTitulo: 'Official exam',
    heroDescripcion:
      'Same conditions as the real accreditation exam: same number of questions, same time limit, and the full question bank with no filters.',
    heroDuracionEtiqueta: 'duration',
    heroTodos: 'All',
    heroCapitulosEtiqueta: 'chapters',
    personalizarBoton: 'Customize question count, time and chapters',
    personalizandoTitulo: 'Customizing the official exam',
    personalizandoBase: (cantidad, minutos) => `Base: ${cantidad} questions · ${minutos} min · all chapters`,
    restablecer: 'Reset to official settings',
  },
  examen: {
    preguntaContador: (a, b) => `Question ${a} / ${b}`,
    casoClinico: 'Clinical case',
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
    repasarFallosTitulo: 'Review what I missed',
    repasarFallosDesc: (n) => `${n} question${n === 1 ? '' : 's'} to review`,
  },
  estudio: {
    titulo: 'Study mode',
    todos: 'All',
    preguntaContador: (a, b) => `Question ${a} of ${b}`,
    tocaVer: 'Tap to reveal the answer',
    totalPreguntas: (n) => `${n} question${n === 1 ? '' : 's'}`,
  },
  ayuda: {
    titulo: 'Help',
    navegacionTitulo: 'Getting around the app',
    navegacionTexto:
      "There are 5 tabs always available at the bottom: Home (your progress and streak), Academy (study mode and content), the center Mock exam button (to take an exam), Help, and Settings (your account and preferences).",
    simulacroTitulo: 'Mock exam',
    simulacroTexto: 'Tap the center Mock exam button to pick a subject, then answer random questions just like the real exam. You can navigate between questions before finishing.',
    configurarTitulo: 'Configure exam',
    configurarTexto: 'After picking the subject, choose how many questions you want, whether it has a time limit, and whether to practice a specific chapter or all of them.',
    repasarFallosTitulo: 'Review what you missed',
    repasarFallosTexto:
      "After finishing a mock exam, if you missed any question a button appears to instantly build a mini-exam with just those questions. It's a review tool: it doesn't count as a new attempt, so it won't change your average or your streak.",
    rachaTitulo: 'Study streak',
    rachaTexto: "Every day you complete at least one mock exam adds a day to your streak, shown on the home screen. If a full day goes by without practicing, the streak resets to zero.",
    puntuacionTitulo: 'Scoring and passing',
    puntuacionTexto: (umbral) =>
      `Each mock exam is scored out of 100%. You need ${umbral}% or more to pass. Your history is averaged automatically and shown on the home screen.`,
    estudioTitulo: 'Study mode',
    estudioTexto: "Inside Academy, review questions with no pressure: reveal the correct answer whenever you want and move at your own pace by chapter.",
    formatoOficial: {
      titulo: 'What the real official exam is like',
      texto:
        'The official "prueba de conjunto" for Dentistry degree recognition in Spain lasts 40 minutes per subject (no extensions). Each question has 4 options with 1 correct answer: a correct answer scores 1 point, a wrong or blank answer scores 0 (no penalty). Passing a subject requires 20/30 points in the theory part or 10/15 in the practical part (3 clinical cases of 5 questions each). On exam day you must bring your ID/passport, the Ministry resolution letter, and a blue or black oil-based pen; no electronic devices are allowed. Pick a specific exam year in "Configure exam" or the quick mock exam to practice that year\'s format. The 2022-2026 exam years split the same study question bank across several years: no university publishes the real wording of its exams, so this is practice material, not the exact questions from any given year.',
    },
    footer:
      "Your account and score history are saved securely in your profile, so they're available on any device you sign in from. Your theme and language preferences are saved only in this browser.",
    seccionUsarApp: 'Using the app',
    seccionAtencionCliente: 'Customer support',
    escribirSoporteTitulo: 'Contact support',
    escribirSoporteTexto: "Tell us what happened and we'll reply right here.",
    misConsultasTitulo: 'My requests',
    misConsultasResumen: (total, sinLeer) => {
      if (total === 0) return "You haven't contacted support yet"
      if (sinLeer === 0) return `${total} conversation${total === 1 ? '' : 's'}`
      return `${total} conversation${total === 1 ? '' : 's'} · ${sinLeer} unread`
    },
    proximamente: 'Coming soon',
  },
  reportarPregunta: {
    abrir: 'Report this question',
    titulo: 'Report this question',
    subtitulo: "What's wrong?",
    motivos: {
      respuesta_incorrecta: "The answer marked as correct isn't",
      opcion_ambigua_o_duplicada: 'An option is ambiguous or duplicated',
      texto_con_error: 'The question or an option has a text error',
      otro: 'Something else',
    },
    comentarioPlaceholder: 'Tell us more (optional)',
    enviar: 'Send report',
    exito: "Thanks, we'll take a look.",
    listo: 'Done',
    error: "Couldn't send it. Please try again.",
  },
  soporte: {
    tituloLista: 'My requests',
    subtituloLista: 'Your conversations with support',
    nuevaConsulta: 'New request',
    vacioTitulo: "You haven't contacted support yet",
    vacioTexto: "When you have a question or an issue, write to us and we'll reply here.",
    estado: {
      abierto: 'Open',
      en_progreso: 'In progress',
      resuelto: 'Resolved',
      cerrado: 'Closed',
    },
    motivo: {
      cuenta: 'My account or profile',
      pagos: 'Payments and subscription',
      otro: 'Something else',
    },
    preguntaChip: (numero) => `Question No. ${numero}`,
    nuevoTitulo: 'New request',
    nuevoSubtitulo: "Pick a reason and tell us what you need",
    asuntoLabel: 'Subject',
    asuntoPlaceholder: 'Summarize your request in a few words',
    mensajeLabel: 'Tell us more',
    mensajePlaceholder: 'Give us as much detail as you can…',
    enviar: 'Send',
    enviando: 'Sending…',
    error: "Couldn't send it. Please try again.",
    camposRequeridos: 'Fill in the subject and the message.',
    escribirPlaceholder: 'Write a message…',
    reabreAviso: "This request is resolved — sending a message will reopen it automatically.",
    soporteAutor: 'Support',
    vos: 'You',
  },
  nav: {
    home: 'Home',
    academia: 'Academy',
    ayuda: 'Help',
    config: 'Settings',
    simulacro: 'Mock exam',
  },
  academia: {
    titulo: 'Academy',
    bienvenidaTitulo: 'Welcome to the Academy',
    bienvenidaTexto: "This is going to be your space to learn: you'll find classes and study content here soon.",
    proximamente: 'Content coming soon',
  },
  config: {
    titulo: 'Settings',
    cuenta: 'Your account',
    preferencias: 'Preferences',
  },
  asignaturas: {
    titulo: 'What are you testing on?',
    subtitulo: 'Choose a subject to set up your mock exam.',
  },
  estadisticas: {
    titulo: 'Statistics',
    general: 'Overall',
    promedioGeneral: 'Overall average',
    intentos: (n) => `${n} mock exam${n === 1 ? '' : 's'} taken`,
    actividadSemanal: "This week's activity",
    porCapitulo: 'By chapter',
    porAsignatura: 'By subject',
    puntoDebil: 'Weak spot',
    sinDatosTitulo: 'No data yet',
    sinDatosTexto: 'Complete your first mock exam to see your statistics here.',
  },
}

export function getDiccionario(idioma: Idioma): Diccionario {
  return idioma === 'en' ? en : es
}
