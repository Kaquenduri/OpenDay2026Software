import { GameProvider } from './engine/GameContext';
import { useGame } from './engine/useGame';
import Registro from './screens/Registro';
import SeleccionEscenario from './screens/SeleccionEscenario';
import PantallaJuego from './screens/PantallaJuego';
import Resultado from './screens/Resultado';

const PANTALLAS = {
  registro: Registro,
  'seleccion-escenario': SeleccionEscenario,
  jugando: PantallaJuego,
  resultado: Resultado,
};

function Juego() {
  const { state } = useGame();
  const Pantalla = PANTALLAS[state.pantalla];
  return <Pantalla />;
}

export default function App() {
  return (
    <GameProvider>
      <Juego />
    </GameProvider>
  );
}
