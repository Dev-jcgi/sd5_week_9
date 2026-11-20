import { T, Portada, Arch, Code, Cards, Card, YPixPro } from './piezas.jsx';
import { Receso, Agenda } from './extras.jsx';
import { ACTIVIDAD } from '../data/actividades.js';
import { QRClase, PreguntaSlide } from './vivo.jsx';
import Cazabugs from '../components/Cazabugs.jsx';
import Traza from '../components/Traza.jsx';
import Diagnostico from '../components/Diagnostico.jsx';
import Disyuntor from '../components/Disyuntor.jsx';

/* Presentación de la Semana 9 · DS5 · Probar, observar, diagnosticar y resistir fallas, con PixPro.
   Hilo: el paro nacional de la FAA (13 nov 2026) abre la pregunta "¿cómo evitas, detectas, encuentras y
   aguantas una falla en un sistema distribuido?", y cada tema contesta una parte para PixPro.
   Cada columna (→) es un tema o una actividad; sus diapositivas (↓) profundizan. */

const Lista = ({ items, frag }) => <ul className="d-list">{items.map((x, i) => <li key={i} className={frag ? 'fragment' : ''}>{x}</li>)}</ul>;
const Tabla = ({ head, rows, small }) => (
  <table className={`d-tabla ${small ? 'sm' : ''}`}><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
);
const Dos = ({ children, r = '1fr 1fr' }) => <div className="d-dos" style={{ gridTemplateColumns: r }}>{children}</div>;
const Analogia = ({ titulo, children }) => <div className="d-analogia"><span className="mono">Analogía</span><h3>{titulo}</h3>{children}</div>;
const Puente = ({ children }) => <p className="d-puente"><span className="mono">Siguiente →</span> {children}</p>;
const Dato = ({ n, t, c }) => <div className="d-dato" style={{ '--c': c }}><b>{n}</b><span>{t}</span></div>;

/** Portada de una actividad: el QR único de la clase (o el de práctica libre sin sala). */
function Actividad({ id, como }) {
  const a = ACTIVIDAD[id];
  return (
    <div className="d-act" style={{ '--c': a.color }}>
      <p className="d-eti"><span className="pill">ACTIVIDAD {a.n} DE 4</span> {a.momento} · {a.min} min</p>
      <h1>{a.nombre}</h1>
      <Dos r="1.3fr 1fr">
        <div className="d-act-modos">
          <div><span className="mono">Cómo funciona</span><p>Si ya entraste a la clase, no escanees otra vez: las preguntas te llegan solas al celular, cada una con su tiempo.</p></div>
          <div><span className="mono">Al terminar el tiempo</span><p>Se revela la respuesta en la pantalla y en tu celular, con la explicación y tus puntos.</p></div>
          <div><span className="mono">Qué repasa</span><p>{como}</p></div>
        </div>
        <QRClase size={250} libre={`#/actividades?a=${id}`} pie={`#/actividades · ${a.preguntas.length} preguntas`} />
      </Dos>
    </div>
  );
}
const preguntas = (id) => ACTIVIDAD[id].preguntas.map((q) => <PreguntaSlide key={q.id} q={q} actividad={id} />);

