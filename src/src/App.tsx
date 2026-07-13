import { useState } from 'react'
import type { Pantalla, Pregunta } from '@/types'
import { seleccionarPreguntas } from '@/lib/data'
import { Splash } from '@/screens/Splash'
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
  const [sesionExamen, setSesionExamen] = useState<SesionExamen | null>(null)
  const [resultado, setResultado] = useState<ResultadoExamen>({ respuestas: {}, tiempoUsadoSeg: 0, agotoTiempo: false })

  function iniciarExamen(cantidad: number, capitulo: string, tiempoLimiteMinutos: number | null) {
    setSesionExamen({ preguntas: seleccionarPreguntas(cantidad, capitulo), capitulo, tiempoLimiteMinutos })
    setPantalla('examen')
  }

  function iniciarSimulacroRapido() {
    iniciarExamen(30, 'todos', null)
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
            setPantalla('home')
          }}
        />
      )}

      {pantalla === 'home' && autenticado && (
        <Home
          onNavigate={setPantalla}
          onIniciarSimulacro={iniciarSimulacroRapido}
          onLogout={() => {
            setAutenticado(false)
            setPantalla('login')
          }}
        />
      )}

      {pantalla === 'configurar' && <ConfigurarExamen onBack={() => setPantalla('home')} onIniciar={iniciarExamen} />}

      {pantalla === 'examen' && sesionExamen && (
        <Examen
          preguntas={sesionExamen.preguntas}
          tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
          onCancelar={() => setPantalla('home')}
          onFinalizar={finalizarExamen}
        />
      )}

      {pantalla === 'resultados' && sesionExamen && (
        <Resultados
          preguntas={sesionExamen.preguntas}
          respuestas={resultado.respuestas}
          capitulo={sesionExamen.capitulo}
          tiempoLimiteMinutos={sesionExamen.tiempoLimiteMinutos}
          tiempoUsadoSeg={resultado.tiempoUsadoSeg}
          agotoTiempo={resultado.agotoTiempo}
          onRepetir={() =>
            iniciarExamen(sesionExamen.preguntas.length, sesionExamen.capitulo, sesionExamen.tiempoLimiteMinutos)
          }
          onInicio={() => setPantalla('home')}
        />
      )}

      {pantalla === 'estudio' && <Estudio onBack={() => setPantalla('home')} />}

      {pantalla === 'ayuda' && <Ayuda onBack={() => setPantalla('home')} />}
    </div>
  )
}

export default App
