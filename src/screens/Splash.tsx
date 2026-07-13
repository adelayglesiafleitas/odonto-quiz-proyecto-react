import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { useAppSettings } from '@/context/AppSettings'

const TOTAL_FRAMES = 76
const FPS = 15
const FRAME_URLS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `/splash-frames/frame-${String(i + 1).padStart(3, '0')}.jpg`,
)

export function Splash({ onFinish }: { onFinish: () => void }) {
  const { t } = useAppSettings()
  const [frameIndex, setFrameIndex] = useState(0)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    let cancelado = false
    Promise.all(
      FRAME_URLS.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          }),
      ),
    ).then(() => {
      if (!cancelado) setListo(true)
    })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!listo) return
    const intervalo = setInterval(() => {
      setFrameIndex((i) => {
        if (i >= TOTAL_FRAMES - 1) {
          clearInterval(intervalo)
          setTimeout(onFinish, 550)
          return i
        }
        return i + 1
      })
    }, 1000 / FPS)
    return () => clearInterval(intervalo)
  }, [listo, onFinish])

  const progreso = ((frameIndex + 1) / TOTAL_FRAMES) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden bg-[#04141c] text-white">
      {!listo ? (
        <div className="brand-gradient absolute inset-0 flex items-center justify-center">
          <LogoMark className="h-20 w-20 animate-pulse" />
        </div>
      ) : (
        <>
          <img
            src={FRAME_URLS[frameIndex]}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            draggable={false}
          />
          <img
            src={FRAME_URLS[frameIndex]}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[#04141c]/25" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#04141c] via-[#04141c]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#04141c]/60 to-transparent" />

      <div className="relative z-10 flex flex-col items-center pb-12">
        <LogoMark className="h-12 w-12 animate-float-up drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
        <h1
          className="mt-3 text-2xl font-extrabold tracking-tight animate-float-up"
          style={{ animationDelay: '0.1s' }}
        >
          {t.comun.nombreApp}
        </h1>
        <p
          className="mt-1.5 text-sm font-medium text-white/70 animate-float-up"
          style={{ animationDelay: '0.2s' }}
        >
          {t.comun.tagline}
        </p>

        <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-[#1fc6c6] transition-all duration-150 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  )
}
