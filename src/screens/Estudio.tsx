import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getCapitulos, getPreguntas } from '@/lib/data'
import { useAppSettings } from '@/context/AppSettings'

export function Estudio({ onBack }: { onBack: () => void }) {
  const { t } = useAppSettings()
  const todasPreguntas = useMemo(() => getPreguntas(), [])
  const capitulos = useMemo(() => ['todos', ...getCapitulos()], [])
  const [capitulo, setCapitulo] = useState('todos')

  const preguntas = useMemo(
    () => (capitulo === 'todos' ? todasPreguntas : todasPreguntas.filter((p) => p.capitulo === capitulo)),
    [capitulo, todasPreguntas],
  )

  return (
    <div className="app-shell bg-background pb-6 pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estudio.titulo}</h1>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
        {capitulos.map((cap) => (
          <button
            key={cap}
            onClick={() => setCapitulo(cap)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              capitulo === cap ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {cap === 'todos' ? t.estudio.todos : cap}
          </button>
        ))}
      </div>

      <p className="mt-3 px-7 text-xs font-semibold text-muted-foreground">{t.estudio.totalPreguntas(preguntas.length)}</p>

      <div className="mt-3 space-y-3 px-6">
        {preguntas.map((p) => (
          <div key={p.numero} className="card-elevated rounded-2xl bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-muted-foreground">N.º {p.numero}</span>
              {capitulo === 'todos' && (
                <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                  {p.capitulo}
                </span>
              )}
            </div>

            <p className="mt-2 text-[15px] font-bold leading-snug text-foreground">{p.pregunta}</p>

            <div className="mt-3 space-y-1.5">
              {p.opciones.map((op) => (
                <div
                  key={op.letra}
                  className={`rounded-xl px-3 py-2 text-xs font-medium ${
                    op.correcta ? 'bg-success/12 text-success' : 'text-muted-foreground'
                  }`}
                >
                  <span className="font-bold">{op.letra}.</span> {op.texto} {op.correcta ? '✓' : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
