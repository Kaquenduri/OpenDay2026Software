// El contrato de escenario reserva campos `imagen` (cliente, fase) para
// cuando la etapa de diseño entregue retratos, diagramas e íconos reales.
// Mientras tanto, esto ocupa su lugar sin bloquear el layout.
export default function PlaceholderImagen({ texto, src }) {
  if (src) return <img src={src} alt={texto} style={{ maxWidth: '100%' }} />;

  return (
    <div
      style={{
        border: '1px dashed #999',
        background: '#f0f0f0',
        color: '#777',
        padding: 16,
        textAlign: 'center',
        margin: '8px 0',
      }}
    >
      🖼 {texto}
    </div>
  );
}
