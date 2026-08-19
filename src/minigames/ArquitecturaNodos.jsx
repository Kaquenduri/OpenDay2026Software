import { useEffect, useMemo, useRef, useState } from 'react';
import Mecanografia from './Mecanografia';
import '../styles/arquitectura.css';

// Una decisión de tipo 'arquitectura-nodos' orquesta una secuencia de pasos:
// el usuario activa y conecta nodos en un SVG, tipeando código en cada uno.
// Al terminar, devuelve UN solo puntaje al motor (suma de los pasos).
//
// Interacción al estilo Lucidchart:
//   - "Activar": clic en el nodo objetivo → abre mecanografía.
//   - "Conectar": clic en el nodo origen → se selecciona; el cursor arrastra
//     una línea visible desde el origen; clic en el nodo destino → cierra la
//     conexión y abre mecanografía. Esc o clic en el fondo cancela.
//
// Props:
//   decision   Decision (con metaMinijuego.nodos, pasos, narraciones)
//   onElegir   (opcionIds: string[], puntajeDirecto?: number) => void

export default function ArquitecturaNodos({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const nodos = useMemo(() => meta.nodos ?? [], [meta.nodos]);
  const pasos = useMemo(() => meta.pasos ?? [], [meta.pasos]);
  const narraciones = useMemo(() => meta.narraciones ?? [], [meta.narraciones]);

  const [pasoActual, setPasoActual] = useState(0);
  const [nodosActivos, setNodosActivos] = useState(new Set());
  const [conexiones, setConexiones] = useState(new Set());
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [esperandoPaso, setEsperandoPaso] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [pasoFase, setPasoFase] = useState('seleccionar');
  // Para "conectar": id del nodo origen actualmente seleccionado (esperando
  // que el usuario haga clic en el destino). null cuando no hay selección.
  const [nodoOrigenSeleccionado, setNodoOrigenSeleccionado] = useState(null);
  // Posición del cursor dentro del viewBox, para dibujar la línea en vivo.
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const yaNotificadoRef = useRef(false);

  // Cuando el último paso queda finalizado, notificamos al motor una sola vez.
  useEffect(() => {
    if (pasoFase !== 'finalizado') return;
    if (pasoActual + 1 < pasos.length) return;
    if (yaNotificadoRef.current) return;
    yaNotificadoRef.current = true;
    setTerminado(true);
    onElegir([pasos[0].id], puntosAcumulados);
  }, [pasoFase, pasoActual, pasos.length, puntosAcumulados, onElegir, pasos]);

  // Cancelar la selección con Esc.
  useEffect(() => {
    if (nodoOrigenSeleccionado === null) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setNodoOrigenSeleccionado(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodoOrigenSeleccionado]);

  const paso = pasos[pasoActual];

  function narracionPara(pasoId) {
    return narraciones.find((n) => n.antesDePaso === pasoId)?.texto ?? '';
  }

  // Si no hay paso definido, mostramos el estado vacío DESPUÉS de los hooks.
  if (!paso) {
    return <div className="arquitectura-vacia">No hay pasos definidos para esta decisión.</div>;
  }

  const nodoObjetivo = paso.tipo === 'activar' ? paso.nodoObjetivo : null;
  const nodoOrigen = paso.tipo === 'conectar' ? paso.nodoOrigen : null;
  const nodoDestino = paso.tipo === 'conectar' ? paso.nodoDestino : null;

  // Convierte coordenadas del cliente (event.clientX/Y) al viewBox del SVG.
  function clienteASvg(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vbW = 600;
    const vbH = 420;
    const x = ((clientX - rect.left) / rect.width) * vbW;
    const y = ((clientY - rect.top) / rect.height) * vbH;
    return { x, y };
  }

  function manejarMouseMoveSvg(e) {
    setMousePos(clienteASvg(e.clientX, e.clientY));
  }

  function manejarClickFondo() {
    // Clic en el SVG fuera de un nodo: cancela la selección actual.
    if (nodoOrigenSeleccionado !== null) {
      setNodoOrigenSeleccionado(null);
    }
  }

  function manejarClickNodo(nodoId) {
    if (esperandoPaso || terminado) return;
    if (pasoFase !== 'seleccionar') return;

    if (paso.tipo === 'activar') {
      if (nodoId !== nodoObjetivo) return;
      setNodosActivos((prev) => {
        const next = new Set(prev);
        next.add(nodoObjetivo);
        return next;
      });
      setEsperandoPaso(true);
      setPasoFase('mecanografia');
    } else if (paso.tipo === 'conectar') {
      const tengoOrigen = nodoOrigenSeleccionado !== null;
      if (!tengoOrigen) {
        // Primer clic: tiene que ser en el nodoOrigen.
        if (nodoId !== nodoOrigen) return;
        setNodoOrigenSeleccionado(nodoOrigen);
      } else {
        // Segundo clic: tiene que ser en el nodoDestino. Cualquier otro
        // nodo cancela la selección.
        if (nodoId !== nodoDestino) {
          setNodoOrigenSeleccionado(null);
          return;
        }
        setConexiones((prev) => {
          const next = new Set(prev);
          next.add(`${nodoOrigen}->${nodoDestino}`);
          return next;
        });
        setNodosActivos((prev) => {
          const next = new Set(prev);
          next.add(nodoDestino);
          return next;
        });
        setNodoOrigenSeleccionado(null);
        setEsperandoPaso(true);
        setPasoFase('mecanografia');
      }
    }
  }

  function manejarResolucionMecanografia(puntos) {
    setPuntosAcumulados((p) => p + puntos);
    setEsperandoPaso(false);
    setPasoFase('finalizado');
  }

  function irAlSiguientePaso() {
    setPasoActual((p) => p + 1);
    setNodoOrigenSeleccionado(null);
    setPasoFase('seleccionar');
  }

  // Para "conectar", el destino solo se "destaca" como válido cuando ya
  // hay un origen seleccionado.
  const hayOrigenSeleccionado = nodoOrigenSeleccionado !== null;

  function estiloNodo(nodoId) {
    const estaApagado = !nodosActivos.has(nodoId);
    if (estaApagado) {
      // El nodoOrigen, mientras está seleccionado, se ve en estado origen.
      if (paso.tipo === 'conectar' && nodoId === nodoOrigen && hayOrigenSeleccionado) {
        return 'nodo nodo-origen-seleccionado';
      }
      // El nodoDestino, mientras hay origen seleccionado, se "ilumina" como
      // destino válido.
      if (
        paso.tipo === 'conectar' &&
        nodoId === nodoDestino &&
        hayOrigenSeleccionado
      ) {
        return 'nodo nodo-destino';
      }
      return 'nodo nodo-apagado';
    }
    if (paso.tipo === 'activar' && nodoId === nodoObjetivo) return 'nodo nodo-objetivo';
    if (paso.tipo === 'conectar' && nodoId === nodoOrigen && hayOrigenSeleccionado) {
      return 'nodo nodo-origen-seleccionado';
    }
    if (paso.tipo === 'conectar' && nodoId === nodoDestino && hayOrigenSeleccionado) {
      return 'nodo nodo-destino';
    }
    return 'nodo nodo-activo';
  }

  function renderConexiones() {
    const conexionesArr = [...conexiones];
    return conexionesArr.map((cx) => {
      const [origen, destino] = cx.split('->');
      const o = nodos.find((n) => n.id === origen);
      const d = nodos.find((n) => n.id === destino);
      if (!o || !d) return null;
      return (
        <line
          key={cx}
          x1={o.x}
          y1={o.y}
          x2={d.x}
          y2={d.y}
          className="conexion"
        />
      );
    });
  }

  // Línea en vivo que sigue el cursor cuando hay un origen seleccionado.
  function renderLineaCursor() {
    if (!hayOrigenSeleccionado) return null;
    const origen = nodos.find((n) => n.id === nodoOrigenSeleccionado);
    if (!origen) return null;
    return (
      <line
        x1={origen.x}
        y1={origen.y}
        x2={mousePos.x}
        y2={mousePos.y}
        className="linea-cursor"
      />
    );
  }

  const pasoListoParaAvanzar =
    pasoFase === 'finalizado' && pasoActual + 1 < pasos.length && !terminado;

  if (terminado) {
    return (
      <div className="arquitectura-final">
        <div className="label-pixel">🏗️ ARQUITECTURA COMPLETADA</div>
        <div className="puntos-finales">
          <span className="valor">{puntosAcumulados}</span>
          <span className="etiqueta">pts acumulados</span>
        </div>
        <div className="feedback-final">
          Tu arquitectura está conectada. Mandemos la primera alerta de prueba.
        </div>
      </div>
    );
  }

  return (
    <div className="arquitectura">
      <div className="label-pixel">🏗️ ARQUITECTURA DE NODOS</div>
      <div className="arquitectura-puntos">
        <span>
          Pasos: {pasoActual + 1}/{pasos.length} · Puntos: <strong>{puntosAcumulados}</strong>
        </span>
        {hayOrigenSeleccionado && (
          <span className="hint-cancelar">Esc para cancelar</span>
        )}
      </div>

      <div className="arquitectura-narracion">
        <span className="etiqueta">Rosa:</span> {narracionPara(paso.id)}
      </div>

      <div className="arquitectura-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 600 420"
          className="arquitectura-svg"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={manejarMouseMoveSvg}
          onClick={manejarClickFondo}
        >
          {renderConexiones()}
          {renderLineaCursor()}
          {nodos.map((n) => (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y})`}
              onClick={(e) => {
                e.stopPropagation();
                manejarClickNodo(n.id, e);
              }}
              className={estiloNodo(n.id)}
              style={{ cursor: esperandoPaso ? 'wait' : 'crosshair' }}
            >
              <rect x={-65} y={-32} width={130} height={64} rx={10} />
              <text x={0} y={6} textAnchor="middle" className="nodo-label">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {pasoFase === 'mecanografia' && (
        <div className="arquitectura-modal">
          <div className="label-pixel">
            {paso.tipo === 'activar' ? '⌨️ ACTIVAR' : '⌨️ CONECTAR'} · {paso.codigo}
          </div>
          <Mecanografia
            codigo={paso.codigo}
            puntosMax={paso.puntosMax}
            puntosMin={paso.puntosMin}
            segundosParaSalto={paso.segundosParaSalto ?? 30}
            onResolver={manejarResolucionMecanografia}
          />
        </div>
      )}

      {pasoListoParaAvanzar && (
        <div className="arquitectura-footer">
          <button type="button" className="btn-primary" onClick={irAlSiguientePaso}>
            Siguiente paso →
          </button>
        </div>
      )}
    </div>
  );
}
