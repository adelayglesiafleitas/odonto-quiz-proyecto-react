import { useState } from 'react'
import type { Pantalla, Pregunta } from '@/types'
import { seleccionarPreguntas } from '@/lib/data'
import { getCursoMeta, getCursosActivos, type CursoId } from '@/lib/cursos'
import { Splash } from '@/screens/Splash'
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
  const [autenticado, setAutenticado] = useState(false)
  const [cursoActivo, setCursoActivo] = useState<CursoId | null>(null)
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })

  const cursoMeta = cursoActivo ? getCursoMeta(cursoActivo) : null

  function irALogin() {
    setAutenticado(false)
    setCursoActivo(null)
    setPantalla('login')
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

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background font-sans">
      {pantalla === 'splash' && <Splash onFinish={() => setPantalla('login')} />}

      {pantalla === 'login' && (
        <Login
          onLogin={() => {
            setAutenticado(true)
            const activos = getCursosActivos()
            if (activos.length === 1) {
              setCursoActivo(activos[0].id)
              setPantalla('home')
            } else {
              setPantalla('seleccionCurso')
            }
          }}
        />
      )}

      {pantalla === 'seleccionCurso' && autenticado && (
        <SeleccionCurso
          onSeleccionar={(id) => {
            setCursoActivo(id)
            setPantalla('home')
          }}
          onLogout={irALogin}
        />
      )}

      {pantalla === 'home' && autenticado && cursoActivo && cursoMeta && (
        <Home
          cursoId={cursoActivo}
          cursoMeta={cursoMeta}
          onNavigate={setPantalla}
          onIniciarSimulacro={iniciarSimulacroRapido}
          onCambiarCurso={() => setPantalla('seleccionCurso')}
          onLogout={irALogin}
        />
      )}

      {pantalla === 'configurar' && cursoActivo && cursoMeta && (
        <ConfigurarExamen cursoId={cursoActivo} cursoMeta={cursoMeta} onBack={() => setPantalla('home')} onIniciar={iniciarExamen} />
      )}

      {pantalla === 'examen' && sesionExamen && (
        <Examen
          preguntas={sesionExamen.preguntas}
          tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
          onCancelar={() => setPantalla('home')}
          onFinalizar={finalizarExamen}
        />
      )}

      {pantalla === 'resultados' && sesionExamen && cursoActivo && cursoMeta && (
        <Resultados
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
