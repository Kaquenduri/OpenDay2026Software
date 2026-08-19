import { useState } from 'react';
import DecisionUnica from './DecisionUnica';

function SeleccionMultiple({ decision, onElegir }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const max = decision.seleccionExacta ?? decision.opciones.length;

  function alternar(opcionId) {
    if (confirmado) return;
    setSeleccionados((prev) => {
      if (prev.includes(opcionId)) return prev.filter((id) => id !== opcionId);
      if (prev.length >= max) return prev;
      return [...prev, opcionId];
    });
  }

  function confirmar() {
    if (confirmado) return;
    setConfirmado(true);
    onElegir(seleccionados);
  }

  return (
    <div>
      <p>{decision.pregunta} ({seleccionados.length}/{max})</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {decision.opciones.map((opcion) => (
          <li key={opcion.id} style={{ marginBottom: 4 }}>
            <label style={{ background: seleccionados.includes(opcion.id) ? '#ddd' : undefined }}>
              <input
                type="checkbox"
                disabled={confirmado}
                checked={seleccionados.includes(opcion.id)}
                onChange={() => alternar(opcion.id)}
              />
              {' '}{opcion.texto}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" disabled={confirmado || seleccionados.length !== max} onClick={confirmar}>
        Confirmar pantalla
      </button>
    </div>
  );
}

// La fase 'diseñar' mezcla decisiones de arrastrar varios elementos
// (seleccion-multiple) con decisiones de elegir una sola opción
// (seleccion-unica, ej. idioma o colores). Este componente atiende ambas.
export default function Wireframe({ decision, onElegir }) {
  if (decision.tipoInteraccion === 'seleccion-multiple') {
    return (
      <div>
        <h3>📱 Wireframe</h3>
        <SeleccionMultiple decision={decision} onElegir={onElegir} />
      </div>
    );
  }
  return <DecisionUnica decision={decision} onElegir={onElegir} encabezado={<h3>📱 Diseño de pantalla</h3>} />;
}
