# ¿Qué prueba atrapa cada error de PixPro? {#pruebas-pixpro}

Cada tipo de prueba ve **una parte distinta del sistema**: las unitarias revisan la lógica, las de **integración** revisan que las piezas reales hablen bien entre sí y las de **extremo a extremo** revisan el recorrido completo del usuario.

- Muchas pruebas pequeñas y rápidas abajo, y pocas pruebas lentas de extremo a extremo arriba.[](source:fowler)
- Las pruebas de integración usan una base de datos y un broker reales, por ejemplo con contenedores desechables.[](source:testcontainers)
- Una prueba de extremo a extremo maneja un navegador real, como lo haría el fotógrafo.[](source:playwright)

@answer scope="Estrategia de pruebas para el flujo de subir un lote en PixPro"
@meta locale=es
@source fowler title="Martin Fowler: The Practical Test Pyramid" url=https://martinfowler.com/articles/practical-test-pyramid.html
@source testcontainers title="Testcontainers" url=https://testcontainers.com/
@source playwright title="Playwright" url=https://playwright.dev/

## ¿Qué cubre cada prueba en el flujo de un lote? {#flujo}

@workflow id=flujo-lote title="Subir un lote y ver el avance"
| spa | SPA: el fotógrafo sube 50 fotos | frontend |
| api | API de lotes | backend |
| db | Base de datos | database |
| broker | Broker: lote.events | messagebus |
| notif | Notificaciones (WebSocket) | backend |
| spa > api | POST /lotes | |
| api > db | guarda el lote | |
| api > broker | LoteCreado | |
| broker > notif | ImagenProcesada | |
| notif > spa | avance 1/50… | emphasis |

@steps id=flujo-pruebas
| p1 | Unitaria | Revisa una función sola, por ejemplo calcular el porcentaje de avance. Sin red ni base de datos. | flujo-lote | api |
| p2 | Integración | Levanta la API con una base de datos real en un contenedor y revisa que el lote se guarde. | flujo-lote | db |
| p3 | Contrato | Revisa que el evento ImagenProcesada siga teniendo los campos que espera Notificaciones. | flujo-lote | broker |
| p4 | Extremo a extremo | Un navegador real sube fotos y espera ver «50/50». | flujo-lote | spa |

## ¿Cuánto cuesta cada una? {#costos}

| Tipo | Qué atrapa | Tiempo típico |
| --- | --- | --- |
| Unitaria | Errores de lógica {good:Rápida} | Milisegundos |
| Integración | SQL mal escrito, configuración, conexiones reales | Segundos |
| Contrato | Campos renombrados entre servicios {caution:Olvidada} | Segundos |
| Extremo a extremo | Botones rotos, flujos completos {caution:Lenta} | Minutos |
| Carga | Lo que solo pasa con mucho tráfico (como la FAA) {bad:Rara vez se hace} | Minutos u horas |

## ¿Cómo se ve una prueba de extremo a extremo? {#e2e}

```javascript title="Playwright: el fotógrafo ve el lote terminar"
test('un lote llega a 50/50', async ({ page }) => {
  await page.goto('/lotes/nuevo');
  await page.setInputFiles('input[type=file]', fotos50);
  await page.getByRole('button', { name: 'Procesar' }).click();
  await expect(page.getByText('50/50')).toBeVisible({ timeout: 60_000 });
});
```

## ¿Qué revisamos? {#checklist}

- [ ] ¿Las pruebas de integración usan servicios reales o solo simulados?
- [ ] ¿Hay una prueba de contrato para cada evento entre servicios?
- [ ] ¿Las pocas pruebas de extremo a extremo cubren el camino principal?
- [ ] ¿Alguna prueba simula la carga real?
