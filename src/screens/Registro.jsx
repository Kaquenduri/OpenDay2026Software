import { useState } from 'react';
import { useGame } from '../engine/useGame';

export default function Registro() {
  const { registrarJugador } = useGame();
  const [nombre, setNombre] = useState('');
  const [colegio, setColegio] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (!nombre.trim() || !colegio.trim()) return;
    registrarJugador({ nombre: nombre.trim(), colegio: colegio.trim() });
  }

  return (
    <div>
      <h1>MISIÓN DEPLOY</h1>
      <p>Tu nombre y colegio se mostrarán en la pantalla del ranking durante el evento.</p>
      <form onSubmit={enviar}>
        <div>
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Colegio
            <input value={colegio} onChange={(e) => setColegio(e.target.value)} required />
          </label>
        </div>
        <button type="submit">ACEPTAR MISIÓN</button>
      </form>
    </div>
  );
}
