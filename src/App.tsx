import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Pantalla, Pregunta } from '@/types'
import { cargarBanco, seleccionarPreguntas } from '@/lib/data'
import { CURSO, CURSO_ID } from '@/lib/cursos'
import { supabase } from '@/lib/supabase'
import { verificarDispositivo, cerrarSesionOtrosDispositivos, liberarDispositivoActual } from '@/lib/dispositivos'
import { LoadingScreen } from '@/components/LoadingScreen'
import { DispositivoBloqueado } from '@/screens/DispositivoBloqueado'
import { Login } from '@/screens/Login'
import { Home } from '@/screens/Home'
import { ConfigurarExamen } from '@/screens/ConfigurarExamen'
import { Examen, type RespuestaUsuario } from '@/screens/Examen'
import { Resultados } from '@/screens/Resultados'
import { Estudio } from '@/screens/Estudio'
import { Ayuda } from '@/screens/Ayuda'

interface SesionExamen {
  preguntas: Pregunta[]
  capitulo: string
  anio: number | 'todos'
  tiempoLimiteMinutos: number | null
}

interface ResultadoExamen {
  respuestas: RespuestaUsuario
  tiempoUsadoSeg: number
  agotoTiempo: boolean
}

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('splash')
  const [session, setSession] = useState<Session | null>(null)
  const [sesionLista, setSesionLista] = useState(false)
  const [tiempoMinimoListo, setTiempoMinimoListo] = useState(false)
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })
  const [verifDispositivo, setVerifDispositivo] = useState<'pendiente' | 'ok' | 'bloqueado'>('pendiente')
  const [dispositivosActivos, setDispositivosActivos] = useState(0)

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

  function terminarSplash() {
    if (sesionLista && autenticado) {
      cargarBanco().then(() => setPantalla('home'))
    } else {
      setPantalla('login')
    }
  }

  useEffect(() => {
    if (pantalla === 'splash' && sesionLista && tiempoMinimoListo) {
      terminarSplash()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionLista, tiempoMinimoListo])

  async function irALogin() {
    if (userId) {
      await liberarDispositivoActual(userId)
    }
    await supabase.auth.signOut()
    setVerifDispositivo('pendiente')
    setPantalla('login')
  }

  async function continuarEnEsteDispositivo() {
    if (!userId) return
    await cerrarSesionOtrosDispositivos(userId)
    setVerifDispositivo('ok')
  }

  function iniciarExamen(cantidad: number, capitulo: string, tiempoLimiteMinutos: number | null, anio: number | 'todos') {
    setSesionExamen({ preguntas: seleccionarPreguntas(cantidad, capitulo, anio), capitulo, anio, tiempoLimiteMinutos })
    setPantalla('examen')
  }

  function iniciarSimulacroRapido(tiempoLimiteMinutos: number | null, anio: number | 'todos') {
    iniciarExamen(CURSO.cantidadOficial, 'todos', tiempoLimiteMinutos, anio)
  }

  function finalizarExamen(respuestas: RespuestaUsuario, tiempoUsadoSeg: number, agotoTiempo: boolean) {
    setResultado({ respuestas, tiempoUsadoSeg, agotoTiempo })
    setPantalla('resultados')
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
      {pantalla === 'splash' && <LoadingScreen />}

      {pantalla === 'login' && <Login onLogin={() => cargarBanco().then(() => setPantalla('home'))} />}

      {pantalla === 'home' && autenticado && userId && (
        <Home
          userId={userId}
          nickname={nickname}
          cursoId={CURSO_ID}
          cursoMeta={CURSO}
          onNavigate={setPantalla}
          onIniciarSimulacro={iniciarSimulacroRapido}
          onLogout={irALogin}
        />
      )}

      {pantalla === 'configurar' && userId && (
        <ConfigurarExamen
          userId={userId}
          cursoId={CURSO_ID}
          cursoMeta={CURSO}
          onBack={() => setPantalla('home')}
          onIniciar={iniciarExamen}
        />
      )}

      {pantalla === 'examen' && sesionExamen && (
        <Examen
          preguntas={sesionExamen.preguntas}
          tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
          onCancelar={() => setPantalla('home')}
          onFinalizar={finalizarExamen}
        />
      )}

      {pantalla === 'resultados' && userId && sesionExamen && (
        <Resultados
          userId={userId}
          cursoId={CURSO_ID}
          preguntas={sesionExamen.preguntas}
          respuestas={resultado.respuestas}
          capitulo={sesionExamen.capitulo}
          anio={sesionExamen.anio}
          umbralAprobado={CURSO.porcentajeAprobado}
          mostrarConvocatoria={CURSO.tieneConvocatorias}
          tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
          tiempoUsadoSeg={resultado.tiempoUsadoSeg}
          agotoTiempo={resultado.agotoTiempo}
          onRepetir={() =>
            iniciarExamen(
              sesionExamen.preguntas.length,
              sesionExamen.capitulo,
              sesionExamen.tiempoLimiteMinutos,
              sesionExamen.anio,
            )
          }
          onInicio={() => setPantalla('home')}
        />
      )}

      {pantalla === 'estudio' && <Estudio onBack={() => setPantalla('home')} />}

      {pantalla === 'ayuda' && (
        <Ayuda umbralAprobado={CURSO.porcentajeAprobado} onBack={() => setPantalla('home')} />
      )}
    </div>
  )
}

export default App
