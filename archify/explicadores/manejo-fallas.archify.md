# ¿Qué hace PixPro cuando el servicio de miniaturas falla? {#manejo-fallas}

No se cae con él: pone **timeout** a cada llamada, **reintenta** pocas veces con backoff y jitter, abre un **disyuntor** (circuit breaker) para dejar de insistir y **degrada con elegancia**: muestra el lote con un icono genérico en vez de la miniatura.

- Toda llamada remota necesita un timeout; sin él, un servicio lento atrapa a quien lo llama.[](source:aws)
- Un disyuntor deja de llamar a un servicio que falla y prueba de vez en cuando si ya se recuperó.[](source:fowler)
- Separar recursos por dependencia (bulkhead) evita que una falla consuma todo.[](source:azure)

@answer scope="Manejo de fallas de una dependencia en PixPro"
@meta locale=es
@source aws title="AWS Builders' Library: Timeouts, retries and backoff with jitter" url=https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
@source fowler title="Martin Fowler: CircuitBreaker" url=https://martinfowler.com/bliki/CircuitBreaker.html
@source azure title="Azure Architecture Center: Circuit Breaker pattern" url=https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker

## ¿Cómo funciona el disyuntor? {#disyuntor}

@workflow id=disyuntor-flujo title="Tres estados del disyuntor"
| cerrado | Cerrado: las llamadas pasan | backend |
| abierto | Abierto: falla rápido sin llamar | security |
| medio | Medio abierto: deja pasar una de prueba | external |
| cerrado > abierto | 5 fallas seguidas | emphasis |
| abierto > medio | pasan 30 s | |
| medio > cerrado | la prueba funciona | |
| medio > abierto | la prueba falla | |

@steps id=disyuntor-pasos
| d1 | Cerrado | Todo normal: las llamadas pasan y se cuentan las fallas. | disyuntor-flujo | cerrado |
| d2 | Abierto | Tras varias fallas deja de llamar: responde al instante con el plan B. | disyuntor-flujo | abierto |
| d3 | Medio abierto | Pasado un tiempo deja pasar una llamada para ver si el servicio volvió. | disyuntor-flujo | medio |

## ¿Qué herramienta para qué falla? {#patrones}

| Patrón | Para qué |
| --- | --- |
| Timeout | No esperar para siempre {good:Siempre} |
| Reintento con backoff + jitter | Fallas pasajeras; solo si la operación es idempotente {caution:Con cuidado} |
| Disyuntor | Una dependencia caída: dejar de insistir {good:Protege} |
| Bulkhead | Que una dependencia lenta no agote todos los hilos o conexiones |
| Degradación elegante | Seguir dando lo esencial con menos funciones {good:Usuario} |
| Load shedding | Rechazar rápido el exceso cuando ya no hay capacidad |

## ¿Qué revisamos? {#checklist}

- [ ] ¿Cada llamada remota tiene timeout?
- [ ] ¿Los reintentos tienen tope, jitter y llave de idempotencia?
- [ ] ¿Qué ve el fotógrafo si falla miniaturas, el broker o el WebSocket?
- [ ] ¿Los errores se registran con trace id y se cuentan en una métrica?
