import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { LogoMark } from '@/components/Logo'

interface Textos {
  titulo: string
  texto: string
  boton: string
}

interface Props {
  children: ReactNode
  textos: Textos
}

interface State {
  error: Error | null
}

// Red de seguridad para errores de render no controlados (por ejemplo, una
// pantalla que asume que siempre va a tener al menos una pregunta y en algún
// caso raro recibe un array vacío — ver el fix de repetirIntento en App.tsx).
// Sin esto, un error de este tipo deja al usuario con una pantalla en blanco
// sin ninguna forma de seguir usando la app salvo cerrarla y reabrirla.
//
// Es un componente de clase porque React solo soporta
// getDerivedStateFromError/componentDidCatch ahí — todavía no hay
// equivalente en hooks. Por eso el texto (que sí depende del idioma elegido,
// vía useAppSettings) se recibe como prop desde el wrapper funcional de más
// abajo, en vez de leerse acá adentro.
class ErrorBoundaryInterno extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Sin esto el error solo se ve en el overlay de Vite en desarrollo; en
    // producción (build) no queda rastro en ningún lado si no se loguea acá.
    console.error('Error no controlado:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-8 text-center">
          <LogoMark className="h-9 w-auto" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-lg font-extrabold text-foreground">{this.props.textos.titulo}</h1>
            <p className="max-w-xs text-sm text-muted-foreground">{this.props.textos.texto}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null })
              // Recarga completa (no navigate de react-router): un error de
              // render puede dejar estado de React inconsistente que
              // navigate() por sí solo no arregla. Volver a "/" en frío es
              // lo más confiable acá.
              window.location.assign('/')
            }}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition active:scale-[0.98]"
          >
            {this.props.textos.boton}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useAppSettings()
  const textos: Textos = { titulo: t.comun.errorTitulo, texto: t.comun.errorTexto, boton: t.comun.errorBoton }
  return <ErrorBoundaryInterno textos={textos}>{children}</ErrorBoundaryInterno>
}
