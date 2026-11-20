import { useEffect, useState } from 'react';
import { QR } from './piezas.jsx';
import Pregunta from '../components/Pregunta.jsx';
import { useSala, restante } from '../lib/sala.js';
import { LETRAS, puntaje } from '../data/actividades.js';

/* Piezas de la clase en vivo. La sala la abre el profesor en #/profesor; sin sala
   (presentación pública) las diapositivas muestran el QR de práctica libre. */

/** El único QR de la clase: con sala abierta lleva a #/sala con el PIN; sin sala, a la práctica libre. */
export function QRClase({ size = 260, libre = '#/actividades', pie }) {
  const { pin } = useSala();
  if (pin) {
    return (
      <div className="d-act-qr"><QR ruta={`#/sala?pin=${pin}`} size={size} />
        <p className="mono">PIN <b className="pin-g">{pin}</b> · el mismo código toda la clase</p></div>
    );
  }
  return <div className="d-act-qr"><QR ruta={libre} size={size} /><p className="mono">{pie || libre}</p></div>;
}

/** Cuenta regresiva de la pregunta abierta, igual en la pantalla y en los celulares. */
export function Reloj({ room, q, onFin }) {
  const [, tic] = useState(0);
  const s = restante(room, q);
  useEffect(() => {
    if (room?.status !== 'question') return;
    const id = setInterval(() => tic((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [room?.status, room?.seq]);
  useEffect(() => { if (s === 0 && room?.status === 'question') onFin?.(); }, [s === 0, room?.status, room?.seq]);
  const pct = Math.min(100, (100 * s) / (q?.t || 30));
  return (
    <div className={`reloj8 ${s <= 5 ? 'poco' : ''}`} aria-live="off">
      <b className="mono">{s}</b>
      <div className="timer"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
    </div>
  );
}

export function Resultados({ q, lista }) {
  if (!lista.length) return <p className="vivo-n">Nadie respondió.</p>;
  if (q.type === 'scale') {
    return (
      <div className="vivo-bars">{q.o.map((o, i) => {
        const v = lista.map((x) => x.r?.[i] || 0).filter(Boolean); const prom = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
        return <div key={i} className="vb"><span>{o}</span><i style={{ width: `${(prom / 5) * 100}%` }} /><b className="mono">{prom.toFixed(1)}</b></div>;
      })}</div>
    );
  }
  const bien = lista.filter((x) => puntaje(q, x.r) === 100).length;
  return (
    <>
      <p className="vivo-n"><b>{Math.round((100 * bien) / lista.length)} %</b> acertó · {bien} de {lista.length}</p>
      {(q.type === 'quiz' || q.type === 'tf') && (
        <div className="vivo-bars">{q.o.map((o, i) => {
          const n = lista.filter((x) => x.r === i).length;
          return <div key={i} className={`vb ${i === q.a ? 'ok' : ''}`}><span>{LETRAS[i]}</span><i style={{ width: `${(100 * n) / lista.length}%` }} /><b className="mono">{n}</b></div>;
        })}</div>
      )}
    </>
  );
}

/** Diapositiva de una pregunta (repaso en la presentación). Con sala, el QR es el de la clase. */
export function PreguntaSlide({ q, actividad }) {
  return (
    <div className="d-pant">
      <Pregunta q={q} modo="pantalla" />
      <QRClase size={200} libre={`#/actividades?a=${actividad}`} pie="¿Aún no entras? Escanea" />
    </div>
  );
}
