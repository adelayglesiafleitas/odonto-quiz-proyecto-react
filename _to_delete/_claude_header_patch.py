# -*- coding: utf-8 -*-
import sys

BASE = "/sessions/rcw-01gryf5brxalebcfsqsfww2q/mnt/odonto-quiz-proyecto-react"

def replace_once(content, old, new, label):
    n = content.count(old)
    if n != 1:
        print(f"FAIL {label}: found {n} occurrences (expected 1)")
        sys.exit(1)
    return content.replace(old, new, 1)

def patch_file(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new, label in replacements:
        content = replace_once(content, old, new, f"{path} :: {label}")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK {path} patched ({len(replacements)} site(s))")

# ---------------------------------------------------------------------------
# Header persistente: misma franja logo + SettingsToggle que ya usan
# Ayuda.tsx / Configuracion.tsx, agregada arriba de todo en cada pantalla de
# detalle que hoy solo mostraba "‹ + título". El back+título existente queda
# igual, una fila más abajo (mt-4).
# ---------------------------------------------------------------------------

# 1) Estudio.tsx
patch_file(f"{BASE}/src/screens/Estudio.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { BottomNav } from '@/components/BottomNav'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { BottomNav } from '@/components/BottomNav'",
        "imports",
    ),
    (
        """    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estudio.titulo}</h1>
      </div>""",
        """    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estudio.titulo}</h1>
      </div>""",
        "header row",
    ),
])

# 2) Estadisticas.tsx
patch_file(f"{BASE}/src/screens/Estadisticas.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { Spinner } from '@/components/Spinner'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { Spinner } from '@/components/Spinner'",
        "imports",
    ),
    (
        """    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estadisticas.titulo}</h1>
      </div>""",
        """    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estadisticas.titulo}</h1>
      </div>""",
        "header row",
    ),
])

# 3) MisConsultas.tsx
patch_file(f"{BASE}/src/screens/MisConsultas.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { Spinner } from '@/components/Spinner'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { Spinner } from '@/components/Spinner'",
        "imports",
    ),
    (
        """    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(RUTA.ayuda)}""",
        """    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => navigate(RUTA.ayuda)}""",
        "header row",
    ),
])

# 4) HiloConsulta.tsx
patch_file(f"{BASE}/src/screens/HiloConsulta.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { Spinner } from '@/components/Spinner'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { Spinner } from '@/components/Spinner'",
        "imports",
    ),
    (
        """    <div className="app-shell flex h-screen max-h-screen flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-4">
        <button
          onClick={() => navigate(RUTA_SOPORTE)}""",
        """    <div className="app-shell flex h-screen max-h-screen flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-4">
        <button
          onClick={() => navigate(RUTA_SOPORTE)}""",
        "header row",
    ),
])

# 5) ConfigurarExamen.tsx
patch_file(f"{BASE}/src/screens/ConfigurarExamen.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { BottomNav } from '@/components/BottomNav'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { BottomNav } from '@/components/BottomNav'",
        "imports",
    ),
    (
        """    <div className="app-shell bg-background px-6 pb-56 pt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.configurar.titulo}</h1>
        {cargandoConfig && <Spinner className="h-4 w-4 text-muted-foreground" />}
      </div>""",
        """    <div className="app-shell bg-background px-6 pb-56 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.configurar.titulo}</h1>
        {cargandoConfig && <Spinner className="h-4 w-4 text-muted-foreground" />}
      </div>""",
        "header row",
    ),
])

# 6) Examen.tsx
patch_file(f"{BASE}/src/screens/Examen.tsx", [
    (
        "import { useAppSettings } from '@/context/AppSettings'\nimport { ArrowLeft, ArrowRight, X, Timer, AlertTriangle } from 'lucide-react'",
        "import { useAppSettings } from '@/context/AppSettings'\nimport { SettingsToggle } from '@/components/SettingsToggle'\nimport { LogoMark } from '@/components/Logo'\nimport { ArrowLeft, ArrowRight, X, Timer, AlertTriangle } from 'lucide-react'",
        "imports",
    ),
    (
        """    <div className="app-shell flex flex-col bg-background">
      <div className="border-b border-border px-5 pb-4 pt-5">""",
        """    <div className="app-shell flex flex-col bg-background">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="border-b border-border px-5 pb-4 pt-5">""",
        "header row",
    ),
])

# 7) Academia.tsx — PantallaLibro, PantallaRuta, NodoLayout (cubre todos los
#    tipos de nodo: intro/repaso/leccion, que renderizan a través de éste).
patch_file(f"{BASE}/src/screens/Academia.tsx", [
    (
        """  return (
    <div className="pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{LIBRO_INMACULADA.titulo}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{t.academia.libroAutor}</p>
        </div>
      </div>""",
        """  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{LIBRO_INMACULADA.titulo}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{t.academia.libroAutor}</p>
        </div>
      </div>""",
        "PantallaLibro header row",
    ),
    (
        """  return (
    <div className="pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{t.academia.libroCapituloLabel(capitulo.numero)}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{capitulo.titulo}</p>
        </div>
      </div>""",
        """  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{t.academia.libroCapituloLabel(capitulo.numero)}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{capitulo.titulo}</p>
        </div>
      </div>""",
        "PantallaRuta header row",
    ),
    (
        """  return (
    <div className="pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{titulo}</h1>
          {subtitulo && <p className="truncate text-xs font-medium text-muted-foreground">{subtitulo}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-3 px-6">{children}</div>""",
        """  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{titulo}</h1>
          {subtitulo && <p className="truncate text-xs font-medium text-muted-foreground">{subtitulo}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-3 px-6">{children}</div>""",
        "NodoLayout header row",
    ),
])

print("ALL DONE")
