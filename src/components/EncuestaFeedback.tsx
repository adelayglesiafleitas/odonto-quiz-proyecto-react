// src/components/EncuestaFeedback.tsx
//
// ENCUESTA-TEMPORAL — Ventana "Ayúdanos a mejorar" (4 preguntas). Diseño
// aprobado: claude/encuesta-feedback-diseno.md (mockup en el canvas
// "Encuesta Ayúdanos a mejorar").
//
// Modal centrado en todos los tamaños (también en móvil), con márgenes de
// 20px laterales / 24px arriba y abajo, y max-h + scroll de toda la
// ventana en teléfonos bajos. Toma todo el color del estilo activo:
// - cabecera: `.brand-gradient` (igual que Login/Splash/Tour),
// - tarjeta, botones y opciones: tokens semánticos (bg-card, bg-primary…),
// - borde y sombra: `--home-hero-border` / `--home-hero-shadow`, que ya dan
//   el look "sticker" de Rock Pop y el brillo de Neón/Eléctrico sin código
//   por estilo.
//
// Guarda en cada paso (guardarEncuesta hace upsert), así que si alguien
// cierra a la mitad, lo contestado ya está en la base. Cerrar con la ✕ la
// marca como cerrada: no se vuelve a mostrar (regla: una sola vez).
//
// Los textos viven aquí (ES/EN) y no en i18n.ts a propósito: al retirar la
// encuesta se borra este archivo y no quedan claves sueltas en el
// diccionario.

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import type { Idioma } from '@/lib/i18n'
import { guardarEncuesta, registrarEncuestaMostrada, type CanalEncuesta } from '@/lib/encuestaRemoto'

const MAX_TEXTO = 300
const MAX_OTRO = 80

const TEXTOS = {
  es: {
    titulo: 'Ayúdanos a mejorar',
    subtitulo: 'Son 4 preguntas y menos de un minuto. Tu opinión decide qué cambiamos primero.',
    progreso: (n: number) => `Pregunta ${n} de 4`,
    cerrar: 'Cerrar encuesta',
    p1: 'Del 0 al 10, ¿recomendarías la app a un compañero?',
    p1Min: '0 · Nada probable',
    p1Max: '10 · Seguro que sí',
    p2: '¿Cómo conociste la app?',
    p2Ayuda: 'Puedes marcar varias opciones',
    p2OtroLabel: '¿Dónde nos conociste?',
    p2OtroPh: 'Escríbelo aquí',
    p3: '¿Qué función te gustaría que añadiéramos?',
    p3Ph: 'Cuéntanos tu idea',
    p4: 'Si pudieras cambiar una sola cosa de la app, ¿cuál sería?',
    p4Ph: 'Lo que más te molesta o echas en falta',
    opcional: 'Opcional',
    atras: 'Atrás',
    siguiente: 'Siguiente',
    omitir: 'Omitir',
    saltar: 'Saltar pregunta',
    enviar: 'Enviar',
    enviarVacio: 'Enviar sin responder',
    gracias: '¡Gracias!',
    graciasTexto: 'Leemos todas las respuestas. Nos ayudas a decidir qué mejorar primero.',
    volver: 'Volver al inicio',
    canales: {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      google: 'Google',
      whatsapp: 'Grupo de WhatsApp',
      telegram: 'Telegram',
      companero: 'Un compañero',
      academia: 'Una academia',
      otro: 'Otro',
    } as Record<CanalEncuesta, string>,
  },
  en: {
    titulo: 'Help us improve',
    subtitulo: '4 questions, less than a minute. Your answers decide what we change first.',
    progreso: (n: number) => `Question ${n} of 4`,
    cerrar: 'Close survey',
    p1: 'From 0 to 10, would you recommend the app to a classmate?',
    p1Min: '0 · Not likely',
    p1Max: '10 · Definitely',
    p2: 'How did you hear about the app?',
    p2Ayuda: 'You can pick more than one',
    p2OtroLabel: 'Where did you hear about us?',
    p2OtroPh: 'Type it here',
    p3: 'What feature would you like us to add?',
    p3Ph: 'Tell us your idea',
    p4: 'If you could change one thing about the app, what would it be?',
    p4Ph: 'What bothers you most or what you miss',
    opcional: 'Optional',
    atras: 'Back',
    siguiente: 'Next',
    omitir: 'Skip',
    saltar: 'Skip question',
    enviar: 'Send',
    enviarVacio: 'Send without answering',
    gracias: 'Thank you!',
    graciasTexto: 'We read every answer. You help us decide what to improve first.',
    volver: 'Back to home',
    canales: {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      google: 'Google',
      whatsapp: 'WhatsApp group',
      telegram: 'Telegram',
      companero: 'A classmate',
      academia: 'An academy',
      otro: 'Other',
    } as Record<CanalEncuesta, string>,
  },
}

