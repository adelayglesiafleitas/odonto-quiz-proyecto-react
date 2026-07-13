import { useState, type FormEvent } from 'react'
import { LogoMark } from '@/components/Logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'

export function Login({ onLogin }: { onLogin: () => void }) {
  const { t } = useAppSettings()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(false)
    setCargando(true)
    setTimeout(() => {
      if (usuario.trim() === '123' && clave.trim() === '123') {
        onLogin()
      } else {
        setError(true)
        setCargando(false)
      }
    }, 450)
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
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-white">{t.comun.nombreApp}</h1>
          <p className="text-xs font-medium text-white/60">{t.login.subtitulo}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-elevated w-full max-w-sm animate-float-up rounded-3xl bg-card p-7"
        style={{ animationDelay: '0.1s' }}
      >
        <h2 className="text-lg font-bold text-foreground">{t.login.bienvenida}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitulo}</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="usuario" className="text-xs font-semibold text-foreground/80">
              {t.login.usuario}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="usuario"
                placeholder="123"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="h-11 rounded-xl pl-9"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clave" className="text-xs font-semibold text-foreground/80">
              {t.login.contrasena}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="clave"
                type={verClave ? 'text' : 'password'}
                placeholder="••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="h-11 rounded-xl pl-9 pr-9"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {t.login.error}
            </div>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold hover:bg-primary/90"
          >
            {cargando ? t.login.ingresando : t.login.iniciarSesion}
          </Button>
        </div>

        <p className="mt-5 rounded-xl bg-secondary px-3 py-2 text-center text-[11px] font-medium text-muted-foreground">
          {t.login.demo}
        </p>
      </form>

      <p className="mt-6 text-center text-[11px] text-white/50 animate-float-up" style={{ animationDelay: '0.2s' }}>
        {t.login.demoNota}
      </p>
    </div>
  )
}
