import { useSyncExternalStore } from 'react';
import { api } from './backend.js';
import { ACTIVIDADES, puntaje } from '../data/actividades.js';

/* Estado de la sala en vivo del profesor, compartido con las diapositivas.
   Las diapositivas se crean una sola vez (reveal.js), así que leen la sala con useSala().
   room: { pin, status: 'slide' | 'question' | 'reveal' | 'fin', qid, seq, scored: [], closed, week: 9 }
   Las reglas de Firestore (semanas 4–6) solo aceptan respuestas mientras status === 'question'. */

export const PREGUNTA = Object.fromEntries(ACTIVIDADES.flatMap((a) => a.preguntas.map((q) => [q.id, { ...q, act: a.id }])));

let estado = { pin: null, room: null, players: [], answers: {} };
const subs = new Set();
const set = (p) => { estado = { ...estado, ...p }; subs.forEach((f) => f()); };
let quitar = [];

export function conectarSala(pin) {
  quitar.forEach((f) => f());
  set({ pin, room: null, players: [], answers: {} });
  if (!pin) { quitar = []; return; }
  quitar = [
    api.watchRoom(pin, (room) => set({ room })),
    api.watchPlayers(pin, (players) => set({ players })),
    api.watchAllAnswers(pin, (answers) => set({ answers })),
  ];
}

export function useSala() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => estado);
}

/** Respuestas de una pregunta: [{ uid, r }] */
export const respuestasDe = (answers, qid) => Object.entries(answers).filter(([, a]) => a[qid]).map(([uid, a]) => ({ uid, r: a[qid].r }));

export async function abrirPregunta(qid) {
  const { pin, room } = estado;
  await api.updateRoom(pin, { status: 'question', qid, seq: (room?.seq || 0) + 1, startedAt: Date.now() });
}

export async function revelarPregunta(qid) {
  const { pin, room, answers } = estado;
  const q = PREGUNTA[qid];
  const yaCalificada = (room?.scored || []).includes(qid);
  // Primero cerrar (ya no se aceptan respuestas) y después calificar.
  await api.updateRoom(pin, { status: 'reveal', qid });
  if (q.type !== 'scale' && !yaCalificada) {
    const rows = respuestasDe(answers, qid).map(({ uid, r }) => { const pts = puntaje(q, r); return { uid, pts, ok: pts === 100 }; });
    if (rows.length) await api.applyScores(pin, qid, rows);
    await api.updateRoom(pin, { scored: [...(room?.scored || []), qid] });
  }
}

/** Segundos que quedan de la pregunta abierta (el tiempo lo da q.t). */
export const restante = (room, q, ahora = Date.now()) => Math.max(0, Math.ceil(((room?.startedAt || ahora) + (q?.t || 30) * 1000 - ahora) / 1000));

export const volverASlides = () => api.updateRoom(estado.pin, { status: 'slide', qid: null });
export const finalizarSala = () => api.updateRoom(estado.pin, { status: 'fin', qid: null, closed: true });
