import { useEffect, useState } from 'react';

/** Receso con cuenta regresiva de 10 minutos (empieza al tocar el botón). */
export function Receso() {
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => { if (!fin) return; const id = setInterval(() => setAhora(Date.now()), 500); return () => clearInterval(id); }, [fin]);
  const resta = fin ? Math.max(0, fin - ahora) : 10 * 60 * 1000;
  const mm = String(Math.floor(resta / 60000)).padStart(2, '0'), ss = String(Math.floor((resta % 60000) / 1000)).padStart(2, '0');
  return (
    <div className="d-break">
      <p className="d-eti">Minuto 60 · receso</p>
      <h1>Pausa de 10 minutos</h1>
      <p className="d-reloj mono" aria-live="polite">{mm}:{ss}</p>
      {!fin ? <button className="btn" onClick={() => setFin(Date.now() + 10 * 60 * 1000)}>Iniciar cuenta regresiva</button>
        : resta === 0 ? <p className="d-preg">¡Volvemos! Ya vemos los síntomas; ahora, ¿cómo encontramos la causa en la red?</p>
        : <p className="d-sub">Al volver: proxies, herramientas de red y los problemas que más se repiten.</p>}
      <div className="d-break-tip">
        <span className="mono">Mientras tanto</span>
        <p>Abran #/simuladores en el celular y prueben «Encuentra el culpable» con las tres quejas.</p>
      </div>
    </div>
  );
}

/** Línea de tiempo de la sesión de 120 minutos. */
export const AGENDA = [
  [0, 5, 'Inicio', '#3A4152', 'c'], [5, 17, 'Tema 1 · Caso FAA: un router detiene un país', '#FF6B8B', 't'], [17, 23, 'Actividad 1', '#FFD166', 'a'],
  [23, 40, 'Tema 2 · Pruebas de integración y extremo a extremo', '#C6F33A', 't'], [40, 55, 'Tema 3 · Métricas, registros y trazas', '#6EA8FF', 't'],
  [55, 60, 'Actividad 2', '#FFD166', 'a'], [60, 70, 'Receso', '#3A4152', 'b'], [70, 82, 'Tema 4 · Proxies y herramientas de red', '#B78CFF', 't'],
  [82, 92, 'Tema 5 · Problemas comunes', '#5CE1E6', 't'], [92, 97, 'Actividad 3', '#FFD166', 'a'], [97, 112, 'Tema 6 · Manejo de fallas', '#FF8A3D', 't'],
  [112, 120, 'Actividad 4 + cierre', '#FFD166', 'a'],
];
export function Agenda() {
  return (
    <div className="d-agenda">
      <div className="bar">
        {AGENDA.map(([a, b, t, c]) => <div key={a} style={{ flex: b - a, background: c }} title={`${a}–${b} min · ${t}`} />)}
      </div>
      <div className="rows">
        {AGENDA.map(([a, b, t, c, k]) => (
          <div key={a} className={`row ${k}`}><span className="mono">{String(a).padStart(3, '0')}–{String(b).padStart(3, '0')}</span><i style={{ background: c }} /><b>{t}</b></div>
        ))}
      </div>
    </div>
  );
}
