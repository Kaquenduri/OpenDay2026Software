import DecisionUnica from './DecisionUnica';

export default function Bugs({ decision, onElegir }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      encabezado={<h3>🐞 Bandeja de bugs</h3>}
    />
  );
}
