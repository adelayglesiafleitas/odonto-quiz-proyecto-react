// Importa las 4 asignaturas (src/data/*.json) a la tabla Supabase `preguntas`.
// Correr UNA sola vez desde la raíz de odonto-quiz-proyecto-react:
//   node importar-preguntas.mjs
//
// Requiere Node 18+ (fetch nativo). No modifica ni borra ningún archivo local.
// Es seguro correrlo de nuevo si se corta a mitad de camino: la tabla tiene un
// índice único (asignatura, numero) — las filas ya insertadas se rechazan
// silenciosamente (error 23505) y el script sigue con las que faltan.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = 'https://vhevgywxypzisoeqwamz.supabase.co';
// Anon key pública (la misma que ya usa la app en el navegador) — no es secreta.
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZXZneXd4eXB6aXNvZXF3YW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzIxNTQsImV4cCI6MjA5OTgwODE1NH0.J6IyfUQFeUtJBorXU3SEE-xGpaMLX3GgkYIrcG58d5w';

const ARCHIVOS = ['materiales.json', 'odontologia.json', 'psicologia.json', 'ortodoncia.json'];
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const BATCH = 1000;

async function postBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/preguntas`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const texto = await res.text();
    // 23505 = fila duplicada (ya importada antes) — no es un error real, se ignora.
    if (texto.includes('23505')) return 'duplicados (ya estaban)';
    throw new Error(`HTTP ${res.status}: ${texto.slice(0, 300)}`);
  }
  return 'ok';
}

async function importarArchivo(nombre) {
  const ruta = path.join(DATA_DIR, nombre);
  const data = JSON.parse(await readFile(ruta, 'utf-8'));
  console.log(`\n${nombre}: ${data.length} preguntas`);
  for (let i = 0; i < data.length; i += BATCH) {
    const chunk = data.slice(i, i + BATCH);
    const rows = chunk.map((p) => ({
      asignatura: p.asignatura,
      numero: p.numero,
      capitulo: p.capitulo,
      anio: p.anio ?? 0,
      pregunta: p.pregunta,
      opciones: p.opciones,
      bibliografia: p.bibliografia ?? null,
      caso: p.caso ?? null,
    }));
    let estado;
    try {
      estado = await postBatch(rows);
    } catch (err) {
      // Si falla por duplicados en el batch, reintenta fila por fila para no
      // perder las que sí son nuevas dentro del mismo batch.
      let ok = 0, dup = 0, fallos = 0;
      for (const row of rows) {
        try {
          await postBatch([row]);
          ok++;
        } catch (e2) {
          if (String(e2.message).includes('23505')) dup++;
          else { fallos++; console.error('  fila con error:', row.numero, e2.message.slice(0, 150)); }
        }
      }
      estado = `${ok} nuevas, ${dup} duplicadas, ${fallos} con error`;
    }
    console.log(`  filas ${i}-${i + chunk.length} de ${data.length} -> ${estado}`);
  }
}

for (const archivo of ARCHIVOS) {
  await importarArchivo(archivo);
}
console.log('\nListo.');
