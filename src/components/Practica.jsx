import { useState } from 'react';
import { ACTIVIDADES, ACTIVIDAD } from '../data/actividades.js';
import { store, celebrate } from '../lib/fx.js';
import Pregunta from './Pregunta.jsx';

/* Actividades en el celular: cada estudiante responde y ve al momento si acertó.
   Todo se guarda en su navegador (sin servidor, sin nombres). ?a=a2 abre una actividad. */
const KEY = 'sd5w9-practica';

export default function Practica() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [estado, setEstado] = useState(() => store.get(KEY) || { res: {} });
  const guardar = (s) => { setEstado(s); store.set(KEY, s); };
  const [act, setAct] = useState(params.get('a') && ACTIVIDAD[params.get('a')] ? params.get('a') : null);
  const [i, setI] = useState(0);

  const total = (a) => a.preguntas.reduce((s, q) => s + (estado.res[q.id]?.pts || 0), 0);
  const maximo = (a) => a.preguntas.filter((q) => q.type !== 'scale').length * 100;
  const global = ACTIVIDADES.reduce((s, a) => s + total(a), 0);

  if (!act) {
    return (
      <div className="page practica">
        <header className="sbar"><span className="who">Actividades · Semana 9</span><span className="chip mono">{global} pts</span></header>
        <main className="sbody">
          <p className="exp">Responde, toca <b>Comprobar</b> y lee la explicación. Tus respuestas se quedan solo en este celular.</p>
          <div className="act-lista">
            {ACTIVIDADES.map((a) => {
              const hechas = a.preguntas.filter((q) => estado.res[q.id]).length;
              return (
                <button key={a.id} className="act-item" style={{ '--c': a.color }} onClick={() => { setAct(a.id); setI(0); }}>
                  <span className="mono">Actividad {a.n} · {a.momento}</span><b>{a.nombre}</b>
                  <span className="mono">{hechas}/{a.preguntas.length} respondidas{hechas ? ` · ${total(a)}/${maximo(a)} pts` : ''}</span>
                </button>
              );
            })}
          </div>
          <p className="note center-t">Repasa también la <a href="#/presentacion">presentación</a> y los <a href="#/simuladores">simuladores</a>.</p>
        </main>
      </div>
    );
  }

  const a = ACTIVIDAD[act];
  const q = a.preguntas[i];
  const fin = i >= a.preguntas.length;
  const previo = q?.compare ? estado.res[q.compare]?.r : null;

  return (
    <div className="page practica">
      <header className="sbar">
        <button className="chip" onClick={() => setAct(null)}>← actividades</button>
        <span className="who">A{a.n} · {a.nombre}</span>
        <span className="chip mono">{total(a)} pts</span>
      </header>
      <main className="sbody">
        <div className="progreso-q">{a.preguntas.map((p, k) => <i key={p.id} className={k < i ? 'hecha' : k === i ? 'actual' : ''} />)}</div>
        {!fin ? (
          <div className="qcard">
            <Pregunta key={q.id} q={q} previo={previo} onResultado={(r, pts) => {
              guardar({ ...estado, res: { ...estado.res, [q.id]: { r, pts: pts || 0 } } });
              if (pts === 100) celebrate();
            }} />
            {estado.res[q.id] && <button className="btn sig" onClick={() => setI(i + 1)}>{i === a.preguntas.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button>}
          </div>
        ) : (
          <div className="qcard center-t">
            <p className="eyebrow">Actividad {a.n} terminada</p>
            <p className="big ok">{total(a)} / {maximo(a)} pts</p>
            <p className="exp">Si fallaste alguna, vuelve a leer su explicación: es justo lo que el profesor va a preguntar al revelar.</p>
            <div className="row-btns" style={{ justifyContent: 'center' }}>
              <button className="btn ghost" onClick={() => setI(0)}>Repetir</button>
              <button className="btn" onClick={() => setAct(null)}>Otras actividades</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
