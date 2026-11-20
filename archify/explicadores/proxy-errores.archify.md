# ¿Por qué el navegador ve un 502 o un 504 si mi servidor «está bien»? {#proxy-errores}

Porque entre el navegador y tu servidor hay un **proxy** (balanceador, gateway, CDN): un **502** significa que el proxy recibió una respuesta inválida o nada del servidor, y un **504** que se cansó de esperar. El error lo escribe el proxy, no tu código.

- 502 Bad Gateway: el proxy recibió una respuesta inválida del servidor de atrás.[](source:mdn502)
- 504 Gateway Timeout: el proxy no recibió respuesta a tiempo.[](source:mdn504)
- Si el timeout del proxy es menor que lo que tarda el servidor, el usuario ve error aunque el trabajo termine.[](source:aws)

@answer scope="Errores entre navegador, proxy y servidor"
@meta locale=es
@source mdn502 title="MDN: 502 Bad Gateway" url=https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/502
@source mdn504 title="MDN: 504 Gateway Timeout" url=https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504
@source aws title="AWS Builders' Library: Timeouts, retries and backoff with jitter" url=https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/

## ¿Dónde nace cada error? {#donde}

@sequence id=proxy-camino title="El mismo pedido, tres finales"
| actor nav | Navegador | frontend |
| actor px | Proxy | security |
| actor api | API | backend |
| phase | Bien |
| nav | px | GET /lotes/42 |
| px | api | reenvía |
| api | px | 200 en 0.3 s | return |
| px | nav | 200 | return |
| phase | Servidor caído |
| px | api | reenvía (conexión rechazada) | emphasis |
| px | nav | 502 lo escribe el proxy | return |
| phase | Servidor lento |
| px | api | reenvía y espera 60 s | emphasis |
| px | nav | 504 lo escribe el proxy | return |

@steps id=proxy-pasos
| x1 | Bien | El proxy reenvía y devuelve la respuesta tal cual. | proxy-camino | px |
| x2 | 502 | El servidor no contestó bien: estaba caído, en otro puerto o cerró la conexión. | proxy-camino | api |
| x3 | 504 | El servidor tardó más que el timeout del proxy. | proxy-camino | px |

## ¿Qué herramienta uso para cada pregunta? {#herramientas}

| Pregunta | Herramienta |
| --- | --- |
| ¿Qué responde realmente y con qué cabeceras? | curl -v {good:Primero} |
| ¿El nombre resuelve a la IP correcta? | dig o nslookup |
| ¿Hay camino de red y cuánto tarda? | ping, traceroute, mtr |
| ¿El puerto está abierto y escuchando? | ss -ltnp, nc -vz |
| ¿El certificado es válido y para qué dominio? | openssl s_client |
| ¿Qué paquetes van y vienen? | tcpdump, Wireshark {caution:Último recurso} |
| ¿Qué ve el navegador? | DevTools → Red |

## ¿Qué revisamos? {#checklist}

- [ ] ¿El timeout del proxy es mayor que lo que tarda la operación más lenta?
- [ ] ¿El proxy pasa el trace id y X-Forwarded-For?
- [ ] ¿Los registros del proxy dicen a qué servidor reenvió y cuánto tardó?
- [ ] ¿El health check apunta al puerto y a la ruta correctos?
