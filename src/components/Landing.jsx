import { TEMAS } from '../data/temas.js';

const BASE = import.meta.env.BASE_URL;
const DIAGRAMAS = [
  ['caida-faa', 'El paro nacional de la FAA'], ['pruebas-pixpro', 'Qué prueba atrapa cada error'], ['traza-pixpro', 'Trazas de un lote'],
  ['pixpro-observable', 'PixPro observable y resistente'], ['proxy-errores', '502, 504 y herramientas de red'], ['manejo-fallas', 'Disyuntor y manejo de fallas'],
];

export default function Landing() {
  return (
    <div className="page landing7">
      <section className="hero7">
        <p className="eyebrow">Desarrollo de Software 5 · Semana 9 · PixPro</p>
        <h1 className="h-xl">Cuando algo <em>falla</em></h1>
        <p className="exp">El 13 de noviembre un router nuevo detuvo los despegues en todo Estados Unidos. Partimos de ese caso para aprender a probar, observar, diagnosticar y aguantar fallas en PixPro.</p>
        <div className="row-btns">
          <a className="btn" href="#/sala">Entrar a la clase</a>
          <a className="btn ghost" href="#/actividades">Practicar por mi cuenta</a>
          <a className="btn ghost" href="#/presentacion">Ver la presentación</a>
          <a className="btn ghost" href="#/simuladores">Simuladores</a>
          <a className="btn ghost" href="#/profesor">Soy profesor</a>
        </div>
      </section>
      <section>
        <p className="eyebrow">Temas</p>
        <div className="temas7">{TEMAS.map((t) => <a key={t.id} href={`#/presentacion?t=${t.id}`} style={{ '--c': t.color }}><span className="mono">{t.n}</span>{t.titulo}</a>)}</div>
      </section>
      <section>
        <p className="eyebrow">Diagramas (Archify)</p>
        <div className="diags7">{DIAGRAMAS.map(([id, t]) => <a key={id} href={`${BASE}diagramas/${id}.html`} target="_blank" rel="noreferrer">{t} ↗</a>)}</div>
      </section>
    </div>
  );
}
