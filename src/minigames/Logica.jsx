import { useState } from 'react';

export default function Logica({ decision, onElegir }) {
  const [valor, setValor] = useState('');
  const [resuelto, setResuelto] = useState(false);
  const [opcionEncontrada, setOpcionEncontrada] = useState(null);
  const plantilla = decision.metaMinijuego?.plantillaCodigo ?? '';

  function ejecutar(e) {
    e.preventDefault();
    if (resuelto || !valor.trim()) return;
    const opcion = decision.opciones.find(
      (o) => o.texto.trim().toLowerCase() === valor.trim().toLowerCase(),
    );
    setOpcionEncontrada(opcion ?? null);
    setResuelto(true);
    onElegir(opcion ? [opcion.id] : []);
  }

  return (
    <div>
      <h3>🧩 Bloques de lógica</h3>
      <p>{decision.pregunta}</p>
      <pre style={{ background: '#eee', padding: 8 }}>
        {plantilla.replace('___', resuelto ? valor : '___')}
      </pre>
      <form onSubmit={ejecutar}>
        <input
          type="text"
          value={valor}
          disabled={resuelto}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Escribe aquí"
        />
        <button type="submit" disabled={resuelto || !valor.trim()}>▶ RUN</button>
      </form>
      {resuelto && (
        <pre style={{ background: '#111', color: '#0f0', padding: 8 }}>
          {opcionEncontrada ? opcionEncontrada.feedback : decision.feedbackSinCoincidencia}
        </pre>
      )}
    </div>
  );
}
