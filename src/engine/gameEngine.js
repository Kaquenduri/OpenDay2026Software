// Lógica pura de puntaje y progreso. No conoce narrativa: solo lee la forma
// del contrato descrito en docs/contrato-escenario.md.

export const TIEMPO_TOTAL_DEFAULT_SEG = 660; // 11 min
export const BONO_TIEMPO_MAX = 200;
export const PENALIZACION_PISTA = 20;

export function contarDecisionesTotales(escenario) {
  return escenario.fases.reduce((total, fase) => total + fase.decisiones.length, 0);
}

export function calcularPuntajeDecision(decision, opcionIds) {
  if (decision.tipoInteraccion === 'seleccion-multiple') {
    const correctas = opcionIds.filter((id) => {
      const opcion = decision.opciones.find((o) => o.id === id);
      return opcion?.esCorrecta;
    }).length;
    const puntaje = decision.tablaPuntaje?.[String(correctas)] ?? 0;
    return { puntaje, bono: 0 };
  }

  const opcion = decision.opciones.find((o) => o.id === opcionIds[0]);
  return {
    puntaje: opcion?.puntaje ?? 0,
    bono: opcion?.bonus?.puntos ?? 0,
  };
}

export function calcularBonoTiempo(tiempoRestanteSeg, tiempoTotalSeg) {
  if (tiempoTotalSeg <= 0) return 0;
  const proporcion = Math.max(0, Math.min(1, tiempoRestanteSeg / tiempoTotalSeg));
  return Math.round(BONO_TIEMPO_MAX * proporcion);
}

// respuestas: { [decisionId]: { opcionIds: string[], puntaje, bono, pistaUsada } }
export function calcularPuntajeFinal(escenario, respuestas, tiempoGlobalRestanteSeg) {
  let puntajeDecisiones = 0;
  let puntajeBonos = 0;
  let penalizaciones = 0;

  for (const respuesta of Object.values(respuestas)) {
    puntajeDecisiones += respuesta.puntaje;
    puntajeBonos += respuesta.bono;
    if (respuesta.pistaUsada) penalizaciones += PENALIZACION_PISTA;
  }

  const tiempoTotalSeg = escenario.tiempoTotalSeg ?? TIEMPO_TOTAL_DEFAULT_SEG;
  const bonoTiempo = calcularBonoTiempo(tiempoGlobalRestanteSeg, tiempoTotalSeg);
  const total = puntajeDecisiones + puntajeBonos + bonoTiempo - penalizaciones;

  return {
    puntajeDecisiones,
    puntajeBonos,
    bonoTiempo,
    penalizaciones,
    total: Math.max(0, Math.min(1000, total)),
  };
}

export function encontrarEpilogo(escenario, puntajeTotal) {
  const bucket = escenario.epilogos.find((e) => puntajeTotal >= e.min && puntajeTotal <= e.max);
  return bucket ?? escenario.epilogos[escenario.epilogos.length - 1];
}
