import { useEffect, useState } from 'react';

/* Simulador "Cazabugs": seis errores escondidos en el flujo de un lote de PixPro.
   Eliges qué pruebas corre el pipeline y ves cuáles atrapa cada una y cuánto tarda.
   Lección: cada tipo de prueba ve una parte distinta; la de carga es la que le faltó a la FAA.
   Tiempos ilustrativos. */

const PRUEBAS = [
  { id: 'unit', n: 'Unitarias', d: '300 pruebas, sin red', seg: 4, color: '#C6F33A' },
  { id: 'integ', n: 'Integración', d: 'API + base de datos real (Testcontainers)', seg: 90, color: '#6EA8FF' },
  { id: 'contrato', n: 'Contrato', d: 'eventos entre servicios', seg: 20, color: '#B78CFF' },
  { id: 'e2e', n: 'Extremo a extremo', d: 'navegador real (Playwright)', seg: 360, color: '#FFD166' },
  { id: 'carga', n: 'Carga', d: '500 fotógrafos a la vez (k6)', seg: 900, color: '#FF8A3D' },
];

const BUGS = [
  { id: 'b1', t: 'El avance muestra 102 %', capas: ['unit', 'e2e'], prod: 'Los fotógrafos ven porcentajes absurdos.' },
  { id: 'b2', t: 'La consulta usa una columna renombrada', capas: ['integ', 'e2e'], prod: 'La lista de lotes da error 500.' },
  { id: 'b3', t: 'El evento cambió «hechas» por «procesadas»', capas: ['contrato', 'e2e'], prod: 'El avance se queda en 0/50 para siempre.' },
  { id: 'b4', t: 'El botón Procesar no responde en móvil', capas: ['e2e'], prod: 'Nadie puede procesar desde el celular.' },
  { id: 'b5', t: 'El proxy corta el WebSocket a los 60 s', capas: ['e2e'], prod: 'Los lotes grandes nunca muestran el final.' },
  { id: 'b6', t: 'Con 500 fotógrafos el broker se satura', capas: ['carga'], prod: 'El lunes a las 9 todo se detiene, como la FAA.' },
];

const fmt = (s) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`);

export default function Cazabugs() {
  const [on, setOn] = useState({ unit: true, integ: false, contrato: false, e2e: false, carga: false });
  const [paso, setPaso] = useState(-1); // -1 sin correr · 0..n corriendo · n terminado
  const activas = PRUEBAS.filter((p) => on[p.id]);
  const fin = paso >= activas.length;
  useEffect(() => {
    if (paso < 0 || fin) return;
    const id = setTimeout(() => setPaso((x) => x + 1), 650);
    return () => clearTimeout(id);
  }, [paso, fin]);
  const corridas = paso < 0 ? [] : activas.slice(0, Math.min(paso + 1, activas.length)).map((p) => p.id);
  const atrapadoPor = (b) => PRUEBAS.find((p) => corridas.includes(p.id) && b.capas.includes(p.id));
  const atrapados = BUGS.filter(atrapadoPor).length;
  const tiempo = activas.reduce((s, p) => s + p.seg, 0);
  const cambiar = (id) => { setOn({ ...on, [id]: !on[id] }); setPaso(-1); };

  let msg = 'Elige qué pruebas corre el pipeline y toca «Correr pipeline».';
  if (fin) {
    if (atrapados === BUGS.length) msg = `Atrapaste los 6, pero el pipeline tarda ${fmt(tiempo)}. Por eso la de carga suele correr de noche o antes de una entrega grande.`;
    else if (!on.carga && atrapados === 5) msg = 'Solo se escapó el de carga: el laboratorio no tenía el tráfico real. Es justo lo que le pasó a la FAA.';
    else if (on.e2e && !on.integ && !on.contrato) msg = 'La de extremo a extremo atrapa mucho, pero tarda y no te dice dónde está el error. Las de integración y contrato lo señalan directo.';
    else msg = `${BUGS.length - atrapados} errores llegan a producción. Cada tipo de prueba ve una parte distinta del sistema.`;
  }

  return (
    <div className="sim cazabugs">
      <div className="sim-ctrl">
        {PRUEBAS.map((p) => (
          <label key={p.id} className="sim-tog caza-tog" style={{ '--c': p.color }}>
            <input type="checkbox" checked={on[p.id]} onChange={() => cambiar(p.id)} /> <b>{p.n}</b><span className="mono">{fmt(p.seg)}</span>
          </label>
        ))}
        <button className="btn" disabled={!activas.length || (paso >= 0 && !fin)} onClick={() => setPaso(0)}>▶ Correr pipeline</button>
      </div>
      <div className="caza-grid">
        {BUGS.map((b) => {
          const p = atrapadoPor(b);
          const est = p ? 'ok' : fin ? 'prod' : '';
          return (
            <div key={b.id} className={`caza-bug ${est}`} style={p ? { '--c': p.color } : null}>
              <span className="mono">{p ? `✓ atrapado por ${p.n.toLowerCase()}` : fin ? '✗ llegó a producción' : 'error escondido'}</span>
              <b>{b.t}</b>
              {fin && !p && <p>{b.prod}</p>}
            </div>
          );
        })}
      </div>
      <div className="caza-pie">
        <span className="mono">atrapados <b>{atrapados}/6</b></span>
        <span className="mono">tiempo del pipeline <b>{fmt(tiempo)}</b></span>
        <span className="mono">{paso >= 0 && !fin ? `corriendo: ${activas[paso]?.n}…` : ''}</span>
      </div>
      <p className={`sim-msg ${fin ? (atrapados === 6 ? 'ok' : 'bad') : ''}`}>{msg}</p>
    </div>
  );
}
