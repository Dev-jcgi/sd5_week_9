# ¿Cómo encuentro dónde se atoró un lote entre cinco servicios? {#traza-pixpro}

Con **una traza distribuida**: cada servicio mide su parte (un **span**) y pasa el mismo **trace id** al siguiente, así se ve el viaje completo; las **métricas** dicen *que* algo va mal y los **registros** explican *qué* pasó en un punto.

- Métricas, registros y trazas son las tres señales de observabilidad que estandariza OpenTelemetry.[](source:otel)
- El trace id viaja entre servicios en la cabecera estándar traceparent.[](source:w3c)
- Las cuatro señales doradas son latencia, tráfico, errores y saturación.[](source:sre)

@answer scope="Observabilidad de un lote de PixPro entre varios servicios"
@meta locale=es
@source otel title="OpenTelemetry: Signals" url=https://opentelemetry.io/docs/concepts/signals/
@source w3c title="W3C Trace Context" url=https://www.w3.org/TR/trace-context/
@source sre title="Google SRE Book: Monitoring Distributed Systems" url=https://sre.google/sre-book/monitoring-distributed-systems/

## ¿Cómo viaja el trace id? {#viaje}

@sequence id=traza-viaje title="Un mismo trace id en todo el recorrido"
| actor spa | SPA | frontend |
| actor gw | Proxy / gateway | security |
| actor api | API de lotes | backend |
| actor broker | Broker | messagebus |
| actor notif | Notificaciones | backend |
| phase | Petición |
| spa | gw | POST /lotes · traceparent 4bf9… |
| gw | api | mismo traceparent |
| api | broker | LoteCreado + traceparent |
| phase | Avance |
| broker | notif | ImagenProcesada + traceparent |
| notif | spa | avance por WebSocket | return |

@steps id=traza-pasos
| t1 | SPA | Crea el trace id y lo manda en la cabecera traceparent. | traza-viaje | spa |
| t2 | Gateway | No lo cambia: solo agrega su propio span. | traza-viaje | gw |
| t3 | Broker | El trace id va dentro del evento para no perder el hilo. | traza-viaje | broker |

## ¿Qué aporta cada señal? {#senales}

| Señal | Responde | Ejemplo en PixPro |
| --- | --- | --- |
| Métrica | ¿Algo va mal? ¿Cuánto? | Lotes terminados por minuto bajó a 0 {good:Alerta} |
| Registro | ¿Qué pasó exactamente aquí? | {"nivel":"error","trace_id":"4bf9…","msg":"timeout al broker"} |
| Traza | ¿Dónde se fue el tiempo? | 28 de los 30 s se perdieron entre la API y el broker {good:Ubica} |

## ¿Qué revisamos? {#checklist}

- [ ] ¿Todos los registros son JSON e incluyen el trace id?
- [ ] ¿El trace id viaja también dentro de los eventos del broker?
- [ ] ¿Medimos latencia, tráfico, errores y saturación de cada servicio?
- [ ] ¿Hay una alerta cuando los lotes dejan de terminar?
