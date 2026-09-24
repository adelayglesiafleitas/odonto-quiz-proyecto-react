import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useNavigationType } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import type { Pantalla, Pregunta, IntentoExamen } from '@/types'
import { cargarBanco, seleccionarPreguntas, obtenerPreguntasPorNumero } from '@/lib/data'
import { CURSO, CURSO_ID, CURSOS } from '@/lib/cursos'
import { supabase } from '@/lib/supabase'
import { verificarDispositivo, cerrarSesionOtrosDispositivos, liberarDispositivoActual } from '@/lib/dispositivos'
import { RUTA, RUTA_SOPORTE, RUTA_SOPORTE_DETALLE } from '@/lib/rutas'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAppSettings } from '@/context/AppSettings'
import { DispositivoBloqueado } from '@/screens/DispositivoBloqueado'
import { Login } from '@/screens/Login'
import type { RespuestaUsuario } from '@/screens/Examen'

// Cada pantalla se carga como su propio chunk: antes todo (Home, Academia,
// Configuración, Ayuda, el examen, etc.) vivía en un único bundle de ~512 KB
// que se descargaba entero apenas se abría la app, sin importar a qué
// pantalla fuera el usuario. Con import() dinámico, quien solo entra a
// hacer login no descarga el código de Academia ni de Configurar examen
// hasta que realmente navega ahí.

const Home = lazy(() => import('@/screens/Home').then((m) => ({ default: m.Home })))
const ElegirAsignatura = lazy(() => import('@/screens/ElegirAsignatura').then((m) => ({ default: m.ElegirAsignatura })))
const ConfigurarExamen = lazy(() => import('@/screens/ConfigurarExamen').then((m) => ({ default: m.ConfigurarExamen })))
const Examen = lazy(() => import('@/screens/Examen').then((m) => ({ default: m.Examen })))
const Resultados = lazy(() => import('@/screens/Resultados').then((m) => ({ default: m.Resultados })))
const Estudio = lazy(() => import('@/screens/Estudio').then((m) => ({ default: m.Estudio })))
const Ayuda = lazy(() => import('@/screens/Ayuda').then((m) => ({ default: m.Ayuda })))
const Comunidad = lazy(() => import('@/screens/Comunidad').then((m) => ({ default: m.Comunidad })))
const Academia = lazy(() => import('@/screens/Academia').then((m) => ({ default: m.Academia })))
const Configuracion = lazy(() => import('@/screens/Configuracion').then((m) => ({ default: m.Configuracion })))
const Estadisticas = lazy(() => import('@/screens/Estadisticas').then((m) => ({ default: m.Estadisticas })))
const Historial = lazy(() => import('@/screens/Historial').then((m) => ({ default: m.Historial })))
const MisConsultas = lazy(() => import('@/screens/MisConsultas').then((m) => ({ default: m.MisConsultas })))
const HiloConsulta = lazy(() => import('@/screens/HiloConsulta').then((m) => ({ default: m.HiloConsulta })))

interface SesionExamen {
  preguntas: Pregunta[]
  // Array vacío = todos los capítulos (antes era el string 'todos').
  capitulos: string[]
  anio: number | 'todos'
  tiempoLimiteMinutos: number | null
  // Mini-examen armado desde Resultados con las preguntas falladas de un
  // intento anterior: no representa un capítulo/año real, así que "Repetir"
  // debe volver a armar el mismo set fallado en vez de re-filtrar el banco.
  esRepaso?: boolean
}

interface ResultadoExamen {
  respuestas: RespuestaUsuario
  tiempoUsadoSeg: number
  agotoTiempo: boolean
}

// Envuelve las rutas que requieren sesión iniciada. Espera a que la sesión
// termine de resolverse antes de decidir nada: si redirigiera a /login
// apenas se monta (cuando "autenticado" todavía es false por defecto,
// mientras Supabase resuelve en segundo plano), alguien con la sesión
// guardada que entra directo a una URL como /home vería un rebote falso a
// login antes de terminar de cargar.

// Pestañas de la barra inferior: entre ellas la transición es solo fundido.
const RUTAS_PESTANA = new Set<string>([RUTA.home, RUTA.academia, RUTA.comunidad, RUTA.config])