export const COLS = [
  /* ───────────── INICIO ───────────── */
  { id: 'inicio', titulo: 'Inicio', slides: [
    <div className="d-hero" key="p">
      <p className="d-eti">Desarrollo de Software 5 · Semana 9</p>
      <h1>Cuando algo <em>falla</em></h1>
      <p className="d-preg">El 13 de noviembre un router nuevo en un pueblo de Arkansas <b>detuvo los despegues en todo Estados Unidos</b>. Hoy aprendemos a probar, observar, diagnosticar y aguantar fallas, y lo aplicamos a PixPro.</p>
      <div className="d-hero-tags mono"><span>Caso FAA</span><span>Pruebas</span><span>Observabilidad</span><span>Proxies y red</span><span>Problemas comunes</span><span>Manejo de fallas</span></div>
      <p className="d-nav mono">→ avanzar · ↓ profundizar · ESC vista general</p>
    </div>,
    <>
      <T eti="Agenda">Un caso real y cuatro preguntas: ¿cómo evito, veo, encuentro y aguanto una falla?</T>
      <Agenda />
    </>,
    <>
      <T eti="De dónde venimos">Ya tenemos un PixPro distribuido</T>
      <Dos r="1.15fr 1fr">
        <Lista items={[
          <>Semanas pasadas: servicios separados, un broker con <b>lote.events</b> y notificaciones en tiempo real por <b>WebSocket</b>.</>,
          <>Más piezas significa más lugares donde algo puede fallar… y más difícil saber <b>cuál</b> falló.</>,
          <>Hoy: cómo <b>probarlo</b>, cómo <b>verlo por dentro</b>, cómo <b>diagnosticar</b> y cómo <b>seguir funcionando</b> cuando algo se rompe.</>,
          <>Escaneen el código <b>una sola vez</b>: con él responden las 4 actividades.</>,
        ]} />
        <QRClase size={280} pie="#/actividades · déjenla abierta" />
      </Dos>
      <Puente>Empecemos por un caso de la semana pasada donde todo eso se puso a prueba.</Puente>
    </>,
  ] },

  /* ───────────── TEMA 1 · CASO FAA ───────────── */
  { id: 't1', tema: 't1', slides: [
    <Portada key="p" tema="t1" pregunta="¿Cómo un solo router en un sitio remoto puede detener los vuelos de todo un país?" />,
    <>
      <T tema="t1" eti="Los hechos" sub="Fuente: preguntas y respuestas publicadas por la FAA">13 de noviembre de 2026: paro nacional de despegues</T>
      <div className="d-datos">
        <Dato n="15:30 ET" t="la FAA detiene los despegues en todo el país" c="#FF6B8B" />
        <Dato n="≈ 5 h" t="los vuelos se reanudan a las 20:15" c="#FF8A3D" />
        <Dato n="17 de 22" t="centros de control con inestabilidad" c="#FFD166" />
        <Dato n="1 000" t="intentos de conexión cada 4 a 5 segundos" c="#C6F33A" />
      </div>
      <Cards cols={3}>
        <Card t="Dónde empezó" c="#FF6B8B">Un sitio de radio en El Dorado, Arkansas, donde se instalaba un <b>router nuevo</b>, y un sitio de radar en Amarillo, Texas.</Card>
        <Card t="Qué NO fue" c="#6EA8FF">La FAA no ve indicios de un ciberataque ni de un actor externo.</Card>
        <Card t="Qué siguió funcionando" c="#C6F33A">Algunas frecuencias y radares. Unos <b>3 500 aviones</b> en el aire aterrizaron sin problema.</Card>
      </Cards>
    </>,
    <>
      <T tema="t1" eti="Explicador (Archify)">De un sitio remoto a un paro nacional</T>
      <Arch src="caida-faa" h={640} nota="Pasos, cronología y lecciones" />
    </>,
    <>
      <T tema="t1" eti="Para entenderlo">El vecino que no deja de tocar el timbre</T>
      <Dos r="1.1fr 1fr">
        <Analogia titulo="Un edificio con un solo portero">
          <p>Un vecino nuevo instala un timbre que, por error, <b>toca todos los timbres del edificio cada 4 segundos</b>. El portero, que es de la vieja escuela, intenta atender cada uno.</p>
          <p>Pronto no atiende a nadie: ni al vecino, ni a la ambulancia, ni al cartero. Cierran el edificio mientras buscan <b>qué timbre</b> es.</p>
        </Analogia>
        <Lista frag items={[
          <><b>¿Por qué no lo vieron antes?</b> Probaron el timbre solo, no en el edificio completo.</>,
          <><b>¿Por qué tardaron en encontrarlo?</b> No había una gráfica de “timbrazos por departamento”.</>,
          <><b>¿Cómo lo pararon?</b> Desconectaron ese timbre.</>,
          <><b>¿Qué salvó el día?</b> Algunos teléfonos siguieron sirviendo.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Cuatro preguntas para hoy">Cada lección del caso es un tema de la clase</T>
      <Tabla head={['Pregunta', 'En el caso FAA', 'Tema']} rows={[
        ['¿Por qué no se atrapó antes?', 'Pasó las pruebas de laboratorio, pero no las condiciones reales', '2 · Pruebas'],
        ['¿Cómo te enteras y dónde miras?', 'Inestabilidad en 17 centros: había que encontrar el origen', '3 · Métricas, registros y trazas'],
        ['¿Con qué herramientas lo encuentras?', 'Rastrear el tráfico hasta dos sitios', '4 · Proxies y red'],
        ['¿Qué tipo de problema era?', 'Red + configuración (una función de difusión)', '5 · Problemas comunes'],
        ['¿Cómo se aguanta mientras tanto?', 'Bloquear el origen; parte del sistema siguió funcionando', '6 · Manejo de fallas'],
      ]} />
    </>,
    <>
      <T tema="t1" eti="Discusión · 3 min en parejas">¿Qué harían ustedes?</T>
      <Cards cols={3}>
        <Card t="1 · La prueba" c="#C6F33A">¿Cómo probarían un router nuevo para que se parezca a la red real, sin arriesgar la red real?</Card>
        <Card t="2 · La hora" c="#FFD166">El cambio se hizo a mediodía en un sitio remoto. ¿Cuándo y cómo harían ustedes un cambio así?</Card>
        <Card t="3 · La decisión" c="#FF6B8B">Detener todos los vuelos fue “por precaución”. ¿Cuándo es mejor apagar todo que seguir a medias?</Card>
      </Cards>
      <p className="d-capstone fragment"><b>Ninguna prueba atrapa todo.</b> Por eso además de probar hay que poder ver, encontrar y aguantar la falla.</p>
    </>,
    <YPixPro key="y" tema="t1" items={[
      ['…un servicio nuevo de PixPro manda miles de mensajes por segundo al broker por un error de configuración?', 'Igual que el router: inunda a todos los demás. Necesitamos pruebas con carga, métricas por servicio y un límite por origen.'],
      ['…el fotógrafo dice “mis lotes no avanzan” y tenemos 5 servicios?', '¿Por dónde empezamos a buscar? Eso lo responden las trazas del tema 3.'],
      ['…se cae el servicio de miniaturas?', '¿Se cae todo PixPro o solo faltan las miniaturas? Lo decide el diseño del tema 6.'],
    ]} cierre="la falla va a llegar; lo que se diseña es qué tan pronto la ves y cuánto daño hace." />,
  ] },

  { id: 'a1', titulo: 'Actividad 1', kind: 'act', slides: [
    <Actividad key="a" id="a1" como="El caso FAA: qué pasó, en qué orden, y qué prácticas previenen, detectan o contienen." />,
    ...preguntas('a1'),
  ] },

  /* ───────────── TEMA 2 · PRUEBAS ───────────── */
  { id: 't2', tema: 't2', slides: [
    <Portada key="p" tema="t2" pregunta="Si cada servicio pasa sus pruebas, ¿por qué el sistema completo todavía puede fallar?" />,
    <>
      <T tema="t2" eti="La pirámide de pruebas">Muchas pruebas pequeñas abajo, pocas grandes arriba</T>
      <Dos r="1fr 1.15fr">
        <div className="d-piramide">
          <div style={{ '--w': '52%', '--c': '#FFD166' }}><b>Extremo a extremo</b><span>pocas · minutos</span></div>
          <div style={{ '--w': '66%', '--c': '#B78CFF' }}><b>Contrato</b><span>entre servicios</span></div>
          <div style={{ '--w': '82%', '--c': '#6EA8FF' }}><b>Integración</b><span>piezas reales · segundos</span></div>
          <div style={{ '--w': '100%', '--c': '#C6F33A' }}><b>Unitarias</b><span>cientos · milisegundos</span></div>
        </div>
        <Lista items={[
          <><b>Unitaria:</b> una función sola, sin red ni base de datos.</>,
          <><b>Integración:</b> tu código con piezas <b>reales</b> (base de datos, broker) levantadas para la prueba.</>,
          <><b>Contrato:</b> que lo que un servicio envía siga siendo lo que el otro espera.</>,
          <><b>Extremo a extremo (E2E):</b> un navegador real recorre el flujo completo, como el usuario.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Explicador (Archify)">Qué cubre cada prueba en el flujo de un lote</T>
      <Arch src="pruebas-pixpro" h={640} nota="Flujo del lote, costo de cada prueba y ejemplo con Playwright" />
    </>,
    <>
      <T tema="t2" eti="Integración">Una base de datos de verdad, que vive solo durante la prueba</T>
      <Dos r="1.35fr 1fr">
        <Code lang="java" titulo="LotesIT.java (JUnit + Testcontainers)">{`
@Testcontainers
class LotesIT {
  @Container
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");

  @Test
  void guardaUnLoteYLoLee() {
    var repo = new LotesRepo(db.getJdbcUrl(), db.getUsername(), db.getPassword());
    var id = repo.crear(new Lote("boda-ana", 50));
    assertEquals(50, repo.buscar(id).total());
  }
}`}</Code>
        <Lista items={[
          <>Testcontainers arranca un <b>Postgres real</b> en Docker y lo borra al terminar.</>,
          <>Atrapa lo que un “mock” no ve: SQL mal escrito, columnas renombradas, tipos distintos.</>,
          <>Lo mismo sirve para el broker (RabbitMQ, Kafka) o Redis.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Contrato y extremo a extremo">Lo que se rompe entre servicios y lo que ve el usuario</T>
      <Dos r="1fr 1fr">
        <Code lang="javascript" titulo="Contrato: el evento sigue igual">{`
// Lo que Notificaciones espera de ImagenProcesada
const contrato = {
  loteId: 'string',
  hechas: 'number',
  total: 'number',
};
test('el evento cumple el contrato', () => {
  const ev = lotes.eventoImagenProcesada(42, 1, 50);
  for (const [k, tipo] of Object.entries(contrato))
    expect(typeof ev[k]).toBe(tipo);
});`}</Code>
        <Code lang="javascript" titulo="E2E con Playwright">{`
test('un lote llega a 50/50', async ({ page }) => {
  await page.goto('/lotes/nuevo');
  await page.setInputFiles('input[type=file]', fotos50);
  await page.getByRole('button', { name: 'Procesar' }).click();
  await expect(page.getByText('50/50'))
    .toBeVisible({ timeout: 60_000 });
});`}</Code>
      </Dos>
      <p className="d-capstone"><b>E2E:</b> pocas y solo del camino principal. Son lentas y, si fallan, no dicen <b>dónde</b> está el error.</p>
    </>,
    <>
      <T tema="t2" eti="Simulador · cazabugs" sub="Seis errores escondidos en PixPro. Elige qué pruebas corre el pipeline y mira cuáles atrapa y cuánto tarda.">¿Qué prueba atrapa cada error?</T>
      <Cazabugs />
    </>,
    <>
      <T tema="t2" eti="En el pipeline">Cuándo corre cada prueba</T>
      <Tabla small head={['Momento', 'Qué corre', 'Por qué']} rows={[
        ['Cada commit', 'Unitarias + integración + contrato', 'Rápidas: avisan en minutos'],
        ['Antes de desplegar', 'E2E del camino principal', 'El flujo completo funciona'],
        ['De noche o antes de una entrega grande', 'Carga (k6) con tráfico realista', 'Lo que solo pasa con mucho tráfico'],
        ['Después de desplegar', 'Prueba de humo en producción + monitoreo', 'Lo que el laboratorio no tenía'],
      ]} />
      <p className="d-capstone"><b>Pruebas inestables (flaky):</b> si una prueba falla “a veces”, el equipo deja de creerle. Se arreglan o se quitan, nunca se ignoran.</p>
    </>,
    <YPixPro key="y" tema="t2" items={[
      ['…el equipo de Lotes renombra un campo del evento?', 'La prueba de contrato falla en su commit, antes de que Notificaciones se entere en producción.'],
      ['…500 fotógrafos suben un lote el lunes a las 9?', 'Solo una prueba de carga lo dice. Es la que le faltó al router de la FAA.'],
      ['…todo pasa las pruebas y aun así falla en producción?', 'Pasará. Por eso necesitamos ver el sistema por dentro: tema 3.'],
    ]} cierre="cada tipo de prueba ve una parte; ninguna ve todo." />,
  ] },

  /* ───────────── TEMA 3 · OBSERVABILIDAD ───────────── */
  { id: 't3', tema: 't3', slides: [
    <Portada key="p" tema="t3" pregunta="Un fotógrafo dice “mi lote no avanza”. Tienes 5 servicios. ¿Dónde miras primero?" />,
    <>
      <T tema="t3" eti="Tres señales">Métricas, registros y trazas: cada una responde algo distinto</T>
      <Cards cols={3}>
        <Card t="Métricas: ¿algo va mal?" c="#C6F33A"><p>Números en el tiempo: lotes por minuto, latencia, errores.</p><p>Baratas, sirven para <b>alertas</b>.</p></Card>
        <Card t="Registros: ¿qué pasó aquí?" c="#6EA8FF"><p>Eventos con detalle, en JSON: <span className="mono">{'{"nivel":"error","trace_id":…}'}</span></p><p>Explican <b>un punto</b>.</p></Card>
        <Card t="Trazas: ¿dónde se fue el tiempo?" c="#B78CFF"><p>El viaje de una petición por todos los servicios, con la duración de cada tramo (span).</p><p>Ubican <b>al culpable</b>.</p></Card>
      </Cards>
      <p className="d-capstone">OpenTelemetry es el estándar abierto para producir las tres señales, sin casarte con un proveedor.</p>
    </>,
    <>
      <T tema="t3" eti="Qué medir">Las cuatro señales doradas (Google SRE)</T>
      <div className="d-ocho cuatro">
        {[['Latencia', '¿cuánto tarda? (p95, p99, no solo el promedio)', '#6EA8FF'], ['Tráfico', '¿cuánto llega? (lotes/min, mensajes/s)', '#C6F33A'],
          ['Errores', '¿cuántos fallan? (5xx, timeouts)', '#FF6B8B'], ['Saturación', '¿qué tan lleno está? (hilos, memoria, cola)', '#FFD166']].map(([t, s, c]) => (
          <div key={t} style={{ borderTopColor: c }}><span>{t}</span><p>{s}</p></div>
        ))}
      </div>
      <p className="d-capstone"><b>En el caso FAA:</b> una métrica de “intentos de conexión por sitio” habría señalado El Dorado en minutos.</p>
    </>,
    <>
      <T tema="t3" eti="Explicador (Archify)">El mismo trace id de punta a punta</T>
      <Arch src="traza-pixpro" h={640} nota="Cómo viaja traceparent por proxy, API, broker y Notificaciones" />
    </>,
    <>
      <T tema="t3" eti="En el código">Un registro útil y un span, en pocas líneas</T>
      <Dos r="1fr 1fr">
        <Code lang="json" titulo="Registro estructurado (JSON)">{`
{
  "ts": "2026-11-20T15:02:11.482Z",
  "nivel": "error",
  "servicio": "api-lotes",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "lote_id": 42,
  "msg": "timeout al llamar a miniaturas",
  "duracion_ms": 10000
}`}</Code>
        <Code lang="javascript" titulo="Un span con OpenTelemetry">{`
const tracer = trace.getTracer('api-lotes');

await tracer.startActiveSpan('miniaturas.crear', async (span) => {
  span.setAttribute('lote.id', loteId);
  try {
    return await miniaturas.crear(loteId);
  } catch (e) {
    span.recordException(e);
    throw e;
  } finally {
    span.end();
  }
});`}</Code>
      </Dos>
      <p className="d-capstone"><b>Nunca</b> registres contraseñas, tokens ni datos personales. Sí el trace_id, el servicio y lo que ayuda a buscar.</p>
    </>,
    <>
      <T tema="t3" eti="Simulador · encuentra el culpable" sub="Tres quejas reales, cada una con su traza y sus registros. Toca el span sospechoso.">¿Dónde está el problema?</T>
      <Traza />
    </>,
    <>
      <T tema="t3" eti="PixPro observable (Archify)">Así se conectan las tres señales</T>
      <Arch src="pixpro-observable" h={620} nota="Usa las vistas: camino del lote, observabilidad y qué pasa si falla Miniaturas" />
    </>,
    <Puente key="pu">La traza nos dijo <b>dónde</b>. Después del receso: las herramientas para entender <b>por qué</b>, empezando por lo que hay entre el navegador y tu servidor.</Puente>,
  ] },

  { id: 'a2', titulo: 'Actividad 2', kind: 'act', slides: [
    <Actividad key="a" id="a2" como="Qué prueba atrapa cada error, qué señal usar y cómo viaja el trace id." />,
    ...preguntas('a2'),
  ] },

  { id: 'receso', titulo: 'Receso', kind: 'act', slides: [<Receso key="r" />] },

  /* ───────────── TEMA 4 · PROXIES Y RED ───────────── */
  { id: 't4', tema: 't4', slides: [
    <Portada key="p" tema="t4" pregunta="El navegador dice 502 y tu servidor dice “todo bien”. ¿Quién miente?" />,
    <>
      <T tema="t4" eti="El intermediario">Entre el navegador y tu código casi siempre hay un proxy</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <><b>Proxy inverso / gateway</b> (Nginx, Traefik, un balanceador de la nube): recibe la petición y la reenvía a tu servidor.</>,
          <>Tiene <b>sus propios timeouts, registros y health checks</b>.</>,
          <>Si algo sale mal atrás, <b>él</b> escribe el error que ve el usuario.</>,
        ]} />
        <Tabla head={['Código', 'Lo escribe…', 'Significa']} rows={[
          ['502', 'el proxy', 'tu servidor no contestó bien (caído, otro puerto)'],
          ['503', 'el proxy o tu app', 'no hay servidores sanos o está sobrecargado'],
          ['504', 'el proxy', 'tu servidor tardó más que su timeout'],
          ['500', 'tu app', 'error en tu código'],
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Explicador (Archify)">Dónde nace cada error y qué herramienta usar</T>
      <Arch src="proxy-errores" h={640} nota="Tres finales del mismo pedido y la caja de herramientas" />
    </>,
    <>
      <T tema="t4" eti="La caja de herramientas">De lo más simple a lo más profundo</T>
      <Tabla small head={['Pregunta', 'Comando', 'Qué buscar']} rows={[
        ['¿Qué responde y con qué cabeceras?', 'curl -v https://…', 'código, server:, tiempos, redirecciones'],
        ['¿A qué IP resuelve el nombre?', 'dig pixpro.app', 'IP correcta y TTL'],
        ['¿Hay camino y cuánto tarda?', 'ping · traceroute · mtr', 'pérdida de paquetes y saltos lentos'],
        ['¿El puerto escucha?', 'ss -ltnp · nc -vz host 8080', 'proceso y puerto correctos'],
        ['¿El certificado es válido?', 'openssl s_client -connect host:443', 'fechas notAfter y dominio'],
        ['¿Qué viaja por el cable?', 'tcpdump · Wireshark', 'último recurso: paquetes uno por uno'],
      ]} />
    </>,
    <>
      <T tema="t4" eti="Simulador · consola de diagnóstico" sub="Tres incidentes de PixPro. Corre comandos, lee la salida y elige el diagnóstico.">Primero los datos, después la conclusión</T>
      <Diagnostico />
    </>,
    <>
      <T tema="t4" eti="Reglas del proxy">Cinco configuraciones que causan la mitad de los problemas</T>
      <Cards cols={2}>
        <Card t="Timeouts en cadena" c="#FF8A3D">El del proxy debe ser <b>mayor</b> que el de la API, y el de la API mayor que el de la base de datos. Si no, el usuario ve 504 aunque todo termine.</Card>
        <Card t="Puerto y health check" c="#6EA8FF">Que apunten al puerto y la ruta reales. Un cambio de puerto en un lado y no en el otro = 502.</Card>
        <Card t="Cabeceras" c="#C6F33A">Pasar <span className="mono">traceparent</span>, <span className="mono">X-Forwarded-For</span> y, para WebSocket, <span className="mono">Upgrade</span>.</Card>
        <Card t="Registros del proxy" c="#B78CFF">Que digan a qué servidor reenvió, cuánto tardó y con qué código respondió.</Card>
      </Cards>
    </>,
  ] },

  /* ───────────── TEMA 5 · PROBLEMAS COMUNES ───────────── */
  { id: 't5', tema: 't5', slides: [
    <Portada key="p" tema="t5" pregunta="Casi todos los incidentes caen en tres cajones. ¿Cuáles?" />,
    <>
      <T tema="t5" eti="Tres cajones">Red, concurrencia y configuración</T>
      <Cards cols={3}>
        <Card t="Red" c="#6EA8FF"><Lista items={[
          <>DNS con la IP vieja (TTL largo)</>, <>Timeouts y paquetes perdidos</>, <>Certificado TLS vencido</>, <>Pool de conexiones agotado</>,
        ]} /></Card>
        <Card t="Concurrencia" c="#FF8A3D"><Lista items={[
          <>Condición de carrera: dos peticiones a la vez</>, <>Bloqueos (locks) que hacen esperar</>, <>Doble procesamiento de un mensaje</>, <>Tormenta de reintentos</>,
        ]} /></Card>
        <Card t="Configuración" c="#C6F33A"><Lista items={[
          <>Variable de entorno equivocada</>, <>Puerto o ruta distinta entre servicios</>, <>Una función activada por defecto (el router de la FAA)</>, <>“En mi máquina sí funciona”</>,
        ]} /></Card>
      </Cards>
    </>,
    <>
      <T tema="t5" eti="Concurrencia">El doble clic que crea dos lotes</T>
      <Dos r="1.2fr 1fr">
        <Code lang="javascript" small titulo="Llave de idempotencia">{`
// Cliente: un id por intención, no por intento
const llave = crypto.randomUUID();
await fetch('/lotes', {
  method: 'POST',
  headers: { 'Idempotency-Key': llave },
  body: JSON.stringify({ nombre: 'boda-ana', total: 50 }),
});

// Servidor: si ya vi esa llave, devuelvo lo mismo
const previo = await llaves.buscar(llave);
if (previo) return previo.respuesta;
const lote = await lotes.crear(datos);
await llaves.guardar(llave, lote);`}</Code>
        <Lista items={[
          <><b>Condición de carrera:</b> el resultado depende de quién llega primero.</>,
          <>Con la llave, repetir la petición <b>no crea nada nuevo</b>.</>,
          <>Lo mismo en el broker: un consumidor debe tolerar recibir el mismo evento dos veces.</>,
          <>Y es lo que permite <b>reintentar sin miedo</b> (tema 6).</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Configuración">Que la configuración también se pruebe y se versione</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <><b>Validar al arrancar:</b> si falta una variable, el servicio no arranca (mejor que fallar a medianoche).</>,
          <><b>Misma imagen en todos lados:</b> solo cambian las variables de entorno.</>,
          <><b>Configuración en el repositorio</b>, revisada en pull request como el código.</>,
          <><b>Funciones apagadas por defecto</b> y encendidas a propósito (feature flags).</>,
        ]} />
        <Code lang="javascript" small titulo="Fallar rápido al arrancar">{`
const requeridas = ['DB_URL', 'BROKER_URL', 'MINIATURAS_URL'];
const faltan = requeridas.filter((v) => !process.env[v]);
if (faltan.length) {
  console.error('Faltan variables:', faltan.join(', '));
  process.exit(1);
}`}</Code>
      </Dos>
    </>,
    <YPixPro key="y" tema="t5" items={[
      ['…el fotógrafo da doble clic en “Procesar”?', 'Con la llave de idempotencia se crea un solo lote, aunque lleguen dos peticiones.'],
      ['…Notificaciones recibe dos veces el mismo ImagenProcesada?', 'Guarda el último número por lote: si ya mandó la 43, ignora otra 43.'],
      ['…la API arranca sin la URL de Miniaturas?', 'No arranca y lo dice claro, en vez de fallar con el primer fotógrafo.'],
    ]} cierre="la mayoría de las fallas no son misterios: son de uno de tres cajones." />,
  ] },

  { id: 'a3', titulo: 'Actividad 3', kind: 'act', slides: [
    <Actividad key="a" id="a3" como="502 vs 504, qué comando usar, los tres cajones de problemas e idempotencia." />,
    ...preguntas('a3'),
  ] },

  /* ───────────── TEMA 6 · MANEJO DE FALLAS ───────────── */
  { id: 't6', tema: 't6', slides: [
    <Portada key="p" tema="t6" pregunta="Miniaturas se cae. ¿Se cae todo PixPro con él?" />,
    <>
      <T tema="t6" eti="Errores">Fallar bien también se diseña</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <><b>Fallar rápido:</b> mejor un error claro en 2 s que una página que carga para siempre.</>,
          <><b>Distinguir</b> errores pasajeros (timeout, 503) de permanentes (400, 404, datos inválidos): solo los pasajeros se reintentan.</>,
          <><b>Mensaje útil al usuario</b> y detalle técnico al registro, con trace_id.</>,
        ]} />
        <Code lang="json" small titulo="Respuesta de error clara">{`
{
  "error": "miniaturas_no_disponible",
  "mensaje": "Tu lote se creó. Las miniaturas
              aparecerán en unos minutos.",
  "reintentable": true,
  "trace_id": "4bf92f3577b34da6…"
}`}</Code>
      </Dos>
    </>,
    <>
      <T tema="t6" eti="Explicador (Archify)">Timeout, reintentos, disyuntor y plan B</T>
      <Arch src="manejo-fallas" h={640} nota="Los tres estados del disyuntor y qué patrón usar para cada falla" />
    </>,
    <>
      <T tema="t6" eti="Para entenderlo">El disyuntor de tu casa</T>
      <Dos r="1.1fr 1fr">
        <Analogia titulo="El pastillazo">
          <p>Cuando un aparato hace corto, el disyuntor (la “pastilla”) <b>corta la luz</b> de ese circuito. No sigue mandando corriente “a ver si ya funciona”.</p>
          <p>Después de un rato, <b>la subes una vez</b> para probar: si vuelve a botar, la dejas abajo; si aguanta, todo normal.</p>
        </Analogia>
        <Lista frag items={[
          <><b>Cerrado:</b> la corriente (las llamadas) pasa.</>,
          <><b>Abierto:</b> no llama; responde al instante con el plan B.</>,
          <><b>Medio abierto:</b> deja pasar una llamada de prueba.</>,
          <>Protege a quien llama <b>y</b> al servicio enfermo, que puede recuperarse sin la avalancha.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t6" eti="Simulador · disyuntor" sub="20 peticiones por segundo, 50 hilos en la API. Tumba Miniaturas y prueba las defensas una por una.">¿Qué ven los fotógrafos cuando falla una dependencia?</T>
      <Disyuntor />
    </>,
    <>
      <T tema="t6" eti="En el código">Las cuatro defensas juntas</T>
      <Dos r="1.9fr 1fr">
        <Code lang="java" titulo="Resilience4j (Java)">{`
var cb = CircuitBreaker.of("miniaturas", CircuitBreakerConfig.custom()
    .failureRateThreshold(50)                        // abre con 50 % de fallas
    .waitDurationInOpenState(Duration.ofSeconds(30)) // abierto 30 s
    .permittedNumberOfCallsInHalfOpenState(1)        // una de prueba
    .build());
var retry = Retry.of("miniaturas", RetryConfig.custom()
    .maxAttempts(2)                                  // 1 reintento
    .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(200, 2))
    .build());

Supplier<Miniatura> llamada = () -> cliente.crear(loteId, Duration.ofSeconds(2));
var protegida = Retry.decorateSupplier(retry, cb.decorateSupplier(llamada));

Miniatura m = Try.ofSupplier(protegida)
    .recover(e -> Miniatura.generica())              // plan B
    .get();`}</Code>
        <Lista items={[
          <><b>Timeout</b> en cada llamada remota.</>,
          <><b>Pocos reintentos</b>, con backoff + jitter, y solo si es idempotente.</>,
          <><b>Disyuntor</b> para dejar de insistir.</>,
          <><b>Plan B</b>: la degradación elegante.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t6" eti="Degradación elegante">Dar lo esencial aunque falte lo accesorio</T>
      <Tabla small head={['Si falla…', 'PixPro sigue…', 'Y el usuario ve']} rows={[
        ['Miniaturas', 'creando y procesando lotes', 'un icono genérico; la miniatura llega después'],
        ['El WebSocket de Notificaciones', 'procesando', 'el avance por consulta cada 10 s (polling)'],
        ['El broker', 'recibiendo lotes (outbox en la BD)', '“en cola”; se procesan cuando vuelva'],
        ['La base de datos', 'sin aceptar lotes nuevos', 'un mensaje claro de mantenimiento (503)'],
      ]} />
      <p className="d-capstone"><b>Como la FAA:</b> algunas frecuencias y radares siguieron, y 3 500 aviones aterrizaron. Se perdió capacidad, no todo.</p>
    </>,
    <>
      <T tema="t6" eti="Bulkhead y load shedding">Que una falla no consuma todo</T>
      <Cards cols={2}>
        <Card t="Bulkhead (mamparos)" c="#6EA8FF">Como los compartimentos de un barco: un grupo de hilos o conexiones <b>para cada dependencia</b>. Si Miniaturas atrapa sus 10 hilos, los otros 40 siguen atendiendo.</Card>
        <Card t="Load shedding" c="#FF6B8B">Cuando ya no hay capacidad, <b>rechazar rápido</b> lo que sobra (503 con Retry-After) en vez de aceptar todo y atender mal a todos.</Card>
      </Cards>
      <Puente>Ya sabemos aguantar la falla. Para cerrar: todo junto en un incidente de PixPro.</Puente>
    </>,
  ] },

  /* ───────────── ACTIVIDAD 4 + CIERRE ───────────── */
  { id: 'a4', titulo: 'Actividad 4', kind: 'act', slides: [
    <Actividad key="a" id="a4" como="Disyuntor, cuándo reintentar, degradación elegante y los pasos de un incidente." />,
    ...preguntas('a4'),
  ] },

  { id: 'cierre', titulo: 'Cierre', slides: [
    <>
      <T eti="Un incidente en PixPro, de principio a fin">Lunes 9:05 · “Mis lotes no avanzan”</T>
      <ol className="d-pasos">
        <li><b>Detectar:</b> la alerta “lotes terminados por minuto = 0” suena antes que el primer correo de un fotógrafo.</li>
        <li className="fragment"><b>Contener:</b> el disyuntor de Miniaturas ya está abierto; los lotes se crean con icono genérico.</li>
        <li className="fragment"><b>Diagnosticar:</b> la traza muestra 10 s en Miniaturas; su registro dice “Connection refused :8080”; ss -ltnp confirma que escucha en 8081.</li>
        <li className="fragment"><b>Corregir:</b> se arregla la configuración y se agrega una prueba de integración que revisa el puerto.</li>
        <li className="fragment"><b>Aprender:</b> postmortem sin culpables: ¿qué cambio lo causó y qué prueba o alerta faltó?</li>
      </ol>
    </>,
    <>
      <T eti="Cierre">Cinco ideas para llevarse</T>
      <div className="d-ocho cinco">
        {[['Cada prueba ve una parte', 'Unitaria, integración, contrato, E2E y carga.', '#C6F33A'],
          ['Tres señales, un trace id', 'Métricas avisan, trazas ubican, registros explican.', '#6EA8FF'],
          ['El proxy también habla', '502 y 504 los escribe él; curl -v primero.', '#B78CFF'],
          ['Tres cajones', 'Red, concurrencia y configuración.', '#5CE1E6'],
          ['Fallar bien', 'Timeout, pocos reintentos, disyuntor y plan B.', '#FF8A3D']].map(([t, s, c]) => (
          <div key={t} style={{ borderTopColor: c }}><span>{t}</span><p>{s}</p></div>
        ))}
      </div>
      <p className="d-capstone"><b>Para pensar:</b> en su proyecto, ¿qué dependencia, si se cae, se lleva todo lo demás con ella?</p>
    </>,
    <>
      <T eti="Referencias">Para seguir aprendiendo</T>
      <ul className="d-refs">
        <li>FAA: “Nationwide Ground Stop: Questions and Answers” (noviembre de 2026).</li>
        <li>Make Tech Easier y Aerospace Global News: cobertura del paro del 13 de noviembre de 2026.</li>
        <li>Martin Fowler: “The Practical Test Pyramid” y “CircuitBreaker”.</li>
        <li>Testcontainers y Playwright: documentación oficial.</li>
        <li>OpenTelemetry: Signals · W3C Trace Context.</li>
        <li>Google SRE Book: “Monitoring Distributed Systems” (cuatro señales doradas).</li>
        <li>MDN: 502 Bad Gateway y 504 Gateway Timeout.</li>
        <li>AWS Builders’ Library: “Timeouts, retries and backoff with jitter”.</li>
        <li>Azure Architecture Center: patrón Circuit Breaker · Resilience4j.</li>
      </ul>
      <p className="d-sub">Repaso: actividades en #/actividades y simuladores en #/simuladores.</p>
    </>,
  ] },
];

export const TEMA_COL = Object.fromEntries(COLS.map((c, i) => [c.tema || c.id, i]));
