import EstadoCliente from './EstadoCliente';
import '../styles/cliente-flotante.css';

// Overlay fijo del cliente. Vive en una esquina de la pantalla y nunca
// desaparece: aparece en el intro de fase, durante el minijuego, en el
// resultado. Es un elemento flotante que siempre está por encima de la UI.
//
// Props:
//   texto   string  - el mensaje que muestra la burbuja (intro de fase,
//                     mensajeClienteDecision, o lo que sea)
//   estado  string  - 'idle' | 'feliz' | 'confundido' | 'molesto' | 'sorprendido'
//
// Si el texto está vacío, igual muestra el emoji (la burbuja queda oculta).

export default function ClienteFlotante({ texto, estado = 'idle' }) {
  return (
    <div className="cliente-flotante" aria-live="polite">
      <div className="avatar">
        <EstadoCliente estado={estado} />
      </div>
      {texto && (
        <div className="burbuja">
          <div className="texto">{texto}</div>
          <div className="pico" />
        </div>
      )}
    </div>
  );
}
