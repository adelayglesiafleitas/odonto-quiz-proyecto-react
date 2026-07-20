import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Pantalla, Pregunta } from '@/types'
import { seleccionarPreguntas } from '@/lib/data'
import { getCursoMeta, getCursosActivos, type CursoId } from '@/lib/cursos'
import { supabase } from '@/lib/supabase'
import { verificarDispositivo, cerrarSesionOtrosDispositivos, liberarDispositivoActual } from '@/lib/dispositivos'
import { Splash } from '@/screens/Splash'
import { DispositivoBloqueado } from '@/screens/DispositivoBloqueado'
import { Login } from '@/screens/Login'
import { SeleccionCurso } from '@/screens/SeleccionCurso'
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
  const [cursoActivo, setCursoActivo] = useState<CursoId | null>(null)
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })
  const [verifDispositivo, setVerifDispositivo] = useState<'pendiente' | 'ok' | 'bloqueado'>('pendiente')
  const [dispositivosActivos, setDispositivosActivos] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSesionLista(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null
  const autenticado = !!session
  const cursoMeta = cursoActivo ? getCursoMeta(cursoActivo) : null

  useEffect(() => {
    if (!userId) {
      setVerifDispositivo('pendiente')
      return
    }
    let cancelado = false
    verificarDispositivo(userId).then((resultado) => {
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

  function entrarTrasAutenticar() {
    const activos = getCursosActivos()
    if (activos.length === 1) {
      setCursoActivo(activos[0].id)
      setPantalla('home')
    } else {
      setPantalla('seleccionCurso')
    }
  }

  function terminarSplash() {
    if (sesionLista && autenticado) {
      entrarTrasAutenticar()
    } else {
      setPantalla('login')
    }
  }

  async function irALogin() {
    if (userId) {
      await liberarDispositivoActual(userId)
    }
    await supabase.auth.signOut()
    setCursoActivo(null)
    setVerifDispositivo('pendiente')
    setPantalla('login')
  }

  async function continuarEnEsteDispositivo() {
    if (!userId) return
    await cerrarSesionOtrosDispositivos(userId)
    setVerifDispositivo('ok')
  }

  function iniciarExamen(cantidad: number, capitulo: string, tiempoLimiteMinutos: number | null, anio: number | 'todos') {
    if (!cursoActivo) return
    setSesionExamen({ preguntas: seleccionarPreguntas(cursoActivo, cantidad, capitulo, anio), capitulo, anio, tiempoLimiteMinutos })
    setPantalla('examen')
  }

  function iniciarSimulacroRapido(tiempoLimiteMinutos: number | null, anio: number | 'todos') {
    if (!cursoActivo) return
    const meta = getCursoMeta(cursoActivo)
    iniciarExamen(meta.cantidadOficial, 'todos', tiempoLimiteMinutos, anio)
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
      {pantalla === 'splash' && <Splash onFinish={terminarSplash} />}

      {pantalla === 'login' && <Login onLogin={entrarTrasAutenticar} />}

      {pantalla === 'seleccionCurso' && autenticado && (
        <SeleccionCurso
          onSeleccionar={(id) => {
            setCursoActivo(id)
            setPantalla('home')
          }}
          onLogout={irALogin}
        />
      )}

      {pantalla === 'home' && autenticado && userId && cursoActivo && cursoMeta && (
        <Home
          userId={userId}
          cursoId={cursoActivo}
          cursoMeta={cursoMeta}
          onNavigate={setPantalla}
          onIniciarSimulacro={iniciarSimulacroRapido}
          onCambiarCurso={() => setPantalla('seleccionCurso')}
          onLogout={irALogin}
        />
      )}

      {pantalla === 'configurar' && userId && cursoActivo && cursoMeta && (
        <ConfigurarExamen
          userId={userId}
          cursoId={cursoActivo}
          cursoMeta={cursoMeta}
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

      {pantalla === 'resultados' && userId && sesionExamen && cursoActivo && cursoMeta && (
        <Resultados
          userId={userId}
          cursoId={cursoActivo}
          preguntas={sesionExamen.preguntas}
          respuestas={resultado.respuestas}
          capitulo={sesionExamen.capitulo}
          anio={sesionExamen.anio}
          umbralAprobado={cursoMeta.porcentajeAprobado}
          mostrarConvocatoria={cursoMeta.tieneConvocatorias}
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

      {pantalla === 'estudio' && cursoActivo && <Estudio cursoId={cursoActivo} onBack={() => setPantalla('home')} />}

      {pantalla === 'ayuda' && cursoActivo && cursoMeta && (
        <Ayuda cursoId={cursoActivo} umbralAprobado={cursoMeta.porcentajeAprobado} onBack={() => setPantalla('home')} />
      )}
    </div>
  )
}

export default App
