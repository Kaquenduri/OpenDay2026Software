import DecisionUnica from './DecisionUnica';

export default function Entrevista({ decision, onElegir }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      encabezado={<h3>📞 Videollamada con el cliente</h3>}
    />
  );
}