const CANALES: CanalEncuesta[] = ['instagram', 'tiktok', 'google', 'whatsapp', 'telegram', 'companero', 'academia', 'otro']

type Paso = 1 | 2 | 3 | 4 | 5

export function EncuestaFeedback({ userId, idioma, onCerrar }: { userId: string; idioma: Idioma; onCerrar: () => void }) {
  const tx = TEXTOS[idioma] ?? TEXTOS.es
  const [paso, setPaso] = useState<Paso>(1)
  const [nps, setNps] = useState<number | null>(null)
  const [canales, setCanales] = useState<CanalEncuesta[]>([])
  const [canalOtro, setCanalOtro] = useState('')
  const [funcion, setFuncion] = useState('')
  const [cambio, setCambio] = useState('')
  const cuerpoRef = useRef<HTMLDivElement>(null)

  // La fila se crea al abrirse: desde aquí cuenta como "vista".
  useEffect(() => {
    registrarEncuestaMostrada(userId)
  }, [userId])

  // Al cambiar de pregunta, volver arriba (en teléfonos bajos toda la
  // ventana, cabecera incluida, tiene scroll interno: así la cabecera no se
  // come el espacio de las opciones).
  useEffect(() => {
    cuerpoRef.current?.scrollTo({ top: 0 })
  }, [paso])

  const cerrarConX = () => {
    if (paso < 5) guardarEncuesta(userId, { cerrada_con_x: true })
    onCerrar()
  }

  useEffect(() => {
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrarConX()
    }
    document.addEventListener('keydown', alEscape)
    return () => document.removeEventListener('keydown', alEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso])

  const limpio = (s: string) => (s.trim() ? s.trim() : null)

  const siguiente = () => {
    if (paso === 1) {
      if (nps === null) return
      guardarEncuesta(userId, { nps, ultimo_paso: 1 })
      setPaso(2)
    } else if (paso === 2) {
      if (canales.length === 0) return
      guardarEncuesta(userId, {
        canales,
        canal_otro: canales.includes('otro') ? limpio(canalOtro) : null,
        ultimo_paso: 2,
      })
      setPaso(3)
    } else if (paso === 3) {
      guardarEncuesta(userId, { funcion: limpio(funcion), ultimo_paso: 3 })
      setPaso(4)
    } else if (paso === 4) {
      guardarEncuesta(userId, { cambio: limpio(cambio), ultimo_paso: 4, completada: true })
      setPaso(5)
    }
  }

  // Preguntas 1 y 2 son obligatorias para "Siguiente"; "Saltar" pasa a la
  // siguiente sin guardar respuesta (solo avanza ultimo_paso).
  const saltar = () => {
    if (paso === 1 || paso === 2) {
      guardarEncuesta(userId, { ultimo_paso: paso })
      setPaso((paso + 1) as Paso)
    }
  }

  const atras = () => {
    if (paso > 1 && paso < 5) setPaso((paso - 1) as Paso)
  }

  const alternarCanal = (c: CanalEncuesta) =>
    setCanales((actual) => (actual.includes(c) ? actual.filter((x) => x !== c) : [...actual, c]))

  const deshabilitado = (paso === 1 && nps === null) || (paso === 2 && canales.length === 0)
  const etiquetaSiguiente =
    paso === 3
      ? funcion.trim()
        ? tx.siguiente
        : tx.omitir
      : paso === 4
        ? cambio.trim()
          ? tx.enviar
          : tx.enviarVacio
        : tx.siguiente

  const opcionBase =
    'rounded-2xl border-2 font-bold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const campoTexto =
    'w-full rounded-2xl border-2 border-border bg-muted px-3.5 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="encuesta-titulo"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 py-6 duration-200"
    >
      <div
        ref={cuerpoRef}
        className="animate-in fade-in zoom-in-95 flex max-h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-3xl bg-card text-foreground duration-300"
        style={{ border: '2px solid var(--home-hero-border)', boxShadow: 'var(--home-hero-shadow)' }}
      >
        <div className="brand-gradient shrink-0 px-5 pb-4 pt-4 text-white">
          <div className="flex items-center justify-between">
            <LogoMark className="h-9 w-auto" variante="oscuro" />
            <button
              type="button"
              onClick={cerrarConX}
              aria-label={tx.cerrar}
              className="-mr-2.5 flex h-11 w-11 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 id="encuesta-titulo" className="mt-2 text-[21px] font-extrabold tracking-tight">
            {tx.titulo}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-white/80">{tx.subtitulo}</p>
          {paso <= 4 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">{tx.progreso(paso)}</p>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-[5px] rounded-full ${n <= paso ? 'bg-white' : 'bg-white/25'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          {paso === 1 && (
            <div className="flex flex-col gap-3.5">
              <p className="text-base font-bold leading-snug">{tx.p1}</p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 11 }, (_, v) => {
                  const sel = nps === v
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => setNps(v)}
                      className={`${opcionBase} h-12 text-base ${
                        sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-foreground'
                      }`}
                    >
                      {v}
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{tx.p1Min}</span>
                <span>{tx.p1Max}</span>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-3.5">
              <div>
                <p className="text-base font-bold leading-snug">{tx.p2}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{tx.p2Ayuda}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CANALES.map((c) => {
                  const sel = canales.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => alternarCanal(c)}
                      className={`${opcionBase} flex min-h-12 items-center gap-2.5 px-3 py-2 text-left text-sm ${
                        sel ? 'border-primary bg-primary/10' : 'border-border bg-card'
                      }`}
                    >
                      <span
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 ${
                          sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}
                      >
                        {sel && <Check className="h-3 w-3" strokeWidth={3.5} />}
                      </span>
                      <span>{tx.canales[c]}</span>
                    </button>
                  )
                })}
              </div>
              {canales.includes('otro') && (
                <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
                  {tx.p2OtroLabel}
                  <input
                    type="text"
                    value={canalOtro}
                    maxLength={MAX_OTRO}
                    onChange={(e) => setCanalOtro(e.target.value)}
                    placeholder={tx.p2OtroPh}
                    className={`${campoTexto} h-12 py-0`}
                  />
                </label>
              )}
            </div>
          )}

          {(paso === 3 || paso === 4) && (
            <label className="flex flex-col gap-2.5">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-base font-bold leading-snug">{paso === 3 ? tx.p3 : tx.p4}</span>
                <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{tx.opcional}</span>
              </span>
              <textarea
                rows={4}
                maxLength={MAX_TEXTO}
                value={paso === 3 ? funcion : cambio}
                onChange={(e) => (paso === 3 ? setFuncion(e.target.value) : setCambio(e.target.value))}
                placeholder={paso === 3 ? tx.p3Ph : tx.p4Ph}
                className={`${campoTexto} resize-none`}
              />
              <span className="self-end text-[11px] font-semibold text-muted-foreground">
                {(paso === 3 ? funcion : cambio).length}/{MAX_TEXTO}
              </span>
            </label>
          )}

          {paso <= 4 && (
            <div className="flex gap-2.5 pt-1">
              {paso > 1 && (
                <button
                  type="button"
                  onClick={atras}
                  className="h-12 rounded-2xl border-2 border-border px-4 text-[15px] font-bold text-foreground transition active:scale-[0.97]"
                >
                  {tx.atras}
                </button>
              )}
              <button
                type="button"
                onClick={siguiente}
                disabled={deshabilitado}
                className="h-12 flex-1 rounded-2xl bg-primary text-[15px] font-extrabold text-primary-foreground transition active:scale-[0.98] disabled:opacity-40"
              >
                {etiquetaSiguiente}
              </button>
            </div>
          )}

          {(paso === 1 || paso === 2) && (
            <button
              type="button"
              onClick={saltar}
              className="-mt-1 h-11 self-center rounded-xl px-4 text-[14px] font-bold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              {tx.saltar}
            </button>
          )}

          {paso === 5 && (
            <div className="flex flex-col items-center gap-2.5 py-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Check className="h-7 w-7" strokeWidth={2.6} />
              </span>
              <p className="text-[19px] font-extrabold">{tx.gracias}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{tx.graciasTexto}</p>
              <button
                type="button"
                onClick={onCerrar}
                className="mt-2 h-12 w-full rounded-2xl bg-primary text-[15px] font-extrabold text-primary-foreground transition active:scale-[0.98]"
              >
                {tx.volver}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
