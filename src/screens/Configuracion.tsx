import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight, LifeBuoy, LogOut, Palette, Pencil, RotateCcw, User } from 'lucide-react'
import { cambiarNick, comprobarNick, obtenerAlias, type ResultadoNick } from '@/lib/comunidad'
import { RUTA } from '@/lib/rutas'
import { useSoporteNoLeidos } from '@/lib/tickets'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import { ModalConfirmacion } from '@/components/ModalConfirmacion'
import { eliminarHistorialPropio } from '@/lib/historial'
import { borrarProgresoAcademiaRemoto } from '@/lib/academiaProgresoRemoto'
import { getAcademiaHabilitada } from '@/lib/academiaAccesoRemoto'
import type { Pantalla } from '@/types'

/** Fila con lápiz: muestra un nick y lo edita en el mismo sitio. `guardar` devuelve un mensaje de error o null. */
function NickEditable({
  etiqueta,
  valor,
  ayuda,
  idioma,
  minimo,
  maximo,
  patron,
  verificar,
  guardar,
}: {
  etiqueta: string
  valor: string
  ayuda?: string
  idioma: string
  minimo: number
  maximo: number
  patron?: RegExp
  /** Comprobación en vivo (disponibilidad); null = sin problema. */
  verificar?: (nuevo: string) => Promise<string | null>
  guardar: (nuevo: string) => Promise<string | null>
}) {
  const en = idioma === 'en'
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(valor)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [hecho, setHecho] = useState(false)
  const [libre, setLibre] = useState<'?' | 'ok' | string>('?')
  const t = texto.trim()
  const formatoOk = t.length >= minimo && t.length <= maximo && (!patron || patron.test(t)) && t !== valor
  const valido = formatoOk && (!verificar || libre === 'ok')

  // Comprueba en vivo (con una pequeña espera) que el nick no esté repetido.
  useEffect(() => {
    if (!editando || !verificar || !formatoOk) {
      setLibre('?')
      return
    }
    setLibre('?')
    let cancelado = false
    const id = setTimeout(async () => {
      const e = await verificar(t)
      if (!cancelado) setLibre(e ?? 'ok')
    }, 400)
    return () => {
      cancelado = true
      clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, editando, formatoOk])

  async function ok() {
    if (!valido) return
    setGuardando(true)
    setError(null)
    const e = await guardar(t)
    setGuardando(false)
    if (e) return setError(e)
    setEditando(false)
    setHecho(true)
    setTimeout(() => setHecho(false), 2500)
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{etiqueta}</p>
          <p className="truncate text-[15px] font-bold text-foreground">
            {valor}
            {hecho && <span className="ml-2 text-xs font-bold text-accent">{en ? 'Saved' : 'Guardado'}</span>}
          </p>
        </div>
        <button
          onClick={() => {
            setTexto(valor)
            setError(null)
            setEditando(true)
          }}
          aria-label={`${en ? 'Edit' : 'Editar'} ${etiqueta}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground active:scale-95"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={`nick-${etiqueta}`} className="text-xs text-muted-foreground">
        {etiqueta}
      </label>
      <input
        id={`nick-${etiqueta}`}
        autoFocus
        value={texto}
        maxLength={maximo}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ok()}
        className="mt-1 w-full rounded-xl bg-secondary px-3 py-2.5 text-[15px] font-bold text-foreground outline-none"
      />
      {ayuda && <p className="mt-1 text-[11px] text-muted-foreground">{ayuda}</p>}
      {formatoOk && verificar && libre === '?' && (
        <p className="mt-1 text-xs text-muted-foreground">{en ? 'Checking…' : 'Comprobando…'}</p>
      )}
      {formatoOk && verificar && libre === 'ok' && (
        <p className="mt-1 text-xs font-semibold text-accent">{en ? 'Available' : 'Disponible'}</p>
      )}
      {formatoOk && verificar && libre !== '?' && libre !== 'ok' && (
        <p className="mt-1 text-xs font-semibold text-destructive">{libre}</p>
      )}
      {error && <p className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => setEditando(false)}
          className="flex-1 rounded-xl bg-secondary py-2 text-xs font-bold text-secondary-foreground"
        >
          {en ? 'Cancel' : 'Cancelar'}
        </button>
        <button
          onClick={ok}
          disabled={!valido || guardando}
          className="accent-gradient flex-1 rounded-xl py-2 text-xs font-extrabold text-white disabled:opacity-40"
        >
          {en ? 'Save' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

/**
 * Pestaña "Config": cuenta, preferencias (tema/idioma), restablecer
 * estadísticas y cerrar sesión — el equivalente al ícono de engranaje del
 * nav de LinkedIn.
 */
export function Configuracion({
  nickname,
  userId,
  onNavigate,
  onLogout,
}: {
  nickname: string | null
  userId: string | null
  onNavigate: (p: Pantalla) => void
  onLogout: () => void
}) {
  const { t, estilo, setEstilo, idioma } = useAppSettings()
  const navigate = useNavigate()
  const sinLeerSoporte = useSoporteNoLeidos()
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante
  const [estiloAbierto, setEstiloAbierto] = useState(false)
  const [aliasChat, setAliasChat] = useState<string | null>(null)
  const en = idioma === 'en'

  useEffect(() => {
    if (!userId) return
    let cancelado = false
    obtenerAlias(userId).then((a) => !cancelado && setAliasChat(a))
    return () => {
      cancelado = true
    }
  }, [userId])

  function textoNick(e: ResultadoNick | string | undefined): string {
    const m: Record<string, [string, string]> = {
      duplicado: ['Ese nick ya está en uso. Prueba con otro.', 'That nickname is taken. Try another one.'],
      formato: ['Usa de 3 a 20 letras, números, punto, guion o guion bajo (sin espacios).', 'Use 3 to 20 letters, numbers, dot, dash or underscore (no spaces).'],
      prohibido: ['Ese nick no está permitido.', 'That nickname is not allowed.'],
    }
    const par = m[e ?? ''] ?? ['No se pudo guardar. Prueba de nuevo.', "Couldn't save it. Try again."]
    return en ? par[1] : par[0]
  }

  async function verificarNick(nuevo: string): Promise<string | null> {
    if (nuevo.toLowerCase() === (nombreMostrado ?? '').toLowerCase()) return null
    const r = await comprobarNick(nuevo)
    return r === 'ok' ? null : textoNick(r)
  }

  async function guardarNick(nuevo: string): Promise<string | null> {
    if (!userId) return null
    const r = await cambiarNick(userId, nuevo, aliasChat !== null)
    if (r.ok) {
      if (aliasChat !== null) setAliasChat(nuevo)
      return null
    }
    return textoNick(r.error)
  }

  // "Restablecer estadísticas": borra el historial de simulacros y, si
  // además tiene Academia habilitada, su progreso ahí — ambos en Supabase,
  // por user_id, cruzan dispositivos — ver claude/restablecer-
  // estadisticas-academia-estadisticas-diseno.md. No toca config_examen,
  // nickname, tema ni idioma: el pedido fue "estadísticas", no "toda mi
  // cuenta". Se consulta el acceso a Academia solo para que la copia (fila +
  // modal) no le prometa a alguien sin acceso que le va a borrar algo ahí.
  const [academiaHabilitada, setAcademiaHabilitada] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [estadoRestablecer, setEstadoRestablecer] = useState<'idle' | 'borrando' | 'hecho' | 'error'>('idle')
  const timeoutToastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelado = false
    getAcademiaHabilitada(userId).then((habilitada) => {
      if (!cancelado) setAcademiaHabilitada(habilitada)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  // Los timeouts que reponen el botón/toast a su estado normal no se
  // cancelaban al salir de esta pantalla antes de que dispararan: si el
  // usuario navegaba a otra pestaña justo después de restablecer, React
  // intentaba actualizar estado de un componente ya desmontado. Se limpian
  // acá al desmontar, y también antes de programar uno nuevo.
  useEffect(() => {
    return () => {
      if (timeoutToastRef.current) clearTimeout(timeoutToastRef.current)
    }
  }, [])

  async function restablecerEstadisticas() {
    if (!userId) return
    setEstadoRestablecer('borrando')
    const { ok } = await eliminarHistorialPropio(userId)
    if (ok) {
      await borrarProgresoAcademiaRemoto(userId)
      setModalAbierto(false)
      setEstadoRestablecer('hecho')
      if (timeoutToastRef.current) clearTimeout(timeoutToastRef.current)
      timeoutToastRef.current = setTimeout(() => setEstadoRestablecer('idle'), 2500)
    } else {
      // El modal se queda abierto a propósito: así el error se ve adentro,
      // no tapado detrás (antes quedaba invisible hasta cerrar el modal).
      setEstadoRestablecer('error')
    }
  }

  function cancelarModal() {
    setModalAbierto(false)
    if (estadoRestablecer === 'error') setEstadoRestablecer('idle')
  }

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      {/* Único header sin selector de tema/idioma (vive en "Preferencias"):
          logo centrado y más grande para que no quede vacío a la derecha. */}
      <div className="flex items-center justify-center">
        <LogoMark className="h-11 w-auto" />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.config.titulo}</h1>

      <div className="card-elevated mt-4 flex items-start gap-3 rounded-2xl bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <NickEditable
            key={nombreMostrado}
            etiqueta={t.config.cuenta}
            valor={nombreMostrado}
            idioma={idioma}
            ayuda={
              en
                ? "Your nickname. It's also the name others see in Community. Change it whenever you like."
                : 'Es tu nick. También es el nombre que ven los demás en Comunidad. Puedes cambiarlo cuando quieras.'
            }
            minimo={3}
            maximo={20}
            patron={/^[A-Za-z0-9_.-]+$/}
            verificar={verificarNick}
            guardar={guardarNick}
          />
        </div>
      </div>

      {/* Ayuda y soporte: antes era una pestaña de la barra; ahora vive acá y
          su lugar en la barra lo ocupa Comunidad. La pantalla /ayuda sigue
          teniendo el tour, la guía de uso y Escribir a soporte / Mis consultas. */}
      <button
        onClick={() => navigate(RUTA.ayuda)}
        className="card-elevated mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-foreground">
            {idioma === 'en' ? 'Help & support' : 'Ayuda y soporte'}
          </p>
          <p className="text-xs text-muted-foreground">
            {idioma === 'en'
              ? 'Write to support, my requests, app guide and tour'
              : 'Escribir a soporte, mis consultas, guía de uso y tour'}
          </p>
        </div>
        {sinLeerSoporte > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-accent-foreground">
            {sinLeerSoporte}
          </span>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <div className="card-elevated mt-3 rounded-2xl bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.config.preferencias}</p>
        <div className="mt-3">
          <SettingsToggle />
        </div>
      </div>

      {/* Estilo de la app (antes vivía en Ayuda; se movió acá porque es una
          configuración, no una guía de uso). Mismo diseño de acordeón y las
          mismas seis pieles: ver claude/cta-empieza-ya-home.md y el tema
          Acqua en Home.tsx — un estilo nuevo es una fila más acá y un bloque
          de variables CSS bajo .estilo-<nombre> en index.css. */}
      <div className="card-elevated mt-3 overflow-hidden rounded-2xl bg-card">
        <button
          onClick={() => setEstiloAbierto((v) => !v)}
          className="flex w-full items-center gap-3 p-4 text-left"
          aria-expanded={estiloAbierto}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Palette className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.config.estiloTitulo}</p>
            <p className="text-xs text-muted-foreground">{t.config.estiloSubtitulo}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              estiloAbierto ? 'rotate-180' : ''
            }`}
          />
        </button>
        {estiloAbierto && (
          <div className="space-y-1 border-t border-border p-2">
            <button
              onClick={() => setEstilo('clasico')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'clasico' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #123a3f, #0d2233)' }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{t.config.estiloClasicoNombre}</p>
                <p className="text-xs text-muted-foreground">{t.config.estiloClasicoDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'clasico' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'clasico' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>

            <button
              onClick={() => setEstilo('acqua')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'acqua' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #8fe3f2, #1fb6cf 60%, #0d7f96)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloAcquaNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloAcquaDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'acqua' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'acqua' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>

            <button
              onClick={() => setEstilo('electrico')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'electrico' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #b026ff, #00e5ff)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloElectricoNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloElectricoDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'electrico' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'electrico' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>
            <button
              onClick={() => setEstilo('rockpop')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'rockpop' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #161616 0%, #161616 45%, #ff2e63 45%, #ff2e63 72%, #ffe93a 72%)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloRockpopNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloRockpopDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'rockpop' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'rockpop' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>
            <button
              onClick={() => setEstilo('fresita')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'fresita' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #ff8fa3, #ff4d6d, #c9184a)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloFresitaNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloFresitaDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'fresita' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'fresita' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>
            <button
              onClick={() => setEstilo('galaxia')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'galaxia' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899 60%, #22d3ee)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloGalaxiaNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloGalaxiaDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'galaxia' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'galaxia' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>

            <button
              onClick={() => setEstilo('academia')}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                estilo === 'academia' ? 'bg-secondary' : ''
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #f5edd6, #2f6f68)' }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloAcademiaNombre}
                  <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                    {t.config.estiloNuevo}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloAcademiaDesc}</p>
              </div>
              <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  estilo === 'academia' ? 'border-accent' : 'border-border'
                }`}
              >
                {estilo === 'academia' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>

            <div className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left opacity-50">
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, hsl(var(--muted)), hsl(var(--muted)) 6px, hsl(var(--border)) 6px, hsl(var(--border)) 12px)',
                }}
              />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  {t.config.estiloMasEstilos}
                  <span className="rounded-md bg-muted px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-muted-foreground">
                    {t.config.proximamente}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{t.config.estiloMasEstilosDesc}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-elevated mt-3 rounded-2xl bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <RotateCcw className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.config.restablecerTitulo}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {academiaHabilitada ? t.config.restablecerDesc : t.config.restablecerDescSinAcademia}
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          disabled={!userId}
          className="mt-3 w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition active:scale-[0.98] disabled:opacity-50"
        >
          {t.config.restablecerBoton}
        </button>
      </div>

      <button
        onClick={onLogout}
        className="card-elevated mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive transition active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" />
        {t.home.cerrarSesion}
      </button>

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo={t.config.restablecerModalTitulo}
        items={
          academiaHabilitada
            ? [t.config.restablecerModalItemHistorial, t.config.restablecerModalItemAcademia]
            : [t.config.restablecerModalItemHistorial]
        }
        advertencia={t.config.restablecerModalAdvertencia}
        error={estadoRestablecer === 'error' ? t.config.restablecerError : undefined}
        confirmarLabel={t.config.restablecerModalConfirmar}
        cargando={estadoRestablecer === 'borrando'}
        onConfirmar={restablecerEstadisticas}
        onCancelar={cancelarModal}
      />

      <BottomNav
        activo="config"
        onNavigate={onNavigate}
        accesorio={
          estadoRestablecer === 'hecho' ? (
            // Mismo lugar que ya usa el botón central de "Comenzar examen"
            // (ver BottomNav.tsx) para apilar algo justo arriba de la barra
            // sin que esta desaparezca — acá, un toast breve en vez de
            // cambiar el texto del botón de la fila (que quedaba tapado
            // apenas se cerraba el modal).
            <div className="flex justify-center px-6 pb-3">
              <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-xs font-bold text-background shadow-lg duration-200">
                <Check className="h-3.5 w-3.5" />
                {t.config.restablecerExito}
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  )
}