function Protegida({
  sesionLista,
  autenticado,
  children,
}: {
  sesionLista: boolean
  autenticado: boolean
  children: ReactNode
}) {
  if (!sesionLista) return <LoadingScreen />
  if (!autenticado) return <Navigate to={RUTA.login} replace />
  return <>{children}</>
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  // Transición entre pantallas (ver index.css, "Animaciones de la app"):
  // hacia delante entra desde la derecha, al volver atrás desde la izquierda,
  // y entre pestañas de la barra de abajo solo fundido (son del mismo nivel).
  // La clase se calcula solo cuando cambia la ruta (y se guarda), para que
  // un re-render cualquiera no cambie la animación y la reinicie.
  const tipoNavegacion = useNavigationType()
  const transicionRef = useRef({ ruta: location.pathname, clase: 'pantalla-fundido' })
  if (transicionRef.current.ruta !== location.pathname) {
    const anterior = transicionRef.current.ruta
    transicionRef.current = {
      ruta: location.pathname,
      clase:
        RUTAS_PESTANA.has(anterior) && RUTAS_PESTANA.has(location.pathname)
          ? 'pantalla-fundido'
          : tipoNavegacion === 'POP'
            ? 'pantalla-atras'
            : 'pantalla-adelante',
    }
  }
  const claseTransicion = transicionRef.current.clase
  const [session, setSession] = useState<Session | null>(null)
  const [sesionLista, setSesionLista] = useState(false)
  const [tiempoMinimoListo, setTiempoMinimoListo] = useState(false)
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })
  const [verifDispositivo, setVerifDispositivo] = useState<'pendiente' | 'ok' | 'bloqueado'>('pendiente')
  const [dispositivosActivos, setDispositivosActivos] = useState(0)
  // cursoId de la asignatura elegida en ElegirAsignatura — gobierna qué
  // banco de preguntas y qué CursoMeta usan Configurar/Examen/Resultados de
  // ahí en adelante. Arranca en CURSO_ID (Odontología) por si algo navegara
  // directo a /simulacro/configurar sin pasar por ElegirAsignatura primero.
  const [cursoIdExamen, setCursoIdExamen] = useState<string>(CURSO_ID)
  // Nombre de la asignatura mientras se trae su banco desde Supabase (no
  // null = mostrar la pantalla de carga en vez de ElegirAsignatura). Ver
  // claude/preguntas-tabla-editor-admin.md — antes el banco era JSON local y
  // esto no hacía falta; ahora Ortodoncia (17k+ preguntas) puede tardar unos
  // segundos y la app no puede quedarse muda mientras tanto.
  const [cargandoAsignatura, setCargandoAsignatura] = useState<string | null>(null)
  const { t } = useAppSettings()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // El banco de preguntas vive en Supabase (antes era un JSON local que
      // no necesitaba sesión) — RLS exige un usuario autenticado para leer
      // `preguntas`, así que recién acá, con la sesión ya resuelta, tiene
      // sentido precargar el curso por defecto. Dispararlo antes, en
      // paralelo a esto (como se hacía cuando era JSON), llegaba a Supabase
      // sin sesión todavía, RLS lo rechazaba con 0 filas en silencio, y esa
      // respuesta vacía quedaba en caché para el resto de la sesión del
      // navegador.
      if (data.session) cargarBanco(CURSO_ID)
      setSession(data.session)
      setSesionLista(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // La verificación de sesión puede resolver casi al instante (sesión en
    // caché), lo que haría que la pantalla de carga apareciera y
    // desapareciera en una fracción de segundo. Este mínimo garantiza que el
    // usuario siempre alcance a verla, incluso en conexiones rápidas.
    const temporizador = setTimeout(() => setTiempoMinimoListo(true), 700)
    return () => clearTimeout(temporizador)
  }, [])

  const userId = session?.user.id ?? null
  const nickname = (session?.user.user_metadata?.nickname as string | undefined) ?? null
  const autenticado = !!session

  useEffect(() => {
    if (!userId) {
      setVerifDispositivo('pendiente')
      return
    }
    let cancelado = false
    verificarDispositivo().then((resultado) => {
      if (cancelado) return
      if (resultado.permitido) {
        setVerifDispositivo('ok')
      } else {
        setDispositivosActivos(resultado.dispositivos)
        setVerifDispositivo('bloqueado')
      }
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  // Splash ('/'): solo decide algo mientras seguimos ahí, para no interferir
  // si el usuario ya está navegando por el resto de la app.
  useEffect(() => {
    if (location.pathname !== RUTA.splash || !sesionLista || !tiempoMinimoListo) return
    if (autenticado) {
      cargarBanco(CURSO_ID).then(() => navigate(RUTA.home, { replace: true }))
    } else {
      navigate(RUTA.login, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, sesionLista, tiempoMinimoListo, autenticado])

  function irA(p: Pantalla) {
    navigate(RUTA[p])
  }

  async function irALogin() {
    if (userId) {
      await liberarDispositivoActual(userId)
    }
    await supabase.auth.signOut()
    setVerifDispositivo('pendiente')
    navigate(RUTA.login, { replace: true })
  }

  async function continuarEnEsteDispositivo() {
    if (!userId) return
    await cerrarSesionOtrosDispositivos(userId)
    setVerifDispositivo('ok')
  }

  function iniciarExamen(
    cantidad: number,
    capitulos: string[],
    tiempoLimiteMinutos: number | null,
    anio: number | 'todos',
  ) {
    setSesionExamen({
      preguntas: seleccionarPreguntas(cursoIdExamen, cantidad, capitulos, anio),
      capitulos,
      anio,
      tiempoLimiteMinutos,
    })
    navigate(RUTA.examen)
  }

  function finalizarExamen(respuestas: RespuestaUsuario, tiempoUsadoSeg: number, agotoTiempo: boolean) {
    setResultado({ respuestas, tiempoUsadoSeg, agotoTiempo })
    // replace: un examen ya entregado no debería poder "reabrirse" con el
    // botón atrás del navegador.
    navigate(RUTA.resultados, { replace: true })
  }

  function repasarFallos(preguntas: Pregunta[]) {
    setSesionExamen({ preguntas, capitulos: [], anio: 'todos', tiempoLimiteMinutos: null, esRepaso: true })
    navigate(RUTA.examen)
  }

  // "Repetir" desde el Historial (distinto del "Repetir" de Resultados, que
  // siempre re-arma al azar con la misma config): si el intento tiene
  // preguntasNumeros guardado, arma el examen con exactamente esas preguntas
  // en el mismo orden. Los intentos de antes de que existiera esa columna
  // llegan con el array vacío — para esos no hay otra opción que caer a la
  // misma config con preguntas nuevas al azar (ver Historial.tsx, que avisa
  // esto en el diálogo de confirmación).
  //
  // No se llama a iniciarExamen() acá a propósito: esa función lee
  // cursoIdExamen del estado del componente, que setCursoIdExamen recién
  // actualiza en el próximo render — llamarla en el mismo tick podría usar
  // todavía el curso anterior. Se arma la sesión directo con el cursoId del
  // intento en vez de depender de ese estado.
  //
  // Guarda en ambas ramas: si el banco actual ya no tiene ninguna pregunta
  // que encaje (capítulo renombrado, preguntas ocultadas/borradas desde el
  // admin desde que se guardó este intento), preguntas queda en [] y no se
  // navega — antes solo la rama de preguntasNumeros se cuidaba de esto; la
  // rama de abajo navegaba igual a /examen con un array vacío, y Examen.tsx
  // no tiene forma de mostrar una pregunta que no existe (revienta al leer
  // preguntas[indice]).
  async function repetirIntento(intento: IntentoExamen) {
    setCursoIdExamen(intento.cursoId)
    let preguntas: Pregunta[]
    if (intento.preguntasNumeros.length > 0) {
      preguntas = await obtenerPreguntasPorNumero(intento.cursoId, intento.preguntasNumeros)
    } else {
      await cargarBanco(intento.cursoId)
      preguntas = seleccionarPreguntas(intento.cursoId, intento.totalPreguntas, intento.capitulos, intento.anio)
    }
    if (preguntas.length === 0) return
    setSesionExamen({
      preguntas,
      capitulos: intento.capitulos,
      anio: intento.anio,
      tiempoLimiteMinutos: intento.tiempoLimiteMinutos,
    })
    navigate(RUTA.examen)
  }
  
  if (userId && verifDispositivo === 'bloqueado') {
    return (
      <div className="mx-auto min-h-screen w-full max-w-md bg-background font-sans">
        <DispositivoBloqueado
          dispositivos={dispositivosActivos}
          onContinuarAqui={continuarEnEsteDispositivo}
          onCancelar={() => {
            void irALogin()
          }}
        />
      </div>
    )
  }

  // Comunidad usa dos paneles (lista de grupos + chat) en pantalla ancha, así
  // que solo esa ruta se libera del ancho de móvil a partir de lg (1024 px).
  const anchoRuta = location.pathname === RUTA.comunidad ? 'lg:max-w-6xl' : ''


  return (
    <div className={`mx-auto min-h-screen w-full max-w-md overflow-x-clip bg-background font-sans ${anchoRuta}`}>
      <Suspense fallback={<LoadingScreen />}>
        <div key={location.pathname} className={claseTransicion}>
        <Routes>
          <Route path={RUTA.splash} element={<LoadingScreen />} />

          <Route
            path={RUTA.login}
            element={
              !sesionLista ? (
                <LoadingScreen />
              ) : autenticado ? (
                <Navigate to={RUTA.home} replace />
              ) : (
                <Login onLogin={() => cargarBanco(CURSO_ID).then(() => navigate(RUTA.home, { replace: true }))} />
              )
            }
          />

          <Route
            path={RUTA.home}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && (
                  <Home
                    userId={userId}
                    nickname={nickname}
                    cursoId={CURSO_ID}
                    cursoMeta={CURSO}
                    onNavigate={irA}
                    onLogout={irALogin}
                  />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.asignaturas}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {cargandoAsignatura ? (
                  <LoadingScreen label={t.asignaturas.cargandoBanco(cargandoAsignatura)} />
                ) : (
                  <ElegirAsignatura
                    onSeleccionar={(cursoId, nombre) => {
                      setCursoIdExamen(cursoId)
                      // Muestra la pantalla de carga de inmediato (en vez de
                      // navegar recién cuando cargarBanco resuelve) — si no,
                      // la primera vez que se elige una asignatura nueva
                      // (banco todavía no pedido) la app parece no responder
                      // mientras espera a Supabase, sobre todo con Ortodoncia
                      // (17k+ preguntas).
                      setCargandoAsignatura(nombre)
                      cargarBanco(cursoId).then(() => {
                        navigate(RUTA.configurar)
                        setCargandoAsignatura(null)
                      })
                    }}
                    onNavigate={irA}
                  />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.configurar}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && (
                  <ConfigurarExamen
                    userId={userId}
                    cursoId={cursoIdExamen}
                    cursoMeta={CURSOS[cursoIdExamen]}
                    onBack={() => navigate(RUTA.asignaturas)}
                    onNavigate={irA}
                    onIniciar={iniciarExamen}
                  />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.examen}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && sesionExamen ? (
                  <Examen
                    userId={userId}
                    preguntas={sesionExamen.preguntas}
                    tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
                    onCancelar={() => navigate(RUTA.home)}
                    onFinalizar={finalizarExamen}
                  />
                ) : (
                  <Navigate to={RUTA.home} replace />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.resultados}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && sesionExamen ? (
                  <Resultados
                    userId={userId}
                    cursoId={cursoIdExamen}
                    preguntas={sesionExamen.preguntas}
                    respuestas={resultado.respuestas}
                    capitulos={sesionExamen.capitulos}
                    anio={sesionExamen.anio}
                    umbralAprobado={CURSOS[cursoIdExamen].porcentajeAprobado}
                    mostrarConvocatoria={CURSOS[cursoIdExamen].tieneConvocatorias}
                    tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
                    tiempoUsadoSeg={resultado.tiempoUsadoSeg}
                    agotoTiempo={resultado.agotoTiempo}
                    esRepaso={sesionExamen.esRepaso ?? false}
                    onNavigate={irA}
                    onRepasarFallos={repasarFallos}
                    onRepetir={() => {
                      if (sesionExamen.esRepaso) {
                        repasarFallos(sesionExamen.preguntas)
                      } else {
                        iniciarExamen(
                          sesionExamen.preguntas.length,
                          sesionExamen.capitulos,
                          sesionExamen.tiempoLimiteMinutos,
                          sesionExamen.anio,
                        )
                      }
                    }}
                    onInicio={() => navigate(RUTA.home)}
                  />
                ) : (
                  <Navigate to={RUTA.home} replace />
                )}
              </Protegida>
            }
          />

          <Route path={RUTA.estudio} element={<Estudio onBack={() => navigate(RUTA.home)} onNavigate={irA} />} />

          <Route
            path={RUTA.estadisticas}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && (
                  <Estadisticas userId={userId} cursoIdInicial={CURSO_ID} onBack={() => navigate(RUTA.home)} onNavigate={irA} />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.historial}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && (
                  <Historial userId={userId} onBack={() => navigate(RUTA.estadisticas)} onNavigate={irA} onRepetir={repetirIntento} />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.ayuda}
            element={<Ayuda umbralAprobado={CURSO.porcentajeAprobado} userId={userId} onNavigate={irA} />}
          />

          <Route
            path={RUTA.comunidad}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && <Comunidad userId={userId} onNavigate={irA} />}
              </Protegida>
            }
          />

          <Route
            path={RUTA_SOPORTE}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && <MisConsultas userId={userId} onNavigate={irA} />}
              </Protegida>
            }
          />

          <Route
            path={RUTA_SOPORTE_DETALLE}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && <HiloConsulta userId={userId} />}
              </Protegida>
            }
          />

          <Route
            path={RUTA.academia}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                {userId && <Academia userId={userId} onNavigate={irA} />}
              </Protegida>
            }
          />

          <Route
            path={RUTA.config}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                <Configuracion nickname={nickname} userId={userId} onNavigate={irA} onLogout={irALogin} />
              </Protegida>
            }
          />

          <Route path="*" element={<Navigate to={RUTA.splash} replace />} />
        </Routes>
        </div>
      </Suspense>
    </div>
  )
}

export default App
