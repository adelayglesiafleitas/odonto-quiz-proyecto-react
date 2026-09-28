# Reglas del proyecto

## Idioma de la app: castellano neutro (obligatorio)

Todo texto que vea el usuario (UI, i18n, mensajes, tour, frases, notificaciones, correos, textos guardados en Supabase) se escribe en **castellano neutro**, tratando al usuario de **tú**.

**Prohibido:**
- Voseo: podés, tenés, querés, elegí, contanos, escribinos, mirá, probá, seguí, empezá, vos…
- Regionalismos rioplatenses/latinoamericanos: acá, celular, puntaje, rendir (un examen), armar (un examen), al toque, dale, metele, toda la pila, un montón, recital, aflojar…
- Regionalismos de España: vosotros, vale, móvil, ordenador, guay, mola, coger, trozo…

**Usar en su lugar:** aquí, teléfono, puntuación, hacer un examen, crear/preparar, al momento, vamos, mucho, fragmento.

**Cómo aplicarlo:**
- Antes de entregar cualquier cambio con textos nuevos, revisar que cumplan esta regla.
- Si se toca un archivo con textos que no la cumplen, corregirlos en el mismo cambio.
- El banco de preguntas (`src/data/*.json`) es contenido de examen: no se reescribe por esta regla.
- Los comentarios del código no son visibles al usuario y no hace falta cambiarlos.
