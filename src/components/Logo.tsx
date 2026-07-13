import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="TuttiPlay Prod"
      draggable={false}
      className={cn('select-none object-contain', className)}
    />
  )
}

export function LogoLockup({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <div className="leading-tight">
        <p className={cn('text-[15px] font-extrabold tracking-tight', dark ? 'text-white' : 'text-primary')}>
          OdontoPrep
        </p>
        <p className={cn('text-[10px] font-medium tracking-wide uppercase', dark ? 'text-white/60' : 'text-muted-foreground')}>
          Pacientes Especiales
        </p>
      </div>
    </div>
  )
}
