# -*- coding: utf-8 -*-
import sys

BASE = "/sessions/rcw-01gryf5brxalebcfsqsfww2q/mnt/odonto-quiz-proyecto-react"

def replace_once(content, old, new, label):
    n = content.count(old)
    if n != 1:
        print(f"FAIL {label}: found {n} occurrences (expected 1)")
        sys.exit(1)
    return content.replace(old, new, 1)

# ---------------------------------------------------------------------------
# 1) components/Logo.tsx — LogoMark gets a `variante` prop, default 'claro'
#    (adapts to bg-background via a light-ink + dark-ink pair swapped with
#    the existing `.dark` Tailwind class), explicit 'oscuro' keeps today's
#    single white image for the screens that sit on a permanently-dark
#    surface (brand-gradient or a hardcoded dark bg).
# ---------------------------------------------------------------------------
path = f"{BASE}/src/components/Logo.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_logomark = """export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="ExamPrep"
      draggable={false}
      className={cn('select-none object-contain', className)}
    />
  )
}"""

new_logomark = """export function LogoMark({
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
}"""

content = replace_once(content, old_logomark, new_logomark, "LogoMark body")

old_lockup_call = "      <LogoMark className=\"h-10 w-auto shrink-0\" />"
new_lockup_call = "      <LogoMark className=\"h-10 w-auto shrink-0\" variante={dark ? 'oscuro' : 'claro'} />"
content = replace_once(content, old_lockup_call, new_lockup_call, "LogoLockup call")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK Logo.tsx patched")

# ---------------------------------------------------------------------------
# 2) The 6 call sites on a permanently-dark surface: add variante="oscuro"
#    so they keep exactly today's appearance (white logo) — everything else
#    (Academia/Ayuda/Configuracion/ElegirAsignatura, all on bg-background)
#    is left untouched and picks up the new adaptive default for free.
# ---------------------------------------------------------------------------
sites = [
    (f"{BASE}/src/screens/Home.tsx",
     '<LogoMark className="h-10 w-auto" />',
     '<LogoMark className="h-10 w-auto" variante="oscuro" />'),
    (f"{BASE}/src/screens/DispositivoBloqueado.tsx",
     '<LogoMark className="h-16 w-auto" />',
     '<LogoMark className="h-16 w-auto" variante="oscuro" />'),
    (f"{BASE}/src/screens/Login.tsx",
     '<LogoMark className="h-16 w-auto" />',
     '<LogoMark className="h-16 w-auto" variante="oscuro" />'),
    (f"{BASE}/src/screens/Splash.tsx",
     '<LogoMark className="h-20 w-20 animate-pulse" />',
     '<LogoMark className="h-20 w-20 animate-pulse" variante="oscuro" />'),
    (f"{BASE}/src/screens/Splash.tsx",
     '<LogoMark className="h-12 w-12 animate-float-up drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />',
     '<LogoMark className="h-12 w-12 animate-float-up drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" variante="oscuro" />'),
    (f"{BASE}/src/components/LoadingScreen.tsx",
     '<LogoMark className="relative h-10 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />',
     '<LogoMark className="relative h-10 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" variante="oscuro" />'),
    (f"{BASE}/src/components/TourBienvenida.tsx",
     '<LogoMark className="h-8 w-auto" />',
     '<LogoMark className="h-8 w-auto" variante="oscuro" />'),
]

by_file = {}
for path, old, new in sites:
    by_file.setdefault(path, []).append((old, new))

for path, replacements in by_file.items():
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in replacements:
        content = replace_once(content, old, new, path)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK {path} patched ({len(replacements)} site(s))")

print("ALL DONE")
