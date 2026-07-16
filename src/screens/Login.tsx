import { useState, type FormEvent } from 'react'
import { LogoMark } from '@/components/Logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Mail, AlertCircle, MailCheck } from 'lucide-react'

type Modo = 'login' | 'registro'

function traducirErrorAuth(mensaje: string, idioma: 'es' | 'en'): string {
  const m = mensaje.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return idioma === 'es' ? 'Correo o contraseña incorrectos.' : 'Incorrect email or password.'
  }
  if (m.includes('user already registered') || m.includes('already registered')) {
    return idioma === 'es' ? 'Ya existe una cuenta con ese correo. Inicia sesión.' : 'An account with that email already exists. Sign in instead.'
  }
  if (m.includes('password should be at least')) {
    return idioma === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.'
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return idioma === 'es' ? 'El correo electrónico no es válido.' : 'That email address is not valid.'
  }
  if (m.includes('email not confirmed')) {
    return idioma === 'es' ? 'Confirma tu correo antes de iniciar sesión.' : 'Confirm your email before signing in.'
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return idioma === 'es' ? 'Demasiados intentos. Espera un momento y vuelve a intentarlo.' : 'Too many attempts. Wait a moment and try again.'
  }
  return mensaje
}

export function Login({ onLogin }: { onLogin: () => void }) {
  const { t, idioma } = useAppSettings()
  const [modo, setModo] = useState<Modo>('login')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [confirmarClave, setConfirmarClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revisarCorreo, setRevisarCorreo] = useState(false)
  const [cargando, setCargando] = useState(false)

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo)
    setError(null)
    setRevisarCorreo(false)
    setConfirmarClave('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setRevisarCorreo(false)

    if (modo === 'registro' && clave !== confirmarClave) {
      setError(t.login.errorContrasenasNoCoinciden)
      return
    }
    if (modo === 'registro' && clave.length < 6) {
      setError(t.login.errorContrasenaCorta)
      return
    }

    setCargando(true)

    if (modo === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave })
      setCargando(false)
      if (err) {
        setError(traducirErrorAuth(err.message, idioma))
        return
      }
      onLogin()
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email: correo.trim(), password: clave })
      setCargando(false)
      if (err) {
        setError(traducirErrorAuth(err.message, idioma))
        return
      }
      if (data.session) {
        onLogin()
      } else {
        setRevisarCorreo(true)
      }
    }
  }

  const esRegistro = modo === 'registro'

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
          <p className="text-xs font-medium text-white/60">{esRegistro ? t.login.subtituloRegistro : t.login.subtituloLogin}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-elevated w-full max-w-sm animate-float-up rounded-3xl bg-card p-7"
        style={{ animationDelay: '0.1s' }}
      >
        <h2 className="text-lg font-bold text-foreground">{esRegistro ? t.login.tituloRegistro : t.login.tituloLogin}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{esRegistro ? t.login.subtituloRegistro : t.login.subtituloLogin}</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="correo" className="text-xs font-semibold text-foreground/80">
              {t.login.correo}
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="h-11 rounded-xl pl-9"
                autoComplete="email"
                required
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
                placeholder="••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="h-11 rounded-xl pl-9 pr-9"
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
                minLength={esRegistro ? 6 : undefined}
                required
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

          {esRegistro && (
            <div className="animate-float-up space-y-1.5">
              <Label htmlFor="confirmarClave" className="text-xs font-semibold text-foreground/80">
                {t.login.confirmarContrasena}
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmarClave"
                  type={verClave ? 'text' : 'password'}
                  placeholder="••••••"
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {revisarCorreo && (
            <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success">
              <MailCheck className="h-4 w-4 shrink-0" />
              {t.login.revisaCorreo}
            </div>
          )}

          <Button
            type="submit"
            disabled={cargando}
            className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold hover:bg-primary/90"
          >
            {cargando
              ? esRegistro
                ? t.login.creandoCuenta
                : t.login.ingresando
              : esRegistro
                ? t.login.crearCuenta
                : t.login.iniciarSesion}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => cambiarModo(esRegistro ? 'login' : 'registro')}
          className="mt-5 w-full text-center text-xs font-semibold text-accent hover:underline"
        >
          {esRegistro ? t.login.yaTengoCuenta : t.login.noTengoCuenta}
        </button>
      </form>
    </div>
  )
}
