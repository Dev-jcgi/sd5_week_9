/* Modelo del simulador "Disyuntor" (sin React, para poder probarlo).
   Cada tick = 1 segundo. Llegan 20 peticiones por segundo a la API de PixPro; cada una necesita
   una miniatura del servicio Miniaturas. La API tiene 50 hilos. Miniaturas aguanta 40 llamadas/s.
   Números ilustrativos. */

export const POR_SEG = 20, HILOS = 50, CAP_MINI = 40, UMBRAL = 5, ABIERTO_S = 5;

export function estadoInicial() {
  return { t: 0, vuelo: [], br: 'cerrado', brHasta: 0, fallasSeguidas: 0, hist: [], mini: 'ok', miniDesde: 0 };
}

/** Duración y resultado de UN intento según el estado de Miniaturas y el timeout. */
function intento(mini, saturada, timeout) {
  if (mini === 'caida' || saturada) return { d: timeout, ok: false };
  const lat = mini === 'lenta' ? 8 : 0.2;
  return lat <= timeout ? { d: lat, ok: true } : { d: timeout, ok: false };
}

/** Avanza un segundo. cfg = { timeout, reintentos, disyuntor, planB } */
export function paso(e0, cfg) {
  const e = { ...e0, t: e0.t + 1, vuelo: [] };
  const timeout = cfg.timeout ? 2 : 15; // sin timeout propio, la conexión se rinde a los 15 s
  const intentos = cfg.reintentos ? 4 : 1;
  const salida = { ok: 0, degradado: 0, error: 0, rechazado: 0 };
  const terminar = (p) => {
    if (p.ok) salida.ok++; else if (cfg.planB) salida.degradado++; else salida.error++;
  };
  // 1. Peticiones que terminan este segundo; las fallas cuentan para el disyuntor.
  for (const p of e0.vuelo) {
    if (p.fin <= e.t) {
      terminar(p);
      if (p.llamo) {
        if (p.ok) { e.fallasSeguidas = 0; if (e.br === 'medio') e.br = 'cerrado'; }
        else { e.fallasSeguidas++; if (e.br === 'medio') { e.br = 'abierto'; e.brHasta = e.t + ABIERTO_S; } }
      }
    } else e.vuelo.push(p);
  }
  if (cfg.disyuntor && e.br === 'cerrado' && e.fallasSeguidas >= UMBRAL) { e.br = 'abierto'; e.brHasta = e.t + ABIERTO_S; }
  if (!cfg.disyuntor) e.br = 'cerrado';
  if (e.br === 'abierto' && e.t >= e.brHasta) e.br = 'medio';
  // 2. Llegan las nuevas.
  let llamadas = 0, pruebaHecha = false;
  const nuevas = [];
  for (let i = 0; i < POR_SEG; i++) {
    if (e.vuelo.length + nuevas.length >= HILOS) { salida.rechazado++; continue; }
    if (e.br === 'abierto' || (e.br === 'medio' && pruebaHecha)) { terminar({ ok: false }); continue; } // falla rápido, sin llamar
    if (e.br === 'medio') pruebaHecha = true;
    nuevas.push({ llamo: true });
  }
  // Llamadas de este segundo contra la capacidad de Miniaturas. Si el segundo anterior falló,
  // cada petición hará todos sus reintentos: la carga se multiplica (tormenta de reintentos).
  const fallaba = e.mini !== 'ok' || e0.saturada;
  llamadas = nuevas.length * (fallaba ? intentos : 1);
  const saturada = e.mini === 'ok' && llamadas > CAP_MINI;
  e.saturada = saturada;
  for (const p of nuevas) {
    let d = 0, ok = false;
    for (let k = 0; k < intentos && !ok; k++) {
      const r = intento(e.mini, saturada, timeout);
      d += r.d + (k ? (cfg.jitter ? Math.random() * 2 : 1) : 0); // espera entre reintentos
      ok = r.ok;
    }
    p.ok = ok; p.fin = e.t + Math.max(1, Math.ceil(d));
    e.vuelo.push(p);
  }
  e.ultimasLlamadas = llamadas;
  const total = salida.ok + salida.degradado + salida.error + salida.rechazado;
  e.ultimo = { ...salida, llamadas, hilos: e.vuelo.length, total };
  e.hist = [...e0.hist.slice(-59), e.ultimo];
  return e;
}
