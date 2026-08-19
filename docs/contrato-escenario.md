# Contrato del JSON de escenario

Un escenario = un archivo en `src/content/<id>.json`. El motor (`src/engine/`) no
conoce narrativa: solo sabe leer este contrato y ejecutar las 5 fases en orden.
Agregar un escenario nuevo (B, C, D...) es agregar un JSON que cumpla este
contrato, sin tocar el motor.

## Ideas clave del diseño

- El motor solo entiende **dos tipos de interacción**: `seleccion-unica` y
  `seleccion-multiple`. El campo `estilo` de cada fase es puramente cosmético
  (le dice a `src/minigames/` qué componente renderizar) y no afecta el
  puntaje.
- Cada fase tiene 2-3 `decisiones`. Entre las 5 fases suman exactamente
  **12 decisiones**, cada una puntúa 0/30/60 (hasta 720 en total).
- Bonos especiales (`bugCritico`, `usuarioReal`, hasta 80 pts combinados) van
  colgados del campo `bonus` de la opción correcta, no como lógica aparte.
- El bono de tiempo restante (hasta 200 pts) y el descuento de pista (-20 c/u)
  los calcula el motor; no viven en el JSON salvo el `pistaTexto` opcional que
  habilita el descuento si el jugador la pide.
- Timer global: default 660s (11 min) en el motor, puede sobreescribirse con
  `tiempoTotalSeg` en el JSON. Timer por fase: `tiempoSegFase`, auto-avanza al
  vencer (las decisiones sin responder puntúan 0).

## Esquema

```
Escenario
├─ id: string                          // 'ccorca', usado en localStorage y Supabase
├─ titulo: string
├─ cliente: { nombre, rol, dolorFrase } // dolorFrase: máx 2 líneas
├─ tiempoTotalSeg?: number              // opcional, default 660
├─ fases: Fase[5]                       // orden fijo: descubrir, disenar, construir, probar, desplegar
└─ epilogos: Epilogo[]                  // buckets por rango de puntaje, orden no importa

Fase
├─ id: 'descubrir'|'disenar'|'construir'|'probar'|'desplegar'
├─ rol: string                          // 'Analista', 'Diseñador UX', ... (para el HUD/insignias)
├─ titulo: string
├─ intro?: string                       // diálogo del cliente, máx 2 líneas
├─ tiempoSegFase: number                // segundos antes del auto-avance
├─ estilo: 'entrevista'|'wireframe'|'logica'|'bugs'|'deploy'  // solo cosmético
└─ decisiones: Decision[2-3]

Decision
├─ id: string                           // único en el escenario, ej 'descubrir-1'
├─ tipoInteraccion: 'seleccion-unica' | 'seleccion-multiple'
├─ pregunta: string                     // máx 2 líneas
├─ pistaTexto?: string                  // si existe, el jugador puede pedirla (-20 pts)
├─ metaMinijuego?: object               // datos de flavor para el render (ej. plantillaCodigo)
├─ seleccionExacta?: number             // solo seleccion-multiple: cuántas debe elegir
├─ tablaPuntaje?: { [conteoCorrectos: string]: number }  // solo seleccion-multiple
└─ opciones: Opcion[]

Opcion
├─ id: string
├─ texto: string
├─ puntaje?: number                     // 0|30|60, solo seleccion-unica
├─ esCorrecta?: boolean                 // solo seleccion-multiple
├─ esTrampa?: boolean                   // cosmético/feedback, no cambia el puntaje
├─ descubrimiento?: string              // texto revelado al elegir (usado en 'entrevista')
├─ feedback?: string                    // el "por qué", se muestra al resolver la decisión
└─ bonus?: { tipo: 'bugCritico'|'usuarioReal', puntos: number }

Epilogo
├─ min: number
├─ max: number
└─ texto: string
```

### Cómo puntúa el motor una decisión

- `seleccion-unica`: puntaje de la opción elegida.
- `seleccion-multiple`: cuenta cuántas de las opciones elegidas tienen
  `esCorrecta: true` y busca ese conteo como clave en `tablaPuntaje`
  (ej. `tablaPuntaje["4"]` si eligió 4 correctas). Si la clave no existe, 0.
- Si la opción elegida trae `bonus`, esos puntos se suman aparte al total de
  bonos especiales (tope 80 en todo el escenario, pero el motor no lo capea
  explícitamente: el contenido debe cuidar no pasarse).
- Si se pidió la pista de esa decisión, se restan 20 puntos (una sola vez por
  decisión).

## Ejemplo comentado (extracto del escenario A · Ccorca)

```jsonc
{
  "id": "ccorca",
  "titulo": "Luz para Ccorca",
  "cliente": {
    "nombre": "Rosa",
    "rol": "Profesora",
    "dolorFrase": "Las baterías se descargan sin aviso y los chicos pierden clases de computación."
  },
  "tiempoTotalSeg": 660,
  "fases": [
    {
      "id": "descubrir",
      "rol": "Analista",
      "titulo": "Fase 1 · Descubrir",
      "intro": "Videollamada con la profesora Rosa. Tienes tiempo para 3 preguntas.",
      "tiempoSegFase": 132,
      "estilo": "entrevista",
      "decisiones": [
        {
          "id": "descubrir-1",
          "tipoInteraccion": "seleccion-unica",
          "pregunta": "Elige tu primera pregunta para Rosa",
          "opciones": [
            {
              "id": "quien-revisa",
              "texto": "¿Quién revisa las baterías hoy?",
              "puntaje": 60,
              "esTrampa": false,
              "descubrimiento": "Es el portero, y no sabe leer el medidor.",
              "feedback": "Bien: ahora sabes quién opera el sistema día a día."
            },
            {
              "id": "color-app",
              "texto": "¿Qué color prefiere para la app?",
              "puntaje": 0,
              "esTrampa": true,
              "descubrimiento": "Pierdes tu pregunta en algo que no importa aún.",
              "feedback": "Programar sin entender el problema es la forma más cara de fallar."
            }
          ]
        }
      ]
    },
    {
      "id": "disenar",
      "rol": "Diseñador UX",
      "titulo": "Fase 2 · Diseñar",
      "tiempoSegFase": 132,
      "estilo": "wireframe",
      "decisiones": [
        {
          "id": "disenar-1",
          "tipoInteraccion": "seleccion-multiple",
          "pregunta": "Arrastra 4 elementos a la pantalla del portero",
          "seleccionExacta": 4,
          "tablaPuntaje": { "4": 60, "3": 30, "2": 30, "1": 0, "0": 0 },
          "opciones": [
            { "id": "boton-grande", "texto": "Botón gigante verde/rojo", "esCorrecta": true },
            { "id": "dashboard-12", "texto": "Dashboard con 12 gráficos", "esCorrecta": false }
          ]
        }
      ]
    }
  ],
  "epilogos": [
    { "min": 800, "max": 1000, "texto": "3 meses después, el colegio no perdió una sola clase de computación." },
    { "min": 400, "max": 799, "texto": "El sistema funciona casi siempre, aunque a veces Rosa tiene que llamar para avisar." },
    { "min": 0,   "max": 399, "texto": "La app quedó instalada en un solo celular y nadie la usó." }
  ]
}
```

El escenario A completo (12 decisiones, 5 fases) vive en
`src/content/ccorca.json` siguiendo exactamente esta forma.
