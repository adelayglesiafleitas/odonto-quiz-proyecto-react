import type { ReactNode } from 'react'
import { Gauge, GraduationCap, MessagesSquare, UserCog, ClipboardCheck } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import type { TabPlana } from '@/components/BottomNav'
import type { Pantalla } from '@/types'

/**
 * Navegación de escritorio (lg+, 1024px): la misma columna izquierda que se
 * probó primero en Home (ver claude/dentiquiz-desktop-study.md, opción A) y
 * que ahora comparten todas las pantallas principales, para que la
 * navegación no desaparezca ni cambie de forma al pasar de una a otra.
 *
 * Mismas 4 pestañas y mismo botón de Simulacro que BottomNav — la barra
 * inferior sigue siendo la navegación real en mobile/tablet; en escritorio
 * cada pantalla la oculta (`lg:hidden`) y muestra esto en su lugar.
 */
export function SidebarEscritorio({ activo, onNavigate }: { activo: TabPlana; onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()

  const items: { id: TabPlana; icon: typeof Gauge; label: string }[] = [
    { id: 'home', icon: Gauge, label: t.nav.home },
    { id: 'academia', icon: GraduationCap, label: t.nav.academia },
    { id: 'comunidad', icon: MessagesSquare, label: t.nav.comunidad },
    { id: 'config', icon: UserCog, label: t.nav.config },
  ]

  return (
    <nav className="card-elevated flex flex-col gap-1 rounded-2xl border border-border bg-card p-2">
      {items.map((item) => {
        const Icon = item.icon
        const esActivo = activo === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={esActivo ? 'page' : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              esActivo ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
      <button
        onClick={() => onNavigate('asignaturas')}
        className="accent-gradient mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold text-white transition active:scale-[0.98]"
      >
        <ClipboardCheck className="h-4 w-4" />
        {t.nav.simulacro}
      </button>
    </nav>
  )
}

/** Envoltorio fijo/sticky de la columna izquierda — mismo posicionamiento en
 * todas las pantallas. `children` permite que Home le agregue arriba su
 * tarjeta de perfil sin que el resto de las pantallas tenga que pasarla. */
export function AsideEscritorio({ children }: { children: ReactNode }) {
  return <aside className="hidden lg:sticky lg:top-10 lg:flex lg:flex-col lg:gap-4 lg:self-start">{children}</aside>
}
