import { useState } from 'react';
import DecisionUnica from './DecisionUnica';

function SeleccionMultiple({ decision, onElegir }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);
  const max = decision.seleccionExacta ?? decision.opciones.length;

  const disponibles = decision.opciones.filter((o) => !seleccionados.includes(o.id));
  const puestos = seleccionados.map((id) => decision.opciones.find((o) => o.id === id));

  function agregar(opcionId) {
    if (confirmado || seleccionados.includes(opcionId) || seleccionados.length >= max) return;
    setSeleccionados((prev) => [...prev, opcionId]);
  }

  function quitar(opcionId) {
    if (confirmado) return;
    setSeleccionados((prev) => prev.filter((id) => id !== opcionId));
  }

  function confirmar() {
    if (confirmado) return;
    setConfirmado(true);
    onElegir(seleccionados);
  }

  return (
    <div>
      <p>{decision.pregunta} ({seleccionados.length}/{max})</p>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <p><strong>Elementos disponibles</strong> (arrástralos a la pantalla →)</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {disponibles.map((opcion) => (
              <li key={opcion.id} style={{ marginBottom: 4 }}>
                <div
                  draggable={!confirmado}
                  onDragStart={() => setArrastrando(opcion.id)}
                  onDragEnd={() => setArrastrando(null)}
                  onClick={() => agregar(opcion.id)}
                  style={{ border: '1px solid #999', padding: 8, cursor: 'grab', background: '#fafafa' }}
                >
                  {opcion.texto}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          data-testid="zona-destino-wireframe"
          style={{ flex: 1, border: '2px dashed #999', minHeight: 160, padding: 8 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (arrastrando) agregar(arrastrando);
          }}
        >
          <p><strong>Pantalla del celular del portero</strong></p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {puestos.map((opcion) => (
              <li key={opcion.id} style={{ marginBottom: 4 }}>
                <div
                  onClick={() => quitar(opcion.id)}
                  style={{ border: '1px solid #4a4', padding: 8, background: '#eaffea', cursor: 'pointer' }}
                >
                  {opcion.texto} ✕
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
