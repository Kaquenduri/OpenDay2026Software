import { useGame } from '../engine/useGame';
import { minijuegoPorEstilo } from '../minigames';

function formatearTiempo(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PantallaJuego() {
  const { state, responderDecision, siguienteDecision } = useGame();
  const { escenario, faseIndex, decisionIndex, tiempoGlobalRestante, tiempoFaseRestante, puntajeAcumulado } = state;

  const fase = escenario.fases[faseIndex];
  const decision = fase.decisiones[decisionIndex];
  const Minijuego = minijuegoPorEstilo[fase.estilo];
  const yaResuelta = !!state.respuestas[decision.id];

  function manejarElegir(opcionIds) {
    responderDecision(decision.id, opcionIds);
    setTimeout(() => siguienteDecision(), 1800);
  }

  return (
    <div>
      <header>
        <strong>⏱ {formatearTiempo(tiempoGlobalRestante)}</strong>
        {' · '}
        Fase {faseIndex + 1}/{escenario.fases.length} ({formatearTiempo(tiempoFaseRestante)})
        {' · '}
        Puntaje: {puntajeAcumulado}
      </header>
      <h2>{fase.titulo} · {fase.rol}</h2>
      {fase.intro && <p>{fase.intro}</p>}
      <Minijuego key={decision.id} decision={decision} onElegir={yaResuelta ? () => {} : manejarElegir} />
    </div>
  );
}
