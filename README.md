# Sismo Radar

Aplicación web que muestra los terremotos recientes del mundo (M2.5+) a partir de los feeds públicos del USGS, con estadísticas, filtros y ordenación en el cliente.


## Uso de IA

Todo el código ha sido generado por IA: Claude, modelo Sonnet 5.5 con esfuerzo medio. El prompt original incluía:
- La tarea y la rúbrica.
- Una lista de buenas prácticas a seguir, cogidas de la teoría.
- Una explicación de cómo hacerlo.

Así es cómo le pedí a la IA que trabaje:

># Cómo hacerlo
>
>1. Diseño: diseñar la aplicación y su funcionalidad
>2. Arquitectura: definir cómo será la implementación, con prototipos y pseudo-código
>3. Planificación: no se va a implementar todo de golpe, así que hay que dividir la implementación en pasos. Cada uno será un commit.
>4. Implementación: escribir el código.
>
>Debes hacer los pasos uno a uno, para que yo pueda validar lo que has hecho, corregir cosas, pedir cambios, etc, antes de pasar al siguiente. Igual para el 4, los pasos de la implementación definidos en la planificación debes hacerlos uno a uno para que yo pueda validar. Además, en esos pasos debes indicar dónde hacer los cambios, y sólo implementar los cambios, para así evitar reescribir código que no ha sido modificado.


## Autopsia

### 1. Feeds de resumen fijos en lugar del endpoint `query`

**Qué hice:** uso los feeds GeoJSON de resumen (`2.5_hour`, `2.5_day`, `2.5_week`, `2.5_month`). Cada periodo es una URL fija, sin parámetros, y el resto de filtros (magnitud mínima, texto, orden) se aplican en el cliente sobre los datos ya descargados.

**Por qué es discutible:**
- La magnitud mínima del feed está fija en 2.5. Aunque el usuario suba el slider a 6, se descargan igualmente todos los sismos del periodo. El feed de 30 días es el más pesado y es el que más se desperdicia.
- No se puede consultar un rango de fechas arbitrario ni una zona concreta, cosa que el endpoint `query` sí permite.

**Alternativa descartada:** el endpoint `query` (`/fdsnws/event/1/query`), construyendo la URL con `starttime`, `minmagnitude`, etc. Habría permitido filtrar en el servidor y descargar menos datos, pero obligaba a construir y validar parámetros, a repetir la petición en cada cambio del slider (con lo que aparecen la latencia y la gestión de peticiones solapadas) y a que la clave de caché dependiera de varios parámetros en lugar de solo del periodo.

### 2. Evitar peticiones solapadas deshabilitando el selector

**Qué hice:** mientras se carga un periodo, el selector de periodo está deshabilitado (`disabled`). Así no pueden existir dos peticiones en vuelo y no hay riesgo de que una respuesta antigua llegue tarde y pise a la nueva.

**Por qué es discutible:**
- Resuelve el síntoma en la interfaz, no en la lógica: `cargarSismos` por sí solo no es seguro ante llamadas concurrentes, y depende de que nadie más lo invoque mientras hay una carga en curso.
- Impide al usuario cambiar de opinión mientras espera (con una conexión lenta, tiene que esperar a que termine la carga o falle).
- Obligó a añadir después un campo `huboError` en el estado para que los filtros no sustituyeran el mensaje de error por datos de otro periodo. Es una pieza de estado más que mantener a mano.

**Alternativa descartada:** `AbortController` para cancelar la petición anterior al lanzar una nueva, o un identificador de petición para ignorar las respuestas que ya no son las últimas. Son más robustas y dejan el selector siempre activo, pero añaden lógica de cancelación, el tratamiento específico del `AbortError` (que no es un fallo real y no debe mostrarse como error) y más casos que probar.
