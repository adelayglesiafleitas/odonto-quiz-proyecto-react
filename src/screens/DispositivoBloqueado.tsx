import { useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { ShieldAlert } from 'lucide-react'

export function DispositivoBloqueado({
  dispositivos,
  onContinuarAqui,
  onCancelar,
}: {
  dispositivos: number
  onContinuarAqui: () => Promise<void>
  onCancelar: () => void
}) {
  const { t } = useAppSettings()
  const [cargando, setCargando] = useState(false)

  async function handleContinuar() {
    setCargando(true)
    await onContinuarAqui()
    setCargando(false)
  }

  return (
    <div className="brand-gradient app-shell relative flex flex-col items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#1fc6c6]/10 blur-3xl" />

      <div className="absolute right-5 top-5">
        <SettingsToggle variante="oscuro" />
      </div>

      <div className="mb-8 flex flex-col items-center gap-3 animate-float-up">
        <LogoMark className="h-14 w-14" />
        <h1 className="text-xl font-extrabold tracking-tight text-white">{t.comun.nombreApp}</h1>
      </div>

      <div className="card-elevated w-full max-w-sm animate-float-up rounded-3xl bg-card p-7" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">{t.dispositivo.titulo}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.dispositivo.mensaje(dispositivos)}</p>
        </div>

        <div className="mt-6 space-y-2.5">
          <Button
            onClick={handleContinuar}
            disabled={cargando}
            className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold hover:bg-primary/90"
          >
            {cargando ? t.dispositivo.cerrando : t.dispositivo.cerrarOtrosBoton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={cargando}
            className="h-11 w-full rounded-xl text-[15px] font-semibold"
          >
            {t.dispositivo.cancelarBoton}
          </Button>
        </div>
      </div>
    </div>
  )
}
