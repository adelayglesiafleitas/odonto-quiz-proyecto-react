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
  home: {
    hola: string
    estudiante: string
    progreso: string
    promedioSufijo: (n: number) => string
    mejorPuntaje: string
    meta: string
    empezar: string
    cerrarSesion: string
    simulacroTitulo: string
    simulacroDesc: string
    configurarTitulo: string
    configurarDesc: string
    estudioTitulo: string
    estudioDesc: string
    ayudaTitulo: string
    ayudaDesc: string
  }
  configurar: {
    titulo: string
    cantidadPreguntas: string
    conLimite: string
    sinTiempo: string
    conTiempo: string
    duracion: string
    capitulo: string
    todosCapitulos: string
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
    puntuacionTexto: string
    estudioTitulo: string
    estudioTexto: string
    footer: string
  }
}

export const es: Diccionario = {
  comun: {
    nombreApp: 'OdontoPrep',
    tagline: 'Simulacros de examen · Pacientes Especiales',
    tema: 'Tema',
    modoOscuro: 'Oscuro',
    modoClaro: 'Claro',
    idioma: 'Idioma',
    bienvenidoOscuro: 'Bienvenido al lado oscuro',
    bienvenidoClaro: 'Bienvenido a la luz',
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
  home: {
    hola: 'Hola,',
    estudiante: 'Estudiante',
    progreso: 'Tu progreso general',
    promedioSufijo: (n) => `promedio en ${n} simulacro${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'mejor puntaje',
    meta: 'Meta: 70%',
    empezar: 'Empezar',
    cerrarSesion: 'Cerrar sesión',
    simulacroTitulo: 'Simulacro de examen',
    simulacroDesc: '30 preguntas aleatorias · 70% para aprobar',
    configurarTitulo: 'Configurar examen',
    configurarDesc: 'Elige cantidad de preguntas y capítulo',
    estudioTitulo: 'Modo estudio',
    estudioDesc: 'Repasa preguntas y respuestas por capítulo',
    ayudaTitulo: 'Ayuda',
    ayudaDesc: 'Cómo funciona la app y la puntuación',
  },
  configurar: {
    titulo: 'Configurar examen',
    cantidadPreguntas: 'Cantidad de preguntas',
    conLimite: '¿Con límite de tiempo?',
    sinTiempo: 'Sin tiempo',
    conTiempo: 'Con tiempo',
    duracion: 'Duración del examen',
    capitulo: 'Capítulo',
    todosCapitulos: 'Todos los capítulos',
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
    simulacroTexto: 'Responde 30 preguntas aleatorias tal como en el examen real. Puedes navegar entre preguntas antes de finalizar.',
    configurarTitulo: 'Configurar examen',
    configurarTexto: 'Elige cuántas preguntas quieres, si tendrá límite de tiempo y si deseas practicar un capítulo específico o todos.',
    puntuacionTitulo: 'Puntuación y aprobación',
    puntuacionTexto: 'Cada simulacro se califica sobre 100%. Necesitas 70% o más para aprobar. Tu historial se promedia automáticamente y se muestra en el inicio.',
    estudioTitulo: 'Modo estudio',
    estudioTexto: 'Repasa las preguntas sin presión: revela la respuesta correcta cuando quieras y avanza a tu ritmo por capítulo.',
    footer: 'Contenido basado en Machuca (2023) · Asignatura Pacientes Especiales. El inicio de sesión es una versión demo (usuario y contraseña: 123). Tus preferencias y puntuaciones se guardan en cookies en este navegador.',
  },
}

export const en: Diccionario = {
  comun: {
    nombreApp: 'OdontoPrep',
    tagline: 'Exam simulations · Special Needs Patients',
    tema: 'Theme',
    modoOscuro: 'Dark',
    modoClaro: 'Light',
    idioma: 'Language',
    bienvenidoOscuro: 'Welcome to the dark side',
    bienvenidoClaro: 'Welcome to the light',
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
  home: {
    hola: 'Hi,',
    estudiante: 'Student',
    progreso: 'Your overall progress',
    promedioSufijo: (n) => `average across ${n} mock exam${n === 1 ? '' : 's'}`,
    mejorPuntaje: 'best score',
    meta: 'Goal: 70%',
    empezar: 'Get started',
    cerrarSesion: 'Sign out',
    simulacroTitulo: 'Mock exam',
    simulacroDesc: '30 random questions · 70% to pass',
    configurarTitulo: 'Configure exam',
    configurarDesc: 'Choose question count and chapter',
    estudioTitulo: 'Study mode',
    estudioDesc: 'Review questions and answers by chapter',
    ayudaTitulo: 'Help',
    ayudaDesc: 'How the app and scoring work',
  },
  configurar: {
    titulo: 'Configure exam',
    cantidadPreguntas: 'Number of questions',
    conLimite: 'Time limit?',
    sinTiempo: 'No time limit',
    conTiempo: 'Timed',
    duracion: 'Exam duration',
    capitulo: 'Chapter',
    todosCapitulos: 'All chapters',
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
    simulacroTexto: 'Answer 30 random questions just like the real exam. You can navigate between questions before finishing.',
    configurarTitulo: 'Configure exam',
    configurarTexto: 'Choose how many questions you want, whether it has a time limit, and whether to practice a specific chapter or all of them.',
    puntuacionTitulo: 'Scoring and passing',
    puntuacionTexto: 'Each mock exam is scored out of 100%. You need 70% or more to pass. Your history is averaged automatically and shown on the home screen.',
    estudioTitulo: 'Study mode',
    estudioTexto: 'Review questions with no pressure: reveal the correct answer whenever you want and move at your own pace by chapter.',
    footer: 'Content based on Machuca (2023) · Special Needs Patients subject. Sign-in is a demo version (username and password: 123). Your preferences and scores are saved as cookies in this browser.',
  },
}

export function getDiccionario(idioma: Idioma): Diccionario {
  return idioma === 'en' ? en : es
}
