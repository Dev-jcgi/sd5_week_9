// Actividades de la Semana 9 (DS5). En vivo: el profesor las lanza desde #/profesor y llegan a los celulares (un solo QR).
// Sin sala: cada estudiante practica en #/actividades y ve al momento si acertó.
// Tipos: quiz · tf · classify (tarjetas a categorías) · order (ordenar) · scale (termómetro, sin respuesta correcta).
// En "order", "o" ya viene desordenado y "a" es el orden correcto (índices de "o").

const TERMO = ['Pruebas de integración y de extremo a extremo', 'Métricas, registros y trazas', 'Depurar proxies y la red', 'Problemas de red, concurrencia y configuración', 'Timeouts, reintentos, disyuntores y degradación'];

export const ACTIVIDADES = [
  { id: 'a1', n: 1, nombre: 'Investigadores del paro', momento: 'después del caso FAA', min: 6, color: '#FF6B8B', preguntas: [
    { id: 'a1q0', type: 'scale', t: 40, q: 'Termómetro: ¿qué tan seguro te sientes con cada tema de hoy?', o: TERMO, lo: 'nada', hi: 'podría explicarlo' },
    { id: 'a1q1', type: 'tf', t: 15, q: 'El paro de la FAA del 13 de noviembre fue causado por un ciberataque.', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. La FAA dijo que no hay indicios de un ataque. La red se inundó con unos 1 000 intentos de conexión cada 4 a 5 segundos, ligados a un router nuevo y a un sitio de radar.' },
    { id: 'a1q2', type: 'order', t: 45, q: 'Ordena cómo un sitio remoto terminó en un paro nacional',
      o: ['El equipo antiguo de la red se vuelve inestable', 'Se instala un router nuevo con una función de difusión activa', 'La FAA detiene los despegues en todo el país', 'La red recibe 1 000 intentos de conexión cada 4–5 s', '17 de 22 centros de control pierden radio y radar'],
      a: [1, 3, 0, 4, 2], e: 'Router nuevo → inundación de conexiones → equipo antiguo inestable → 17 centros afectados → paro nacional. Un cambio pequeño en un lugar remoto se propagó por toda la red.' },
    { id: 'a1q3', type: 'classify', t: 60, q: '¿Cada práctica sirve para prevenir, detectar o contener?', bins: ['Prevenir', 'Detectar', 'Contener'],
      o: ['Probar con la carga y la red reales antes de instalar', 'Graficar los intentos de conexión por sitio', 'Bloquear los dos sitios que inundaban la red', 'Hacer cambios fuera del horario pico', 'Una alerta cuando los intentos se disparan', 'Limitar cuántas conexiones acepta cada origen'],
      a: [0, 1, 2, 0, 1, 2], e: 'Prevenir: pruebas reales y cambios fuera de pico. Detectar: métricas y alertas. Contener: bloquear el origen y limitar conexiones por origen. Hoy vemos las tres.' },
    { id: 'a1q4', type: 'quiz', t: 25, q: 'Los routers pasaron pruebas antes de instalarse. ¿Qué crítica hicieron los senadores?',
      o: ['Que no se probaron en absoluto', 'Que las pruebas quizá no reflejaban las condiciones reales de operación', 'Que el router era de mala marca', 'Que faltó una prueba unitaria'],
      a: 1, e: 'Las pruebas de laboratorio no tenían toda la red ni el tráfico real. Es el puente al tema 2: cada tipo de prueba ve solo una parte.' },
  ] },
  { id: 'a2', n: 2, nombre: 'Probar y observar', momento: 'antes del receso', min: 5, color: '#C6F33A', preguntas: [
    { id: 'a2q1', type: 'classify', t: 60, q: '¿Qué prueba atrapa primero cada error de PixPro?', bins: ['Unitaria', 'Integración', 'Contrato', 'Extremo a extremo'],
      o: ['El avance calcula 102 %', 'La consulta usa una columna renombrada', 'El evento cambió «hechas» por «procesadas»', 'El botón Procesar no responde en móvil'],
      a: [0, 1, 2, 3], e: 'Lógica → unitaria. SQL contra una BD real → integración. Campos entre servicios → contrato. Botones y flujo completo → extremo a extremo.' },
    { id: 'a2q2', type: 'quiz', t: 25, q: 'Un lote tarda 30 s y no sabes en cuál de 5 servicios. ¿Qué señal te dice dónde se fue el tiempo?',
      o: ['Una métrica de CPU', 'Una traza distribuida', 'Un registro sin trace_id', 'El código fuente'],
      a: 1, e: 'La traza muestra cada span con su duración: ves de un vistazo que 28 de los 30 s se fueron esperando a Miniaturas.' },
    { id: 'a2q3', type: 'quiz', t: 20, q: '¿En qué cabecera estándar viaja el trace id entre servicios?',
      o: ['Authorization', 'traceparent', 'Content-Type', 'X-Powered-By'],
      a: 1, e: 'traceparent (W3C Trace Context). OpenTelemetry la crea y la propaga sola; dentro de un evento del broker hay que mandarla también.' },
    { id: 'a2q4', type: 'tf', t: 15, q: 'Un buen registro en un sistema distribuido debe incluir el trace_id.', o: ['Verdadero', 'Falso'],
      a: 0, e: 'Verdadero. Con el trace_id puedes juntar los registros de todos los servicios de una misma petición.' },
  ] },
  { id: 'a3', n: 3, nombre: 'Detectives de red', momento: 'después de problemas comunes', min: 5, color: '#B78CFF', preguntas: [
    { id: 'a3q1', type: 'quiz', t: 25, q: 'El navegador recibe 504 Gateway Timeout. ¿Quién escribió ese error?',
      o: ['El código de la API', 'El proxy, porque se cansó de esperar a la API', 'El navegador', 'La base de datos'],
      a: 1, e: 'El 504 lo escribe el proxy cuando la API no responde antes de su timeout. La API puede terminar bien… cuando el usuario ya se fue.' },
    { id: 'a3q2', type: 'classify', t: 60, q: '¿Qué comando responde cada pregunta?', bins: ['DNS: ¿a qué IP?', 'Puerto: ¿escucha?', 'Certificado: ¿vale?', 'HTTP: ¿qué responde?'],
      o: ['dig pixpro.app', 'ss -ltnp', 'openssl s_client', 'curl -v'],
      a: [0, 1, 2, 3], e: 'dig → DNS. ss → puertos abiertos. openssl s_client → certificado. curl -v → la respuesta HTTP completa. Empieza casi siempre por curl -v.' },
    { id: 'a3q3', type: 'classify', t: 60, q: '¿Problema de red, de concurrencia o de configuración?', bins: ['Red', 'Concurrencia', 'Configuración'],
      o: ['El DNS de la escuela guarda la IP vieja por un día', 'Dos clics rápidos crean dos lotes iguales', 'La API apunta a la base de datos de pruebas', 'Una consulta espera 74 s por un bloqueo', 'El timeout del proxy es menor que la operación', 'Se pierden paquetes por un cable dañado'],
      a: [0, 1, 2, 1, 2, 0], e: 'Red: DNS y paquetes perdidos. Concurrencia: dos peticiones a la vez y bloqueos. Configuración: variables y timeouts mal puestos (como el puerto del proxy en el simulador).' },
    { id: 'a3q4', type: 'quiz', t: 25, q: '¿Cómo evitas que dos clics creen dos lotes?',
      o: ['Pedir al usuario que no haga doble clic', 'Una llave de idempotencia: la misma petición repetida no crea nada nuevo', 'Subir el timeout', 'Reintentar más veces'],
      a: 1, e: 'La llave de idempotencia (por ejemplo, un id generado en el cliente) hace que repetir la petición sea seguro. También es lo que permite reintentar sin miedo.' },
  ] },
  { id: 'a4', n: 4, nombre: 'Resistir la falla', momento: 'antes de terminar', min: 6, color: '#FF8A3D', preguntas: [
    { id: 'a4q1', type: 'quiz', t: 25, q: 'El disyuntor está abierto. ¿Qué hace con una petición nueva?',
      o: ['La manda al servicio y espera', 'Falla al instante sin llamar al servicio (y usa el plan B)', 'La reintenta 3 veces', 'La guarda para mañana'],
      a: 1, e: 'Abierto = no insistir. Responde rápido con el plan B y, pasado un tiempo, pasa a medio abierto para probar con una sola llamada.' },
    { id: 'a4q2', type: 'tf', t: 15, q: 'Siempre conviene reintentar una operación que falló.', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. Solo se reintenta si la falla es pasajera y la operación es idempotente, con tope, backoff y jitter. Reintentar un pago sin llave puede cobrar dos veces.' },
    { id: 'a4q3', type: 'quiz', t: 25, q: 'Miniaturas está caído. ¿Cuál es la degradación elegante en PixPro?',
      o: ['Mostrar una página de error', 'Crear el lote con un icono genérico y generar la miniatura después', 'Esperar a que vuelva', 'Bloquear la subida de fotos'],
      a: 1, e: 'Lo esencial (subir y procesar) sigue funcionando; lo accesorio (la miniatura) llega después. Como la FAA: algunas frecuencias siguieron y 3 500 aviones aterrizaron.' },
    { id: 'a4q4', type: 'order', t: 45, q: 'Ordena la respuesta a un incidente en PixPro',
      o: ['Diagnosticar con trazas y registros', 'Escribir el postmortem sin culpables', 'Una alerta avisa que los lotes no terminan', 'Corregir la causa y desplegar', 'Contener: abrir el disyuntor o revertir el cambio'],
      a: [2, 4, 0, 3, 1], e: 'Detectar → contener → diagnosticar → corregir → aprender. Primero se detiene el daño (como bloquear los dos sitios), después se busca la causa con calma.' },
    { id: 'a4q5', type: 'scale', t: 40, q: 'Termómetro final: ¿y ahora qué tan seguro te sientes?', o: TERMO, lo: 'nada', hi: 'podría explicarlo', compare: 'a1q0' },
  ] },
];
export const ACTIVIDAD = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, a]));
export const LETRAS = ['A', 'B', 'C', 'D', 'E'];
export const TIPO = { quiz: 'Quiz', tf: 'Verdadero o falso', classify: 'Clasifica', order: 'Ordena', scale: 'Termómetro' };

/** Puntaje 0..100 de una respuesta (null en el termómetro). */
export function puntaje(q, r) {
  if (q.type === 'scale') return null;
  if (r == null) return 0;
  if (q.type === 'classify') return Math.round((100 * q.a.reduce((s, b, i) => s + (r[i] === b ? 1 : 0), 0)) / q.a.length);
  if (q.type === 'order') return Array.isArray(r) && r.every((v, i) => v === q.a[i]) ? 100 : 0;
  return r === q.a ? 100 : 0;
}
