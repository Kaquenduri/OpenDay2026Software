import { useGame } from '../engine/useGame';
import ccorca from '../content/ccorca.json';

// Escenarios B y C se agregan aquí como solo-contenido, sin tocar el motor.
const ESCENARIOS_DISPONIBLES = [ccorca];

export default function SeleccionEscenario() {
  const { iniciarPartida } = useGame();

  return (
    <div>
      <h2>Elige tu misión</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {ESCENARIOS_DISPONIBLES.map((escenario) => (
          <li key={escenario.id} style={{ marginBottom: 8 }}>
            <button type="button" onClick={() => iniciarPartida(escenario)}>
              {escenario.titulo}
            </button>
            <p>{escenario.cliente.dolorFrase}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
