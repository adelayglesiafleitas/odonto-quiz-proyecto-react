import { useState } from 'react'
import { Flag, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { useAppSettings } from '@/context/AppSettings'
import { reportarPregunta, type TipoFeedbackPregunta } from '@/lib/feedback'
import type { Pregunta } from '@/types'

const MOTIVOS: TipoFeedbackPregunta[] = [
  'respuesta_incorrecta',
  'opcion_ambigua_o_duplicada',
  'texto_con_error',
  'otro',
]

// Botón chico + modal de reporte, pensado para vivir tanto en Examen.tsx
// (mientras se rinde) como en Resultados.tsx (al revisar). Un solo lugar
// para el flujo entero: escribe en la tabla `feedback` con origen='pregunta'
// (ver claude/feedback-de-preguntas-diseno.md y claude/panel-revision-admin.md
// en el proyecto de Claude para el diseño completo del lado admin, todavía
// no implementado).
export function ReportarPregunta({ userId, pregunta }: { userId: string; pregunta: Pregunta }) {
  const { t } = useAppSettings()
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState<TipoFeedbackPregunta | null>(null)
  const [comentario, setComentario] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'enviado' | 'error'>('idle')

  function cerrar() {
    setAbierto(false)
    // El reset se demora un toque para no ver el formulario "vaciarse" antes
    // de que termine la animación de cierre de la modal.
    setTimeout(() => {
      setMotivo(null)
      setComentario('')
      setEstado('idle')
    }, 200)
  }

  async function enviar() {
    if (!motivo) return
    setEstado('enviando')
    const { ok } = await reportarPregunta(userId, pregunta, motivo, comentario.trim() || null)
    setEstado(ok ? 'enviado' : 'error')
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-accent"
      >
        <Flag className="h-3.5 w-3.5" />
        {t.reportarPregunta.abrir}
      </button>

      {abierto && (
        <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
            {estado === 'enviado' ? (
              <div className="flex flex-col items-center py-2 text-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
                <p className="mt-3 text-sm font-semibold text-foreground">{t.reportarPregunta.exito}</p>
                <Button className="mt-5 h-11 w-full rounded-xl" onClick={cerrar}>
                  {t.reportarPregunta.listo}
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-bold text-foreground">{t.reportarPregunta.titulo}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t.reportarPregunta.subtitulo}</p>

                <div className="mt-4 space-y-2">
                  {MOTIVOS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMotivo(m)}
                      className={`w-full rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-medium transition ${
                        motivo === m
                          ? 'border-accent bg-accent/8 text-foreground'
                          : 'border-transparent bg-secondary text-foreground'
                      }`}
                    >
                      {t.reportarPregunta.motivos[m]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder={t.reportarPregunta.comentarioPlaceholder}
                  rows={3}
                  className="mt-3 w-full resize-none rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />

                {estado === 'error' && (
                  <p className="mt-2 text-xs font-semibold text-destructive">{t.reportarPregunta.error}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={cerrar}>
                    {t.comun.cancelar}
                  </Button>
                  <Button
                    className="h-11 flex-1 rounded-xl"
                    disabled={!motivo || estado === 'enviando'}
                    onClick={enviar}
                  >
                    {estado === 'enviando' ? <Spinner className="h-4 w-4" /> : t.reportarPregunta.enviar}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
