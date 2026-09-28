// src/lib/bancoCache.ts
// Caché del banco de preguntas en el propio dispositivo (IndexedDB), para no
// volver a descargar el curso entero cada vez que se abre la app (Ortodoncia
// son ~14 MB). Se guarda junto con la "versión" del banco (total de
// preguntas visibles + última edición, ver la función `version_banco` en
// Supabase): si en el servidor no cambió nada, se usa lo guardado.
//
// Todo es best-effort: si IndexedDB no existe o falla (modo privado, cuota
// llena, navegador viejo), las funciones devuelven null / no hacen nada y la
// app sigue descargando de Supabase como antes.
import type { Pregunta } from '@/types'

const DB_NOMBRE = 'dentiquiz-banco'
const DB_VERSION = 1
const STORE = 'bancos'

export type BancoGuardado = { version: string; filas: Pregunta[] }

let dbPromise: Promise<IDBDatabase | null> | null = null

function abrirDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB_NOMBRE, DB_VERSION)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

export async function leerBancoGuardado(cursoId: string): Promise<BancoGuardado | null> {
  const db = await abrirDb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(cursoId)
      req.onsuccess = () => {
        const v = req.result as BancoGuardado | undefined
        resolve(v && typeof v.version === 'string' && Array.isArray(v.filas) ? v : null)
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function guardarBanco(cursoId: string, banco: BancoGuardado): Promise<void> {
  const db = await abrirDb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(banco, cursoId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

/** Borra todos los bancos guardados (p. ej. al cerrar sesión). */
export async function borrarBancosGuardados(): Promise<void> {
  const db = await abrirDb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    } catch {
      resolve()
    }
  })
}
