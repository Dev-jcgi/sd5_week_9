import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Viewer from './components/Viewer.jsx';
import Practica from './components/Practica.jsx';
import Simuladores from './components/Simuladores.jsx';
import Profesor from './components/Profesor.jsx';
import Sala from './components/Sala.jsx';

const route = () => (location.hash.split('?')[0] || '#/').replace(/^#/, '') || '/';
const NAV = [['/', 'Inicio'], ['/sala', 'Entrar a la clase'], ['/presentacion', 'Presentación'], ['/actividades', 'Actividades'], ['/simuladores', 'Simuladores'], ['/profesor', 'Profesor']];

export default function App() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const on = () => setR(route());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const Page = { '/presentacion': Viewer, '/actividades': Practica, '/simuladores': Simuladores, '/profesor': Profesor, '/sala': Sala }[r] || Landing;
  return (
    <>
      <header className="topbar">
        <a className="logo" href="#/"><i aria-hidden="true" />DS5 · Semana 9</a>
        <nav>{NAV.map(([h, t]) => <a key={h} href={`#${h}`} aria-current={r === h ? 'page' : undefined}>{t}</a>)}</nav>
      </header>
      <Page key={r} />
    </>
  );
}
