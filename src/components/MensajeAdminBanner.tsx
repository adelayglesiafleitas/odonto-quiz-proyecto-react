// src/components/MensajeAdminBanner.tsx
//
// Banner chico y dismissible para mensajes del admin de tipo 'texto' y
// 'texto_foto' (ver src/lib/mensajesAdminRemoto.ts). A propósito usa un
// color violeta fijo (no los tokens `--home-hero-*` que cambian con los 6
// estilos, como en la tarjeta de bienvenida/frase del día) para que un
// comunicado del equipo se lea siempre igual, sin mezclarse visualmente con
// el resto de Home. No tiene temporizador: se cierra solo a mano, con la ✕.

import { Megaphone, X } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import type { MensajeAdmin } from '@/lib/mensajesAdminRemoto'

interface Props {
  mensaje: MensajeAdmin
  onCerrar: () => void
}

export function MensajeAdminBanner({ mensaje, onCerrar }: Props) {
  const { t } = useAppSettings()

  return (
    <div className="card-elevated relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-[#241a4a] to-[#150f30] p-4 animate-bienvenida-in">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-700 text-white">
          <Megaphone className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300">{t.mensajesAdmin.etiqueta}</p>
          {mensaje.texto && <p className="mt-1 text-[13px] leading-relaxed text-violet-50">{mensaje.texto}</p>}
          {mensaje.tipo === 'texto_foto' && mensaje.mediaUrl && (
            <img src={mensaje.mediaUrl} alt="" className="mt-2.5 max-h-32 w-full rounded-xl object-cover" />
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
