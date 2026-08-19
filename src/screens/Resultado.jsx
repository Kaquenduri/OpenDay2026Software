import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/useGame';
import { guardarPartida, obtenerTop } from '../lib/leaderboard';
import { limpiarPartida } from '../lib/storage';

export default function Resultado() {
  const { state, reiniciar } = useGame();
  const { escenario, jugador, resultado } = state;
  const guardadoRef = useRef(false);
  const [top, setTop] = useState([]);

  useEffect(() => {
    if (guardadoRef.current) return;
    guardadoRef.current = true;
    guardarPartida({
      nombre: jugador.nombre,
      colegio: jugador.colegio,
      escenario: escenario.id,
      puntaje: resultado.total,
      tiempoSeg: resultado.tiempoUsadoSeg,
    });
    limpiarPartida();
    setTop(obtenerTop(5));
  }, [escenario.id, jugador, resultado]);

  function jugarDeNuevo() {
    reiniciar();
  }

  return (
    <div>
      <h2>Misión completada</h2>
      <p>{resultado.epilogo.texto}</p>

      <h3>Puntaje: {resultado.total} / 1000</h3>
      <ul>
        <li>Decisiones: {resultado.puntajeDecisiones}</li>
        <li>Bonos especiales: {resultado.puntajeBonos}</li>
        <li>Bono de tiempo: {resultado.bonoTiempo}</li>
        <li>Penalización por pistas: -{resultado.penalizaciones}</li>
      </ul>

      <h3>Top 5 (esta PC, leaderboard local)</h3>
      <ol>
        {top.map((fila, i) => (
          <li key={i}>
            {fila.nombre} · {fila.colegio} · {fila.puntaje} pts
          </li>
        ))}
      </ol>

      <button type="button" onClick={jugarDeNuevo}>Jugar de nuevo</button>
    </div>
  );
}
