// src/components/MensajeAdminBanner.tsx
//
// Tarjeta chica y dismissible para CUALQUIER mensaje del admin — texto,
// texto_foto o video (ver src/lib/mensajesAdminRemoto.ts). A pedido del
// usuario, el video ya NO es pantalla completa: se reproduce adentro de la
// misma tarjeta, del mismo tamaño que el resto — toda la "zona de mensajes
// y promoción" es este único lugar en Home, sin overlays aparte.
//
// Usa un color violeta fijo (no los tokens `--home-hero-*` que cambian con
// los 6 estilos) para que un comunicado del equipo se lea siempre igual.
//
// Al cerrar (✕) o al terminar el video (`onEnded`), se llama a `onCerrar` —
// Home descarta este mensaje y muestra automáticamente el siguiente
// pendiente en el mismo lugar, sin que el usuario tenga que volver a entrar
// a Home ni hacer nada más.

import { useRef, useState } from 'react'
import { Megaphone, Volume2, VolumeX, X } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import type { MensajeAdmin } from '@/lib/mensajesAdminRemoto'

interface Props {
  mensaje: MensajeAdmin
  onCerrar: () => void
}

export function MensajeAdminBanner({ mensaje, onCerrar }: Props) {
  const { t } = useAppSettings()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [silenciado, setSilenciado] = useState(true)

  const alternarSonido = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setSilenciado(video.muted)
  }

  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-[#241a4a] to-[#150f30] p-4 animate-bienvenida-in">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 text-white">
          <Megaphone className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300">
            {mensaje.tipo === 'video' ? t.mensajesAdmin.etiquetaVideo : t.mensajesAdmin.etiqueta}
          </p>

          {mensaje.texto && <p className="mt-1 text-[13px] leading-relaxed text-violet-50">{mensaje.texto}</p>}

          {mensaje.tipo === 'texto_foto' && mensaje.mediaUrl && (
            <img src={mensaje.mediaUrl} alt="" className="mt-2.5 max-h-32 w-full rounded-xl object-cover" />
          )}

          {mensaje.tipo === 'video' && mensaje.mediaUrl && (
            <div className="relative mt-2.5 overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                src={mensaje.mediaUrl}
                autoPlay
                muted
                playsInline
                className="max-h-56 w-full rounded-xl object-cover"
                onEnded={onCerrar}
              />
              <button
                type="button"
                onClick={alternarSonido}
                aria-label={silenciado ? t.mensajesAdmin.activarSonido : t.mensajesAdmin.silenciar}
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
              >
                {silenciado ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCerrar}
          aria-label={t.mensajesAdmin.cerrar}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-violet-100 transition hover:bg-white/20"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
