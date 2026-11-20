import { useState } from 'react';

/* Simulador "Consola de diagnóstico": tres incidentes de PixPro. Corre comandos de red
   (salidas simuladas pero realistas) y elige el diagnóstico. Sin red real. */

const CASOS = [
  {
    id: 'c502', titulo: 'PixPro responde 502 Bad Gateway', resp: 1,
    cmds: [
      ['curl -sv https://pixpro.app/api/lotes', `> GET /api/lotes HTTP/2
> Host: pixpro.app
< HTTP/2 502
< server: nginx
< content-type: text/html
<html><body><h1>502 Bad Gateway</h1></body></html>`],
      ['tail /var/log/nginx/error.log', `[error] connect() failed (111: Connection refused) while connecting
to upstream, upstream: "http://10.0.2.15:8080/api/lotes"`],
      ['ss -ltnp   (en el servidor de la API)', `State   Local Address:Port   Process
LISTEN  0.0.0.0:8081         users:(("java",pid=2231))
LISTEN  0.0.0.0:22           users:(("sshd",pid=611))`],
      ['dig +short pixpro.app', '198.51.100.20'],
    ],
    opciones: ['El DNS apunta a otro servidor', 'El proxy busca la API en el puerto 8080, pero ahora escucha en 8081', 'El certificado está vencido', 'La base de datos está lenta'],
    porque: 'Connection refused hacia 10.0.2.15:8080 y ss muestra la API en 8081: alguien cambió el puerto en la configuración de la API y no en la del proxy. Es un error de configuración, no de código.',
  },
  {
    id: 'cdns', titulo: '«En mi casa sí carga, en la escuela no»', resp: 0,
    cmds: [
      ['dig api.pixpro.app   (red de la escuela)', `;; ANSWER SECTION:
api.pixpro.app.  86400  IN  A  203.0.113.10`],
      ['dig @1.1.1.1 api.pixpro.app', `;; ANSWER SECTION:
api.pixpro.app.  300  IN  A  198.51.100.20`],
      ['curl -sv --connect-timeout 5 https://api.pixpro.app', `*   Trying 203.0.113.10:443...
* Connection timed out after 5001 milliseconds`],
      ['ping -c 2 198.51.100.20', `64 bytes from 198.51.100.20: icmp_seq=1 ttl=54 time=38.2 ms
64 bytes from 198.51.100.20: icmp_seq=2 ttl=54 time=37.9 ms`],
    ],
    opciones: ['El DNS de la escuela todavía guarda la IP del servidor viejo', 'El servidor nuevo está caído', 'El proxy tiene el timeout muy corto', 'Hay un error en el JavaScript'],
    porque: 'La red de la escuela responde 203.0.113.10 (el servidor viejo) con un TTL de 86 400 s: guardará esa respuesta hasta un día. El servidor nuevo responde bien. Antes de mudar un servidor, se baja el TTL con anticipación.',
  },
  {
    id: 'ctls', titulo: 'El navegador dice «La conexión no es privada»', resp: 2,
    cmds: [
      ['curl -sv https://pixpro.app', `* SSL certificate problem: certificate has expired
curl: (60) SSL certificate problem: certificate has expired`],
      ['openssl s_client -connect pixpro.app:443 | openssl x509 -noout -dates -subject', `notBefore=Aug 20 00:00:00 2026 GMT
notAfter=Nov 18 23:59:59 2026 GMT
subject=CN = pixpro.app`],
      ['date -u', 'Fri Nov 20 22:14:03 UTC 2026'],
      ['dig +short pixpro.app', '198.51.100.20'],
    ],
    opciones: ['El DNS no resuelve', 'Bloqueo de un firewall', 'El certificado TLS venció el 18 de noviembre', 'El servidor no tiene memoria'],
    porque: 'notAfter fue el 18 de noviembre y hoy es 20: el certificado venció. La renovación automática falló sin que nadie se enterara. Arreglo: renovar y poner una alerta que avise 14 días antes del vencimiento.',
  },
];

export default function Diagnostico() {
  const [c, setC] = useState(0);
  const [corridos, setCorridos] = useState([]);
  const [resp, setResp] = useState(null);
  const caso = CASOS[c];
  const cambiar = (i) => { setC(i); setCorridos([]); setResp(null); };
  return (
    <div className="sim diag">
      <div className="sim-ctrl">{CASOS.map((x, i) => <button key={x.id} className={`cbtn ${c === i ? 'on' : ''}`} onClick={() => cambiar(i)}>{i + 1} · {x.titulo}</button>)}</div>
      <div className="diag-grid">
        <div className="diag-cmds">
          <span className="mono">1 · corre comandos</span>
          {caso.cmds.map(([cmd], i) => <button key={i} className={`diag-cmd mono ${corridos.includes(i) ? 'on' : ''}`} onClick={() => !corridos.includes(i) && setCorridos([...corridos, i])}>$ {cmd}</button>)}
        </div>
        <pre className="diag-term" aria-live="polite">{corridos.length ? corridos.map((i) => `$ ${caso.cmds[i][0]}\n${caso.cmds[i][1]}\n`).join('\n') : '# La terminal está vacía. Elige un comando a la izquierda.'}</pre>
      </div>
      <div className="diag-ops">
        <span className="mono">2 · ¿cuál es el diagnóstico?</span>
        {caso.opciones.map((o, i) => (
          <button key={i} disabled={!corridos.length} className={`diag-op ${resp === i ? (i === caso.resp ? 'ok' : 'mal') : ''} ${resp != null && i === caso.resp ? 'ok' : ''}`} onClick={() => setResp(i)}>{o}</button>
        ))}
      </div>
      <p className={`sim-msg ${resp == null ? '' : resp === caso.resp ? 'ok' : 'bad'}`}>
        {resp == null ? (corridos.length ? 'Lee la salida con calma: la pista casi siempre está en una sola línea.' : 'Primero los datos, después la conclusión: corre al menos un comando.') : resp === caso.resp ? `✓ ${caso.porque}` : '✗ Revisa otra vez la salida de los comandos. ¿Qué línea contradice esa idea?'}
      </p>
    </div>
  );
}
