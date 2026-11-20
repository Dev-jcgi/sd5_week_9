import { useEffect, useRef, useState } from 'react';
import { estadoInicial, paso, HILOS, POR_SEG } from '../lib/disyuntor.js';

/* Simulador "¿Qué pasa cuando falla Miniaturas?": timeout, reintentos, disyuntor y plan B.
   El modelo vive en lib/disyuntor.js. Cada tick = 1 s simulado. */

const COL = { ok: '#C6F33A', degradado: '#6EA8FF', error: '#FF6B8B', rechazado: '#8A6BFF' };
const NOM = { ok: 'con miniatura', degradado: 'con icono genérico (plan B)', error: 'error', rechazado: 'rechazadas: la API se quedó sin hilos' };
const BR = [['cerrado', 'Cerrado', 'las llamadas pasan'], ['abierto', 'Abierto', 'falla rápido'], ['medio', 'Medio abierto', 'una de prueba']];

export default function Disyuntor() {
  const [cfg, setCfg] = useState({ timeout: false, reintentos: false, disyuntor: false, planB: false });
  const [mini, setMini] = useState('ok');
  const [corriendo, setCorriendo] = useState(false);
  const [e, setE] = useState(estadoInicial);
  const ref = useRef({ cfg, mini });
  ref.current = { cfg, mini };
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setE((x) => paso({ ...x, mini: ref.current.mini }, { ...ref.current.cfg, jitter: true })), 450);
    return () => clearInterval(id);
  }, [corriendo]);
  const tog = (k) => setCfg({ ...cfg, [k]: !cfg[k] });
  const u = e.ultimo || { ok: POR_SEG, degradado: 0, error: 0, rechazado: 0, hilos: 0, llamadas: 0 };
  const W = 600, H = 120, n = 60, bw = W / n;

  let msg = 'Toca ▶ y luego «Caída» en Miniaturas. Observa qué ve el fotógrafo y cuántos hilos ocupa la API.';
  if (corriendo && e.t > 2) {
    if (u.rechazado > 0) msg = `La API tiene sus ${HILOS} hilos esperando a Miniaturas: rechaza TODO, hasta lo que no necesita miniaturas. ${cfg.timeout ? (cfg.reintentos && !cfg.disyuntor ? 'Los reintentos multiplican la espera: prueba el disyuntor.' : 'Las peticiones que ya estaban atrapadas tardan en liberarse: espera unos segundos.') : 'Sin timeout, cada petición se queda esperando 15 s. Activa el timeout.'}`;
    else if (e.br === 'abierto') msg = cfg.planB ? 'Disyuntor abierto: no llama a Miniaturas, contesta al instante con un icono genérico. El fotógrafo sigue trabajando.' : 'Disyuntor abierto: ya no gasta hilos, pero el fotógrafo ve errores. Activa el plan B para degradar con elegancia.';
    else if (u.error > 0 && !cfg.planB) msg = 'El timeout salvó a la API, pero el fotógrafo ve errores. ¿Qué podría mostrar en lugar de la miniatura?';
    else if (u.degradado > 0) msg = 'Degradación elegante: falta la miniatura, pero el lote se crea y se sigue usando.';
    else if (mini === 'ok') msg = u.ok === POR_SEG ? 'Todo normal: 20 peticiones por segundo con miniatura.' : 'Recuperándose…';
  }

  return (
    <div className="sim disy">
      <div className="sim-ctrl">
        <button className="btn" onClick={() => setCorriendo(!corriendo)}>{corriendo ? 'Pausa' : '▶ Iniciar'}</button>
        <button className="cbtn" onClick={() => { setE(estadoInicial()); setMini('ok'); }}>↺ Reiniciar</button>
        <span className="mono sim-t">Miniaturas:</span>
        {[['ok', 'Normal'], ['lenta', 'Lenta (8 s)'], ['caida', 'Caída']].map(([k, t]) => <button key={k} className={`cbtn ${mini === k ? 'on' : ''} ${k === 'caida' ? 'danger' : ''}`} onClick={() => setMini(k)}>{t}</button>)}
      </div>
      <div className="sim-ctrl">
        {[['timeout', 'Timeout de 2 s'], ['reintentos', 'Reintentos ×3 (backoff + jitter)'], ['disyuntor', 'Disyuntor'], ['planB', 'Plan B: icono genérico']].map(([k, t]) => (
          <label key={k} className="sim-tog"><input type="checkbox" checked={cfg[k]} onChange={() => tog(k)} /> {t}</label>
        ))}
      </div>
      <div className="disy-grid">
        <div className="disy-br">
          <span className="mono">disyuntor {cfg.disyuntor ? '' : '(apagado)'}</span>
          {BR.map(([k, t, s]) => <div key={k} className={`br ${cfg.disyuntor && e.br === k ? `on ${k}` : ''}`}><b>{t}</b><span>{s}</span></div>)}
        </div>
        <div className="disy-met">
          <div><span className="mono">hilos ocupados de la API</span><div className="disy-bar"><i style={{ width: `${(100 * u.hilos) / HILOS}%` }} className={u.hilos >= HILOS ? 'lleno' : ''} /></div><b className="mono">{u.hilos}/{HILOS}</b></div>
          <div><span className="mono">llamadas a Miniaturas por segundo</span><b className="mono big">{u.llamadas}</b></div>
          <div className="disy-hoy">
            <span className="mono">lo que ven los fotógrafos este segundo</span>
            <div className="disy-stack">{Object.keys(COL).map((k) => u[k] ? <i key={k} style={{ flex: u[k], background: COL[k] }} title={`${u[k]} ${NOM[k]}`} /> : null)}</div>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="disy-chart" role="img" aria-label="Resultado de las peticiones en los últimos 60 segundos">
        {e.hist.map((h, i) => {
          let y = H; const tot = Math.max(1, h.total);
          return <g key={i}>{Object.keys(COL).map((k) => { const hh = (H * h[k]) / tot; y -= hh; return hh ? <rect key={k} x={i * bw} y={y} width={bw - 1} height={hh} fill={COL[k]} /> : null; })}</g>;
        })}
      </svg>
      <div className="disy-ley">{Object.keys(COL).map((k) => <span key={k}><i style={{ background: COL[k] }} />{NOM[k]}</span>)}</div>
      <p className="sim-msg">{msg}</p>
    </div>
  );
}
