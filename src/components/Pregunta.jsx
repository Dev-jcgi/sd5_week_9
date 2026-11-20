import { useEffect, useState } from 'react';
import { LETRAS, TIPO, puntaje } from '../data/actividades.js';

const TILE = ['tA', 'tB', 'tC', 'tD', 'tE'];
const BIN_C = ['#15A26B', '#E8672E', '#0E9DB0', '#D9930F', '#7C5CE6'];

/** Cuenta regresiva para la pantalla del salón (empieza al tocar). */
function Reloj({ t }) {
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => { if (!fin) return; const id = setInterval(() => setAhora(Date.now()), 250); return () => clearInterval(id); }, [fin]);
  const resta = fin ? Math.max(0, Math.ceil((fin - ahora) / 1000)) : t;
  return (
    <button className={`reloj mono ${fin && resta === 0 ? 'fin' : ''}`} onClick={() => setFin(Date.now() + t * 1000)} title="Iniciar cuenta regresiva">
      ⏱ {resta} s
    </button>
  );
}

/**
 * Una pregunta de actividad.
 * modo "practica": el estudiante responde y comprueba en su celular.
 * modo "pantalla": el profesor la proyecta, los equipos discuten y él revela la respuesta.
 */
export default function Pregunta({ q, modo = 'practica', onResultado, previo, revelar }) {
  const pantalla = modo === 'pantalla';
  // revelar definido = la sala en vivo decide cuándo se muestra la respuesta (el profesor la revela).
  const controlado = revelar !== undefined;
  const [r, setR] = useState(() => (q.type === 'classify' ? q.o.map(() => -1) : q.type === 'scale' ? q.o.map(() => 0) : q.type === 'order' ? [] : null));
  const [sel, setSel] = useState(0);
  const [listo, setListo] = useState(false);
  const ver = controlado ? !!revelar : listo;
  const bloq = pantalla || listo || ver;
  const pts = ver && listo && !pantalla ? puntaje(q, r) : null;

  const comprobar = () => { setListo(true); onResultado?.(r, puntaje(q, r)); };
  const completo = q.type === 'classify' ? r.every((x) => x > -1) : q.type === 'scale' ? r.every((x) => x > 0) : q.type === 'order' ? r.length === q.o.length : r != null;

  let cuerpo;
  if (q.type === 'quiz' || q.type === 'tf') {
    cuerpo = (
      <div className={`tiles ${q.o.length === 2 ? 'two' : ''}`}>
        {q.o.map((o, i) => {
          const ok = ver && i === q.a, mal = ver && r === i && i !== q.a;
          return (
            <button key={i} className={`tile ${TILE[i]} ${r === i ? 'picked' : ''} ${ver && !ok ? 'dim' : ''} ${ok ? 'right' : ''} ${mal ? 'wrong' : ''}`}
              disabled={bloq} onClick={() => setR(i)}>
              <span className="L">{LETRAS[i]}</span><span>{o}</span>{ok && <em className="mono">✓</em>}
            </button>
          );
        })}
      </div>
    );
  } else if (q.type === 'classify') {
    cuerpo = (
      <div className="cls-in">
        {!bloq && <p className="note mono">Toca una tarjeta y luego su categoría</p>}
        <div className="cls-cards">
          {q.o.map((o, i) => {
            const b = ver ? q.a[i] : r[i];
            const estado = ver && listo && !pantalla ? (r[i] === q.a[i] ? 'ok' : 'mal') : '';
            return (
              <button key={i} className={`cls-card ${!bloq && sel === i ? 'sel' : ''} ${estado}`} disabled={bloq}
                onClick={() => setSel(i)} style={b > -1 ? { borderColor: BIN_C[b] } : undefined}>
                <span>{o}</span>
                {b > -1 && <em className="mono" style={{ background: BIN_C[b] }}>{q.bins[b]}</em>}
                {estado === 'mal' && <small className="mono">tú: {q.bins[r[i]]}</small>}
              </button>
            );
          })}
        </div>
        {!bloq && (
          <div className="cls-bins" style={{ gridTemplateColumns: `repeat(${q.bins.length}, minmax(0, 1fr))` }}>
            {q.bins.map((b, j) => <button key={b} style={{ background: BIN_C[j] }} onClick={() => {
              const n = r.map((x, i) => (i === sel ? j : x)); setR(n); const sig = n.findIndex((x) => x === -1); if (sig > -1) setSel(sig);
            }}>{b}</button>)}
          </div>
        )}
        {pantalla && !ver && <p className="cls-binsline">{q.bins.map((b, j) => <em key={b} className="mono" style={{ background: BIN_C[j] }}>{b}</em>)}</p>}
      </div>
    );
  } else if (q.type === 'order') {
    const mostrar = ver ? q.a : null;
    cuerpo = (
      <div className="order">
        {(mostrar || q.o.map((_, i) => i)).map((i, k) => {
          const pos = ver ? k : r.indexOf(i);
          return (
            <button key={i} className={`ord ${pos > -1 ? 'on' : ''}`} disabled={bloq} onClick={() => !r.includes(i) && setR([...r, i])}>
              <span className="n">{pos > -1 ? pos + 1 : ''}</span><span>{q.o[i]}</span>
            </button>
          );
        })}
        {!bloq && r.length > 0 && <button className="btn ghost" onClick={() => setR([])}>Reiniciar orden</button>}
      </div>
    );
  } else if (q.type === 'scale') {
    cuerpo = (
      <div className="scale-in">
        <p className="note mono">1 = {q.lo} · 5 = {q.hi}{pantalla ? ' · levanten la mano con su número' : ''}</p>
        {q.o.map((o, i) => (
          <div key={i} className="srow"><span>{o}{previo && previo[i] ? <small className="mono"> · al inicio: {previo[i]}</small> : ''}</span>
            {!pantalla && <div className="sbtns">{[1, 2, 3, 4, 5].map((n) => <button key={n} className={r[i] === n ? 'on' : ''} disabled={listo || ver}
              onClick={() => setR(r.map((x, j) => (j === i ? n : x)))} aria-label={`${o}: ${n}`}>{n}</button>)}</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`pregunta ${pantalla ? 'pantalla' : ''}`}>
      <div className="qhead">
        <span className="chip">{TIPO[q.type]}</span>
        {pantalla ? <Reloj t={q.t} /> : <span className="chip mono">{q.t} s sugeridos</span>}
      </div>
      <h2 className="qtext">{q.q}</h2>
      {cuerpo}
      {!pantalla && !listo && !ver && <button className="btn" disabled={!completo} onClick={comprobar}>{controlado ? 'Enviar respuesta' : q.type === 'scale' ? 'Guardar' : 'Comprobar'}</button>}
      {controlado && listo && !ver && <p className="note enviada">✓ Respuesta enviada. Espera a que el profesor revele la respuesta.</p>}
      {controlado && !listo && ver && !pantalla && <p className="note">No alcanzaste a responder esta. Mira la respuesta:</p>}
      {pantalla && !controlado && q.type !== 'scale' && !listo && <button className="btn revelar" onClick={() => setListo(true)}>Revelar respuesta</button>}
      {ver && q.e && (
        <div className="explica">
          {pts != null && <p className={`big ${pts === 100 ? 'ok' : pts > 0 ? 'meh' : 'bad'}`}>{pts === 100 ? '¡Perfecto! +100' : pts > 0 ? `Casi: +${pts}` : 'Esta vez no: 0'}</p>}
          <p>{q.e}</p>
        </div>
      )}
      {listo && !controlado && q.type === 'scale' && !pantalla && <p className="note">Guardado en este celular. {q.compare ? 'Compáralo con tu termómetro del inicio.' : 'Al final de la clase lo vuelves a responder.'}</p>}
    </div>
  );
}
