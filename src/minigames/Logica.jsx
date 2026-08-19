import { useState } from 'react';

export default function Logica({ decision, onElegir }) {
  const [elegidaId, setElegidaId] = useState(null);
  const opcionElegida = decision.opciones.find((o) => o.id === elegidaId);
  const plantilla = decision.metaMinijuego?.plantillaCodigo ?? '';

  function elegir(opcionId) {
    if (elegidaId) return;
    setElegidaId(opcionId);
    onElegir([opcionId]);
  }

  return (
    <div>
      <h3>🧩 Bloques de lógica</h3>
      <p>{decision.pregunta}</p>
      <pre style={{ background: '#eee', padding: 8 }}>
        {plantilla.replace('___', opcionElegida ? opcionElegida.texto : '___')}
      </pre>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {decision.opciones.map((opcion) => (
          <li key={opcion.id} style={{ marginBottom: 4 }}>
            <button
              type="button"
              disabled={!!elegidaId}
              onClick={() => elegir(opcion.id)}
              style={{ background: elegidaId === opcion.id ? '#ddd' : undefined }}
            >
              {opcion.texto}
            </button>
          </li>
        ))}
      </ul>
      {opcionElegida && (
        <div>
          <p>▶ RUN</p>
          <pre style={{ background: '#111', color: '#0f0', padding: 8 }}>{opcionElegida.feedback}</pre>
        </div>
      )}
    </div>
  );
}
