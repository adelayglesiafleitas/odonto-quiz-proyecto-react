import type { ReactNode } from 'react'
import { Gauge, GraduationCap, MessagesSquare, UserCog, ClipboardCheck } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { useNoLeidosComunidad } from '@/lib/comunidad'
import { useSoporteNoLeidos } from '@/lib/tickets'
import type { Pantalla } from '@/types'

// 'simulacro' no es una pestaña plana seleccionable: se usa cuando estamos
// en una pantalla asociada al botón central (p. ej. Configurar examen), para
// que ninguna de las 4 pestañas se marque como activa por error.
export type TabPlana = 'home' | 'academia' | 'comunidad' | 'config'
export type TabActivo = TabPlana | 'simulacro'

/**
 * Barra de navegación inferior: 4 pestañas planas más un botón circular
 * elevado en el centro para la acción principal (iniciar un simulacro).
 * Íconos temáticos de estudio/examen en vez de un set genérico, para que
 * no recuerde a la barra de LinkedIn.
 *
 * Es fija (fixed) y persiste en todas las pantallas principales, incluida
 * "Configurar examen": ahí se le pasa `accesorio` para mostrar el botón de
 * "Comenzar examen" apilado justo arriba de la barra, sin que esta
 * desaparezca.
 */
export function BottomNav({
  activo,
  onNavigate,
  accesorio,
}: {
  activo: TabActivo
  onNavigate: (p: Pantalla) => void
  accesorio?: ReactNode
}) {
  const { t } = useAppSettings()
  // Sin-leídos de Atención al cliente (numerito sobre Config), calculados acá
  // para que salgan en TODAS las pantallas. Usa un canal Realtime con nombre
  // único (no `tickets-usuario-<id>`, que ya abre Home): un mismo nombre de
  // canal solo se puede suscribir una vez y reventaría con "cannot add
  // postgres_changes callbacks ... after subscribe()".
  const noLeidosSoporte = useSoporteNoLeidos()
  // Sin-leídos del chat de Comunidad: canal propio (nombre único), distinto
  // del de tickets, para no repetir el error de suscribirse dos veces al mismo.
  const noLeidosChat = useNoLeidosComunidad()

  const izquierda: { id: TabPlana; icon: typeof Gauge; label: string }[] = [
    { id: 'home', icon: Gauge, label: t.nav.home },
    { id: 'academia', icon: GraduationCap, label: t.nav.academia },
  ]
  const derecha: { id: TabPlana; icon: typeof Gauge; label: string }[] = [
    { id: 'comunidad', icon: MessagesSquare, label: t.nav.comunidad },
    { id: 'config', icon: UserCog, label: t.nav.config },
  ]

  function Item({ tab, badge }: { tab: { id: TabPlana; icon: typeof Gauge; label: string }; badge?: number }) {
    const Icon = tab.icon
    const esActivo = activo === tab.id
    return (
      <button
        onClick={() => onNavigate(tab.id)}
        aria-current={esActivo ? 'page' : undefined}
        className={`relative flex flex-1 flex-col items-center gap-0.5 px-1 pb-0.5 pt-2 transition ${
          esActivo ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {esActivo && <span className="absolute -top-[7px] h-[3px] w-6 rounded-full bg-accent" />}
        <span className="relative">
          <Icon className="h-5 w-5" />
          {typeof badge === 'number' && badge > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-card bg-accent px-[3px] text-[9px] font-extrabold leading-none text-accent-foreground">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </span>
        <span className="text-[10px] font-bold">{tab.label}</span>
      </button>
    )
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
      {accesorio}
      <div className="relative flex items-stretch border-t border-border bg-card px-1 pt-1 shadow-[0_-8px_24px_-16px_rgba(9,41,54,0.25)]">
        {izquierda.map((tab) => (
          <Item key={tab.id} tab={tab} />
        ))}

        <button
          onClick={() => onNavigate('asignaturas')}
          aria-label={t.nav.simulacro}
          className="relative flex flex-1 flex-col items-center justify-end pb-0.5"
        >
          <span className="accent-gradient absolute -top-6 flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-[0_10px_22px_-6px_rgba(9,60,74,0.55)] ring-4 ring-card transition active:scale-95">
            <ClipboardCheck className="h-6 w-6" />
          </span>
          <span className="mt-[36px] text-[9px] font-extrabold text-primary">{t.nav.simulacro}</span>
        </button>

        {derecha.map((tab) => (
          <Item key={tab.id} tab={tab} badge={tab.id === 'config' ? noLeidosSoporte : tab.id === 'comunidad' ? noLeidosChat : undefined} />
        ))}
      </div>
    </nav>
  )
}
