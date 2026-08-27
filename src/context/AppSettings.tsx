import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getDiccionario, type Idioma, type Diccionario } from '@/lib/i18n'
import {
  getTemaGuardado,
  guardarTema,
  getIdiomaGuardado,
  guardarIdioma,
  getEstiloGuardado,
  guardarEstilo,
  type Tema,
  type Estilo,
} from '@/lib/settings'

const ESTILOS_CON_CLASE: Exclude<Estilo, 'clasico'>[] = ['acqua', 'electrico', 'rockpop', 'fresita', 'galaxia']
import { Moon, Sun } from 'lucide-react'

interface AppSettingsValue {
  tema: Tema
  idioma: Idioma
  t: Diccionario
  toggleTema: () => void
  setIdioma: (idioma: Idioma) => void
  estilo: Estilo
  setEstilo: (estilo: Estilo) => void
}

const AppSettingsContext = createContext<AppSettingsValue | null>(null)

export function useAppSettings(): AppSettingsValue {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) throw new Error('useAppSettings debe usarse dentro de AppSettingsProvider')
  return ctx
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => getTemaGuardado())
  const [idioma, setIdiomaState] = useState<Idioma>(() => getIdiomaGuardado())
  const [estilo, setEstiloState] = useState<Estilo>(() => getEstiloGuardado())
  const [toast, setToast] = useState<{ visible: boolean; mensaje: string; modo: Tema }>({
    visible: false,
    mensaje: '',
    modo: 'dark',
  })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [tema])

  // El estilo (paleta/skin visual) es independiente del modo claro/oscuro:
  // se aplica como una clase `estilo-<nombre>` aparte de `dark`, para que
  // cada estilo nuevo sea solo otro bloque de variables CSS en index.css
  // (`.estilo-<nombre>` para el modo claro, `.dark.estilo-<nombre>` para el
  // oscuro). 'clasico' no necesita clase: es el look por defecto de
  // `:root`/`.dark`.
  useEffect(() => {
    const root = document.documentElement
    ESTILOS_CON_CLASE.forEach((nombre) => root.classList.remove(`estilo-${nombre}`))
    if (estilo !== 'clasico') root.classList.add(`estilo-${estilo}`)
  }, [estilo])

  const t = getDiccionario(idioma)

  function mostrarToast(mensaje: string, modo: Tema) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ visible: true, mensaje, modo })
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2400)
  }

  function toggleTema() {
    setTema((actual) => {
      const nuevo: Tema = actual === 'dark' ? 'light' : 'dark'
      guardarTema(nuevo)
      const dic = getDiccionario(idioma)
      mostrarToast(nuevo === 'dark' ? dic.comun.bienvenidoOscuro : dic.comun.bienvenidoClaro, nuevo)
      return nuevo
    })
  }

  function setIdioma(nuevoIdioma: Idioma) {
    setIdiomaState(nuevoIdioma)
    guardarIdioma(nuevoIdioma)
  }

  function setEstilo(nuevoEstilo: Estilo) {
    setEstiloState(nuevoEstilo)
    guardarEstilo(nuevoEstilo)
  }

  return (
    <AppSettingsContext.Provider value={{ tema, idioma, t, toggleTema, setIdioma, estilo, setEstilo }}>
      {children}
      <div
        className={`pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="card-elevated flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          {toast.modo === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {toast.mensaje}
        </div>
      </div>
    </AppSettingsContext.Provider>
  )
}
