import { useState } from 'react';

/* Simulador "Encuentra el culpable con una traza".
   Tres quejas reales de fotógrafos; cada una trae su traza (spans en cascada) y los registros
   de cada servicio con el mismo trace_id. Toca el span sospechoso. Datos ilustrativos. */

const CASOS = [
  {
    id: 'lento', queja: '«Crear un lote tarda 30 segundos»', total: 30500, culpable: 'mini',
    spans: [
      { id: 'spa', n: 'SPA · POST /lotes', s: 0, d: 30500, nivel: 0 },
      { id: 'px', n: 'Proxy', s: 30, d: 30450, nivel: 1 },
      { id: 'api', n: 'API de lotes', s: 60, d: 30400, nivel: 2 },
      { id: 'db', n: 'BD · INSERT lote', s: 90, d: 60, nivel: 3 },
      { id: 'mini', n: 'Miniaturas · intento 1', s: 160, d: 10000, nivel: 3, err: true },
      { id: 'mini2', n: 'Miniaturas · intento 2', s: 10170, d: 10000, nivel: 3, err: true, de: 'mini' },
      { id: 'mini3', n: 'Miniaturas · intento 3', s: 20180, d: 10000, nivel: 3, err: true, de: 'mini' },
      { id: 'br', n: 'Broker · LoteCreado', s: 30200, d: 30, nivel: 3 },
    ],
    logs: {
      api: ['WARN  reintentando miniaturas (2/3)', 'WARN  reintentando miniaturas (3/3)', 'INFO  lote 42 creado en 30.4 s'],
      mini: ['ERROR timeout tras 10 000 ms', 'ERROR timeout tras 10 000 ms', 'ERROR timeout tras 10 000 ms'],
      db: ['INFO  INSERT lotes 58 ms'],
    },
    ok: 'Miniaturas tarda 10 s por intento y la API lo espera 3 veces: 30 s. Arreglo: timeout de 2 s, 1 reintento con jitter, disyuntor y plan B (crear el lote sin miniatura y generarla después).',
  },
  {
    id: '504', queja: '«Me sale Error 504 al abrir mis lotes»', total: 75000, culpable: 'db',
    spans: [
      { id: 'spa', n: 'SPA · GET /lotes', s: 0, d: 60050, nivel: 0, err: true },
      { id: 'px', n: 'Proxy · timeout 60 s', s: 20, d: 60000, nivel: 1, err: true },
      { id: 'api', n: 'API de lotes', s: 50, d: 74900, nivel: 2 },
      { id: 'db', n: 'BD · SELECT lotes (espera bloqueo)', s: 80, d: 74800, nivel: 3 },
    ],
    logs: {
      px: ['ERROR upstream timed out (110) while reading response header', 'INFO  504 GET /lotes 60.0 s'],
      api: ['INFO  GET /lotes respondió 200 en 74.9 s (el cliente ya no estaba)'],
      db: ['WARN  consulta esperó 74 s por un bloqueo de la tabla lotes', 'INFO  bloqueo tomado por: reporte_mensual (UPDATE masivo)'],
    },
    ok: 'El 504 lo escribe el proxy, pero el culpable es la base de datos: la consulta esperó un bloqueo de un reporte masivo (problema de concurrencia). Arreglo: índice o consulta sin bloqueo, mover el reporte fuera de horario y timeout de BD menor que el del proxy.',
  },
  {
    id: 'cero', queja: '«El avance se queda en 0/50 para siempre»', total: 900, culpable: 'notif',
    spans: [
      { id: 'w1', n: 'Procesador · imagen 1', s: 0, d: 400, nivel: 0 },
      { id: 'br', n: 'Broker · ImagenProcesada', s: 410, d: 20, nivel: 1 },
      { id: 'notif', n: 'Notificaciones · consumir evento', s: 440, d: 15, nivel: 2, err: true },
      { id: 'ws', n: 'WebSocket · enviar avance', s: 470, d: 0, nivel: 3, falta: true },
    ],
    logs: {
      notif: ['ERROR TypeError: no se puede leer «hechas» de undefined', 'INFO  evento recibido: {"loteId":42,"procesadas":1,"total":50}'],
      w1: ['INFO  imagen 1/50 lista', 'INFO  publicado ImagenProcesada v2'],
    },
    ok: 'El procesador publicó la versión 2 del evento («procesadas») y Notificaciones aún espera «hechas»: falla y nunca manda el avance. Es un error de contrato: una prueba de contrato lo habría atrapado antes de desplegar.',
  },
];

export default function Traza() {
  const [c, setC] = useState(0);
  const [sel, setSel] = useState(null);
  const caso = CASOS[c];
  const elegido = sel && caso.spans.find((s) => s.id === sel);
  const servicio = elegido?.de || sel;
  const acierto = servicio === caso.culpable;
  const ms = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${v} ms`);
  return (
    <div className="sim traza">
      <div className="sim-ctrl">
        {CASOS.map((x, i) => <button key={x.id} className={`cbtn ${c === i ? 'on' : ''}`} onClick={() => { setC(i); setSel(null); }}>{x.queja}</button>)}
      </div>
      <div className="traza-head mono"><span>trace_id 4bf92f35…{c}a7</span><span>duración total <b>{ms(caso.total)}</b></span><span>toca el span sospechoso</span></div>
      <div className="traza-wf" role="list">
        {caso.spans.map((s) => (
          <button key={s.id} role="listitem" className={`span-row ${sel === s.id ? 'sel' : ''} ${s.err ? 'err' : ''} ${s.falta ? 'falta' : ''}`} onClick={() => setSel(s.id)}>
            <span className="span-n" style={{ paddingLeft: `${s.nivel * 14}px` }}>{s.n}</span>
            <span className="span-pista">
              {s.falta ? <em>nunca ocurrió</em> : <i style={{ left: `${(100 * s.s) / caso.total}%`, width: `max(3px, ${(100 * s.d) / caso.total}%)` }} />}
            </span>
            <span className="mono span-d">{s.falta ? '—' : ms(s.d)}</span>
          </button>
        ))}
      </div>
      <div className="traza-pie">
        <div className="traza-logs">
          <span className="mono">registros con este trace_id{elegido ? ` · ${elegido.n.split(' ·')[0]}` : ''}</span>
          {(caso.logs[servicio] || (elegido ? ['(sin registros de error en este servicio)'] : ['Toca un span para ver sus registros.'])).map((l, i) => <code key={i} className={/ERROR/.test(l) ? 'e' : /WARN/.test(l) ? 'w' : ''}>{l}</code>)}
        </div>
        <p className={`sim-msg ${elegido ? (acierto ? 'ok' : 'bad') : ''}`}>
          {!elegido ? 'Pista: busca dónde se va el tiempo o dónde empieza el error, no dónde lo ve el usuario.' : acierto ? `✓ ${caso.ok}` : '✗ Ese servicio solo sufre las consecuencias. Mira su registro y sigue buscando más adentro.'}
        </p>
      </div>
    </div>
  );
}
