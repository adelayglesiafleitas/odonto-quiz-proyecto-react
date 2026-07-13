import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { getCapitulos, PREGUNTAS } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { useAppSettings } from '@/context/AppSettings'

export function Estudio({ onBack }: { onBack: () => void }) {
  const { t } = useAppSettings()
  const capitulos = useMemo(() => ['todos', ...getCapitulos()], [])
  const [capitulo, setCapitulo] = useState('todos')
  const [indice, setIndice] = useState(0)
  const [revelado, setRevelado] = useState(false)

  const preguntas = useMemo(
    () => (capitulo === 'todos' ? PREGUNTAS : PREGUNTAS.filter((p) => p.capitulo === capitulo)),
    [capitulo],
  )
  const pregunta = preguntas[Math.min(indice, preguntas.length - 1)]

  function cambiarCapitulo(cap: string) {
    setCapitulo(cap)
    setIndice(0)
    setRevelado(false)
  }

  function mover(delta: number) {
    setIndice((i) => Math.min(Math.max(i + delta, 0), preguntas.length - 1))
    setRevelado(false)
  }

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
            onClick={() => cambiarCapitulo(cap)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              capitulo === cap ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {cap === 'todos' ? t.estudio.todos : cap}
          </button>
        ))}
      </div>

      <div className="mt-5 px-6">
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {t.estudio.preguntaContador(indice + 1, preguntas.length)}
        </p>

        <button
          onClick={() => setRevelado((r) => !r)}
          className="card-elevated mt-3 flex min-h-[280px] w-full flex-col justify-center rounded-3xl bg-card p-6 text-left"
        >
          <span className="inline-block w-fit rounded-full bg-accent/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
            {pregunta.capitulo}
          </span>
          <p className="mt-4 text-[16px] font-bold leading-snug text-foreground">{pregunta.pregunta}</p>

          {!revelado ? (
            <p className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" /> {t.estudio.tocaVer}
            </p>
          ) : (
            <div className="mt-4 space-y-1.5">
              {pregunta.opciones.map((op) => (
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
          )}
        </button>

        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => mover(-1)} disabled={indice === 0} className="h-11 flex-1 rounded-xl font-bold">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t.examen.anterior}
          </Button>
          <Button
            onClick={() => mover(1)}
            disabled={indice === preguntas.length - 1}
            className="h-11 flex-1 rounded-xl bg-primary font-bold hover:bg-primary/90"
          >
            {t.examen.siguiente}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
