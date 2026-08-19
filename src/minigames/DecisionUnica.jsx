import { useState } from 'react';

// Render compartido para tipoInteraccion: 'seleccion-unica'.
// Los 5 minijuegos lo usan (salvo Wireframe, que es seleccion-multiple).
export default function DecisionUnica({ decision, onElegir, encabezado }) {
  const [elegidaId, setElegidaId] = useState(null);
  const opcionElegida = decision.opciones.find((o) => o.id === elegidaId);

  function elegir(opcionId) {
    if (elegidaId) return;
    setElegidaId(opcionId);
    onElegir([opcionId]);
  }

  return (
    <div>
      {encabezado}
      <p>{decision.pregunta}</p>
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
          {opcionElegida.descubrimiento && <p>💬 {opcionElegida.descubrimiento}</p>}
          {opcionElegida.feedback && <p><em>{opcionElegida.feedback}</em></p>}
        </div>
      )}
    </div>
  );
}
