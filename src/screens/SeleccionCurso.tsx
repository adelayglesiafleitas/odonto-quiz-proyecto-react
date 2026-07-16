import { LogoMark } from '@/components/Logo'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { getCursosActivos, type CursoId } from '@/lib/cursos'
import { ChevronRight, LogOut, Stethoscope, Landmark, Car } from 'lucide-react'

const ICONOS: Record<CursoId, typeof Stethoscope> = {
  odontologia: Stethoscope,
  nacionalidad: Landmark,
  conducir: Car,
}

const TONOS: Record<CursoId, string> = {
  odontologia: 'bg-accent/12 text-accent',
  nacionalidad: 'bg-primary/10 text-primary',
  conducir: 'bg-success/12 text-success',
}

export function SeleccionCurso({
  onSeleccionar,
  onLogout,
}: {
  onSeleccionar: (cursoId: CursoId) => void
  onLogout: () => void
}) {
  const { t } = useAppSettings()

  return (
    <div className="app-shell bg-background pb-10">
      <div className="brand-gradient rounded-b-[32px] px-6 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <p className="text-[15px] font-bold">{t.comun.nombreApp}</p>
          </div>
          <div className="flex items-center gap-2">
            <SettingsToggle variante="oscuro" />
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
              aria-label={t.seleccionCurso.cerrarSesion}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-xl font-extrabold tracking-tight">{t.seleccionCurso.titulo}</h1>
          <p className="mt-1.5 text-sm text-white/70">{t.seleccionCurso.subtitulo}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-6">
        {getCursosActivos().map((curso, idx) => {
          const Icon = ICONOS[curso.id]
          const info = t.cursos[curso.id]
          return (
            <button
              key={curso.id}
              onClick={() => onSeleccionar(curso.id)}
              className="card-elevated animate-float-up flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition active:scale-[0.98]"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${TONOS[curso.id]}`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-foreground">{info.nombre}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{info.descripcion}</p>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
