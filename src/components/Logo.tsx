import { cn } from '@/lib/utils'

export function LogoMark({
  className,
  variante = 'claro',
}: {
  className?: string
  /**
   * 'claro' (default): para usar sobre el fondo normal de la pantalla
   * (bg-background), que cambia de casi blanco a casi negro según el tema.
   * /logo.png es tinta blanca — pensada para una franja siempre oscura, como
   * la de Home — así que usada tal cual acá quedaba blanco sobre blanco en
   * modo claro (invisible). Esta variante muestra /logo-claro.png (tinta
   * --primary) en modo claro y /logo.png en modo oscuro, coordinado con la
   * clase `.dark` que ya alterna el resto de la app.
   *
   * 'oscuro': para una franja permanentemente oscura (brand-gradient, o un
   * fondo oscuro fijo tipo Splash/LoadingScreen) que no cambia con el tema —
   * ahí siempre corresponde la tinta blanca, sin alternar. Mismo criterio
   * que ya usa `variante` en SettingsToggle.
   */
  variante?: 'claro' | 'oscuro'
}) {
  if (variante === 'oscuro') {
    return (
      <img
        src="/logo.png"
        alt="DentiQuiz"
        draggable={false}
        className={cn('select-none object-contain', className)}
      />
    )
  }

  return (
    <span className={cn('relative inline-block select-none', className)}>
      <img
        src="/logo-claro.png"
        alt="DentiQuiz"
        draggable={false}
        className="block h-full w-auto object-contain dark:hidden"
      />
      <img
        src="/logo.png"
        alt="DentiQuiz"
        draggable={false}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  )
}

export function LogoLockup({ className, dark = false, tagline }: { className?: string; dark?: boolean; tagline?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-10 w-auto shrink-0" variante={dark ? 'oscuro' : 'claro'} />
      <div className="leading-tight">
        <p className={cn('text-[15px] font-extrabold tracking-tight', dark ? 'text-white' : 'text-primary')}>
          ExamPrep
        </p>
        {tagline && (
          <p className={cn('text-[10px] font-medium tracking-wide uppercase', dark ? 'text-white/60' : 'text-muted-foreground')}>
            {tagline}
          </p>
        )}
      </div>
    </div>
  )
}
