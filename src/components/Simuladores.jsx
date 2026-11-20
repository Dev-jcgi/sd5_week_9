import { useState } from 'react';
import Cazabugs from './Cazabugs.jsx';
import Traza from './Traza.jsx';
import Diagnostico from './Diagnostico.jsx';
import Disyuntor from './Disyuntor.jsx';

/* Los tres simuladores de la semana, para repasar en el celular o la computadora. */
const SIMS = [
  { id: 'caza', n: 'Cazabugs', d: 'Seis errores escondidos en PixPro: elige qué pruebas corre el pipeline.', C: Cazabugs },
  { id: 'traza', n: 'Encuentra el culpable', d: 'Tres quejas de fotógrafos, cada una con su traza y sus registros.', C: Traza },
  { id: 'diag', n: 'Consola de diagnóstico', d: 'Corre comandos de red y elige el diagnóstico de tres incidentes.', C: Diagnostico },
  { id: 'disy', n: 'Disyuntor', d: 'Tumba el servicio de miniaturas y prueba timeout, reintentos, disyuntor y plan B.', C: Disyuntor },
];

export default function Simuladores() {
  const [s, setS] = useState(() => SIMS.find((x) => x.id === new URLSearchParams(location.hash.split('?')[1] || '').get('s'))?.id || 'caza');
  const sim = SIMS.find((x) => x.id === s);
  return (
    <div className="page sims8">
      <div className="sims8-tabs">{SIMS.map((x) => <button key={x.id} className={`cbtn ${s === x.id ? 'on' : ''}`} onClick={() => setS(x.id)}>{x.n}</button>)}</div>
      <h1 className="h-lg">{sim.n}</h1>
      <p className="exp">{sim.d} Es una simulación en tu navegador con números ilustrativos.</p>
      <sim.C key={s} />
    </div>
  );
}
