import { useEffect, useState } from 'react';
import { api } from '../lib/backend.js';
import { PREGUNTA, restante } from '../lib/sala.js';
import { Reloj } from '../deck/vivo.jsx';
import { ACTIVIDAD } from '../data/actividades.js';
import { store, celebrate } from '../lib/fx.js';
import Pregunta from './Pregunta.jsx';

/* El celular del estudiante en la clase en vivo (#/sala?pin=123456).
   Se escanea UNA vez: las preguntas llegan solas cuando el profesor las envía,
   y la respuesta correcta aparece cuando él la revela. Solo se pide un apodo. */
const KEY = 'sd5w9-estudiante';

function Unirse({ onListo }) {
  const guardado = store.get(KEY) || {};
  const [pin, setPin] = useState(new URLSearchParams(location.hash.split('?')[1] || '').get('pin') || guardado.pin || '');
  const [nick, setNick] = useState(guardado.nick || '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const entrar = async (e) => {
    e.preventDefault();
    const p = pin.trim(), n = nick.trim().slice(0, 20);
    if (!/^\d{6}$/.test(p)) return setMsg('El PIN tiene 6 dígitos. Está en la pantalla del salón.');
    if (!n) return setMsg('Escribe un apodo (no hace falta tu nombre real).');
    setBusy(true); setMsg('');
    try {
      const uid = await api.ensureStudent();
      const room = await api.getRoom(p);
      if (!room || room.closed || room.week !== 9) { setBusy(false); return setMsg('No hay una clase abierta con ese PIN. Revisa el número en la pantalla.'); }
      const ya = await new Promise((res) => { const un = api.watchPlayers(p, (ps) => { setTimeout(() => un(), 0); res(ps.find((x) => x.id === uid)); }); });
      if (!ya) await api.joinRoom(p, uid, n);
      store.set(KEY, { pin: p, nick: n });
      onListo({ pin: p, uid, nick: ya ? ya.nick : n });
    } catch (err) {
      console.error(err); setBusy(false);
      setMsg('No se pudo entrar. Revisa tu conexión e inténtalo otra vez.');
    }
  };
  return (
    <form className="panel narrow" onSubmit={entrar}>
      <p className="eyebrow">DS5 · Semana 9 · clase en vivo</p>
      <h1 className="h-lg">Entra a la clase</h1>
      <p className="exp">Solo esta vez. Después, las preguntas te llegan solas a esta pantalla.</p>
      <div className="field"><label htmlFor="pin">PIN</label><input id="pin" inputMode="numeric" maxLength={6} autoComplete="off" placeholder="000000" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></div>
      <div className="field"><label htmlFor="nick">Tu apodo</label><input id="nick" autoFocus={!!pin} maxLength={20} placeholder="p. ej. Jitter_Ninja" value={nick} onChange={(e) => setNick(e.target.value)} /></div>
      <button className="btn" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      {msg && <p className="note bad" role="alert">{msg}</p>}
    </form>
  );
}

export default function Sala() {
  const [yo, setYo] = useState(null);
  const [room, setRoom] = useState(undefined);
  const [players, setPlayers] = useState([]);
  const [mias, setMias] = useState({});
  const [, refrescar] = useState(0);

  useEffect(() => {
    if (!yo) return;
    const a = api.watchRoom(yo.pin, setRoom), b = api.watchPlayers(yo.pin, setPlayers), c = api.watchMyAnswers(yo.pin, yo.uid, setMias);
    return () => { a(); b(); c(); };
  }, [yo]);

  const mio = players.find((p) => p.id === yo?.uid);
  const puntos = mio?.score || 0;
  const q = room?.qid ? PREGUNTA[room.qid] : null;
  const revelada = room?.status === 'reveal';
  const res = q && mio?.results?.[q.id];
  useEffect(() => { if (revelada && res?.ok) celebrate(); }, [revelada, res?.ok]);

  if (!yo) return <div className="page sala8"><Unirse onListo={setYo} /></div>;

  const enviar = async (r) => {
    try { await api.submitAnswer(yo.pin, yo.uid, q.id, { r, ms: Date.now() }); }
    catch (e) { console.error(e); }
  };

  let cuerpo;
  if (room === undefined) cuerpo = <p className="exp center-t">Conectando…</p>;
  else if (!room || room.closed || room.status === 'fin') {
    const orden = [...players].sort((x, y) => (y.score || 0) - (x.score || 0));
    const lugar = orden.findIndex((p) => p.id === yo.uid) + 1;
    cuerpo = (
      <div className="qcard center-t">
        <p className="eyebrow">Clase terminada</p>
        <p className="big ok">{puntos} pts</p>
        {lugar > 0 && <p className="exp">Lugar {lugar} de {orden.length}.</p>}
        <p className="note">Repasa cuando quieras en <a href="#/actividades">actividades</a> y <a href="#/simuladores">simuladores</a>.</p>
      </div>
    );
  } else if (q && (room.status === 'question' || revelada)) {
    const a = ACTIVIDAD[q.act];
    cuerpo = (
      <div className="qcard">
        <p className="mono vivo-act" style={{ '--c': a.color }}>Actividad {a.n} · {a.nombre}</p>
        {!revelada && <Reloj room={room} q={q} onFin={() => refrescar((x) => x + 1)} />}
        {!revelada && !mias[q.id] && restante(room, q) === 0
          ? <p className="exp center-t">⏱ Se acabó el tiempo. Espera los resultados en la pantalla.</p>
          : <Pregunta key={`${q.id}-${room.seq}`} q={q} revelar={revelada} onResultado={(r) => enviar(r)} />}
        {room.status === 'question' && mias[q.id] && <p className="note">Tu respuesta llegó al profesor.</p>}
        {revelada && res && q.type !== 'scale' && <p className={`note ${res.ok ? 'ok' : ''}`}>Sumaste {res.pts} puntos.</p>}
      </div>
    );
  } else {
    cuerpo = (
      <div className="qcard center-t espera">
        <span className="pulso" aria-hidden="true" />
        <p className="eyebrow">Estás dentro</p>
        <h2 className="h-lg">Mira la pantalla</h2>
        <p className="exp">Cuando el profesor envíe una pregunta, aparecerá aquí sola. No cierres esta pestaña.</p>
      </div>
    );
  }

  return (
    <div className="page practica sala8">
      <header className="sbar"><span className="who">{yo.nick}</span><span className="chip mono">PIN {yo.pin}</span><span className="chip mono">{puntos} pts</span></header>
      <main className="sbody">{cuerpo}</main>
    </div>
  );
}
