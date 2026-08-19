import { useState } from 'react';
import { useGame } from '../engine/useGame';
import { minijuegoPorEstilo } from '../minigames';
import PlaceholderImagen from './PlaceholderImagen';

function formatearTiempo(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Cabecera({ escenario, faseIndex, tiempoGlobalRestante, tiempoFaseRestante, puntajeAcumulado }) {
  return (
    <header>
      <strong>⏱ {formatearTiempo(tiempoGlobalRestante)}</strong>
      {' · '}
      Fase {faseIndex + 1}/{escenario.fases.length} ({formatearTiempo(tiempoFaseRestante)})
      {' · '}
      Puntaje: {puntajeAcumulado}
    </header>
  );
}

// Se remonta (vía key={fase.id} en el padre) cada vez que cambia de fase,
// así que su estado de "¿ya vio la explicación?" siempre arranca en false.
function CuerpoFase({ fase, decisionIndex, respuestas, cabecera, responderDecision, siguienteDecision }) {
  const [explicacionVista, setExplicacionVista] = useState(false);

  if (!explicacionVista) {
    return (
      <div>
        {cabecera}
        <h2>{fase.titulo} · {fase.rol}</h2>
        <PlaceholderImagen texto={`Diagrama de la fase: ${fase.rol}`} src={fase.imagen} />
        {fase.intro && <p><em>{fase.intro}</em></p>}
        <p>{fase.explicacion}</p>
        <button type="button" onClick={() => setExplicacionVista(true)}>Entiendo, comenzar</button>
      </div>
    );
  }

  const decision = fase.decisiones[decisionIndex];
  const Minijuego = minijuegoPorEstilo[fase.estilo];
  const yaResuelta = !!respuestas[decision.id];

  function manejarElegir(opcionIds) {
    if (yaResuelta) return;
    responderDecision(decision.id, opcionIds);
  }

  return (
    <div>
      {cabecera}
      <h2>{fase.titulo} · {fase.rol}</h2>
      <Minijuego key={decision.id} decision={decision} onElegir={manejarElegir} />
      {yaResuelta && (
        <button type="button" onClick={siguienteDecision}>Continuar →</button>
      )}
    </div>
  );
}

export default function PantallaJuego() {
  const { state, responderDecision, siguienteDecision } = useGame();
  const { escenario, faseIndex, decisionIndex, tiempoGlobalRestante, tiempoFaseRestante, puntajeAcumulado, respuestas } = state;
  const fase = escenario.fases[faseIndex];

  const cabecera = (
    <Cabecera
      escenario={escenario}
      faseIndex={faseIndex}
      tiempoGlobalRestante={tiempoGlobalRestante}
      tiempoFaseRestante={tiempoFaseRestante}
      puntajeAcumulado={puntajeAcumulado}
    />
  );

  return (
    <CuerpoFase
      key={fase.id}
      fase={fase}
      decisionIndex={decisionIndex}
      respuestas={respuestas}
      cabecera={cabecera}
      responderDecision={responderDecision}
      siguienteDecision={siguienteDecision}
    />
  );
}
