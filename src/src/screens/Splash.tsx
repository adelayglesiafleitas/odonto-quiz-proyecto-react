import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { useAppSettings } from '@/context/AppSettings'

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [frame, setFrame] = useState(0)
  const { t } = useAppSettings()

  useEffect(() => {
    const frameTimer = setInterval(() => setFrame((f) => (f + 1) % 4), 320)
    const doneTimer = setTimeout(onFinish, 2400)
    return () => {
      clearInterval(frameTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinish])

  return (
    <div className="brand-gradient app-shell flex flex-col items-center justify-center px-8 text-white">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-white/25 animate-pulse-ring" />
        <span
          className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring"
          style={{ animationDelay: '0.7s' }}
        />
        <LogoMark className="h-24 w-24 animate-logo-pop drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]" />
      </div>

      <h1 className="mt-8 text-2xl font-extrabold tracking-tight animate-float-up" style={{ animationDelay: '0.3s' }}>
        {t.comun.nombreApp}
      </h1>
      <p
        className="mt-1.5 text-sm font-medium text-white/70 animate-float-up"
        style={{ animationDelay: '0.45s' }}
      >
        {t.comun.tagline}
      </p>

      <div className="mt-10 flex gap-1.5 animate-float-up" style={{ animationDelay: '0.6s' }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === frame ? '#1fc6c6' : 'rgba(255,255,255,0.3)',
              transform: i === frame ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
