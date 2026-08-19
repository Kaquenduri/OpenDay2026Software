import Entrevista from './Entrevista';
import Wireframe from './Wireframe';
import Logica from './Logica';
import Bugs from './Bugs';
import Deploy from './Deploy';

// estilo (dato cosmético del JSON de escenario) -> componente de minijuego.
export const minijuegoPorEstilo = {
  entrevista: Entrevista,
  wireframe: Wireframe,
  logica: Logica,
  bugs: Bugs,
  deploy: Deploy,
};
