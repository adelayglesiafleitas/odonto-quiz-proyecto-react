import { useAppSettings } from '@/context/AppSettings'
import { Moon, Sun } from 'lucide-react'

export function SettingsToggle({ variante = 'claro' }: { variante?: 'claro' | 'oscuro' }) {
  const { tema, idioma, t, toggleTema, setIdioma } = useAppSettings()
  const sobreOscuro = variante === 'oscuro'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTema}
        aria-label={t.comun.tema}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
          sobreOscuro ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-secondary text-foreground hover:bg-secondary/70'
        }`}
      >
        {tema === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      <div
        className={`flex items-center rounded-full p-0.5 text-[11px] font-bold ${
          sobreOscuro ? 'bg-white/10' : 'bg-secondary'
        }`}
      >
        <button
          onClick={() => setIdioma('es')}
          className={`rounded-full px-2.5 py-1.5 transition ${
            idioma === 'es'
              ? sobreOscuro
                ? 'bg-white/25 text-white'
                : 'bg-primary text-primary-foreground'
              : sobreOscuro
                ? 'text-white/60'
                : 'text-muted-foreground'
          }`}
        >
          ES
        </button>
        <button
          onClick={() => setIdioma('en')}
          className={`rounded-full px-2.5 py-1.5 transition ${
            idioma === 'en'
              ? sobreOscuro
                ? 'bg-white/25 text-white'
                : 'bg-primary text-primary-foreground'
              : sobreOscuro
                ? 'text-white/60'
                : 'text-muted-foreground'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  )
}
