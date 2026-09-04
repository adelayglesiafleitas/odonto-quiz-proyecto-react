import { useState } from 'react'
import { ChevronDown, LogOut, Palette, User } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { Pantalla } from '@/types'

/**
 * Pestaña "Config": cuenta, preferencias (tema/idioma) y cerrar sesión —
 * el equivalente al ícono de engranaje del nav de LinkedIn.
 */
export function Configuracion({
  nickname,
  onNavigate,
  onLogout,
}: {
  nickname: string | null
  onNavigate: (p: Pantalla) => void
  onLogout: () => void
}) {
  const { t, estilo, setEstilo } = useAppSettings()
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante
  const [estiloAbierto, setEstiloAbierto] = useState(false)

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.config.titulo}</h1>

      <div className="card-elevated mt-4 flex items-center gap-3 rounded-2xl bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t.config.cuenta}</p>
          <p className="truncate text-[15px] font-bold text-foreground">{nombreMostrado}</p>
        </div>
      </div>

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

      <button
        onClick={onLogout}
        className="card-elevated mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive transition active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" />
        {t.home.cerrarSesion}
      </button>

      <BottomNav activo="config" onNavigate={onNavigate} />
    </div>
  )
}
