// src/components/MensajeAdminVideo.tsx
//
// Mensaje del admin de tipo 'video' (ver src/lib/mensajesAdminRemoto.ts):
// a diferencia de MensajeAdminBanner, ocupa toda la pantalla apenas se
// entra a Home, tipo "historia" — pensado para un video promocional que ya
// trae su propio texto/marca quemado en la imagen, no para competir por
// atención como una tarjeta chica más. Arranca en mute (autoplay con sonido
// lo bloquean los navegadores) con botón para activarlo, y se cierra solo
// al terminar si el usuario no lo cierra antes con la ✕.
//
// `mx-auto w-full max-w-md` junto al `fixed inset-0`: mismo motivo que en
// TourBienvenida.tsx — sin esto cubre el ancho real del navegador en vez de
// quedarse en la columna angosta que usa el resto de la app en desktop.

import { useRef, useState } from 'react'
import { Volume2, VolumeX, X } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import type { MensajeAdmin } from '@/lib/mensajesAdminRemoto'

interface Props {
  mensaje: MensajeAdmin
  onCerrar: () => void
}

export function MensajeAdminVideo({ mensaje, onCerrar }: Props) {
  const { t } = useAppSettings()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [silenciado, setSilenciado] = useState(true)
  const [progreso, setProgreso] = useState(0)

  const alternarSonido = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setSilenciado(video.muted)
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto w-full max-w-md bg-black">
      {mensaje.mediaUrl && (
        <video
          ref={videoRef}
          src={mensaje.mediaUrl}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            if (v.duration) setProgreso((v.currentTime / v.duration) * 100)
          }}
          onEnded={onCerrar}
        />
      )}

      <div className="absolute inset-x-3 top-3 h-[3px] overflow-hidden rounded-full bg-white/25">
        <div className="h-full rounded-full bg-white transition-[width]" style={{ width: `${progreso}%` }} />
      </div>

      <div className="absolute inset-x-3 top-7 flex items-center justify-between">
        <span className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {t.mensajesAdmin.etiquetaVideo}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternarSonido}
            aria-label={silenciado ? t.mensajesAdmin.activarSonido : t.mensajesAdmin.silenciar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            {silenciado ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={t.mensajesAdmin.cerrar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
