import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getDiccionario, type Idioma, type Diccionario } from '@/lib/i18n'
import { getTemaGuardado, guardarTema, getIdiomaGuardado, guardarIdioma, type Tema } from '@/lib/settings'
import { Moon, Sun } from 'lucide-react'

interface AppSettingsValue {
  tema: Tema
  idioma: Idioma
  t: Diccionario
  toggleTema: () => void
  setIdioma: (idioma: Idioma) => void
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

  return (
    <AppSettingsContext.Provider value={{ tema, idioma, t, toggleTema, setIdioma }}>
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
