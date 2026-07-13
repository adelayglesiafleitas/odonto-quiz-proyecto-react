import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="32" fill="url(#logoGrad)" />
      <path
        d="M32 16c-4.2 0-6.9 2.1-8.7 2.1-1.6 0-3.6-1.4-5.9-1.4-4.3 0-8.4 3.5-8.4 10 0 7.6 5.9 17.3 9.4 17.3 2 0 2.6-1.4 4.3-1.4 1.7 0 2.1 1.4 4.2 1.4 1.9 0 2.6-1.5 3.5-3.3.9 1.8 1.6 3.3 3.5 3.3 2.1 0 2.5-1.4 4.2-1.4 1.7 0 2.3 1.4 4.3 1.4 3.5 0 9.4-9.7 9.4-17.3 0-6.5-4.1-10-8.4-10-2.3 0-4.3 1.4-5.9 1.4-1.8 0-4.5-2.1-8.7-2.1-1.1 0-2.3-.7-2.3-2.1S30.9 12 32 12"
        fill="white"
        fillOpacity="0.94"
      />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12879a" />
          <stop offset="1" stopColor="#0a3547" />
        </linearGradient>
      </defs>
    </svg>
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
