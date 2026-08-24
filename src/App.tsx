import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import type { Pantalla, Pregunta } from '@/types'
import { cargarBanco, seleccionarPreguntas } from '@/lib/data'
import { CURSO, CURSO_ID } from '@/lib/cursos'
import { supabase } from '@/lib/supabase'
import { verificarDispositivo, cerrarSesionOtrosDispositivos, liberarDispositivoActual } from '@/lib/dispositivos'
import { RUTA, RUTA_SOPORTE, RUTA_SOPORTE_DETALLE } from '@/lib/rutas'
import { LoadingScreen } from '@/components/LoadingScreen'
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
const Academia = lazy(() => import('@/screens/Academia').then((m) => ({ default: m.Academia })))
const Configuracion = lazy(() => import('@/screens/Configuracion').then((m) => ({ default: m.Configuracion })))
const Estadisticas = lazy(() => import('@/screens/Estadisticas').then((m) => ({ default: m.Estadisticas })))
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
  const [session, setSession] = useState<Session | null>(null)
  const [sesionLista, setSesionLista] = useState(false)
  const [tiempoMinimoListo, setTiempoMinimoListo] = useState(false)
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })
  const [verifDispositivo, setVerifDispositivo] = useState<'pendiente' | 'ok' | 'bloqueado'>('pendiente')
  const [dispositivosActivos, setDispositivosActivos] = useState(0)
  // Por ahora hay un solo banco de preguntas (CURSO_ID), así que esto no
  // filtra nada todavía; queda listo para cuando haya más de una asignatura.
  const [, setAsignaturaId] = useState<string | null>(null)

  useEffect(() => {
    // Se dispara en paralelo a la pantalla de carga inicial, así que para
    // cuando se necesita ya está resuelto en la mayoría de los casos.
    cargarBanco()
    supabase.auth.getSession().then(({ data }) => {
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
      cargarBanco().then(() => navigate(RUTA.home, { replace: true }))
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
    setSesionExamen({ preguntas: seleccionarPreguntas(cantidad, capitulos, anio), capitulos, anio, tiempoLimiteMinutos })
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

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background font-sans">
      <Suspense fallback={<LoadingScreen />}>
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
                <Login onLogin={() => cargarBanco().then(() => navigate(RUTA.home, { replace: true }))} />
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
                <ElegirAsignatura
                  onSeleccionar={(id) => {
                    setAsignaturaId(id)
                    navigate(RUTA.configurar)
                  }}
                  onNavigate={irA}
                />
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
                    cursoId={CURSO_ID}
                    cursoMeta={CURSO}
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
                    cursoId={CURSO_ID}
                    preguntas={sesionExamen.preguntas}
                    respuestas={resultado.respuestas}
                    capitulos={sesionExamen.capitulos}
                    anio={sesionExamen.anio}
                    umbralAprobado={CURSO.porcentajeAprobado}
                    mostrarConvocatoria={CURSO.tieneConvocatorias}
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
                  <Estadisticas userId={userId} cursoId={CURSO_ID} onBack={() => navigate(RUTA.home)} onNavigate={irA} />
                )}
              </Protegida>
            }
          />

          <Route
            path={RUTA.ayuda}
            element={<Ayuda umbralAprobado={CURSO.porcentajeAprobado} userId={userId} onNavigate={irA} />}
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
                <Academia onNavigate={irA} />
              </Protegida>
            }
          />

          <Route
            path={RUTA.config}
            element={
              <Protegida sesionLista={sesionLista} autenticado={autenticado}>
                <Configuracion nickname={nickname} onNavigate={irA} onLogout={irALogin} />
              </Protegida>
            }
          />

          <Route path="*" element={<Navigate to={RUTA.splash} replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
