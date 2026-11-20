# ¿Por qué un router nuevo detuvo todos los vuelos de Estados Unidos? {#caida-faa}

Un router recién instalado en un sitio remoto **inundó la red de la FAA con intentos de conexión**: el equipo antiguo se volvió inestable en 17 de 22 centros de control y la FAA ordenó un **paro nacional de despegues** durante casi cinco horas.

- La red FTI de la FAA recibió unos 1 000 intentos de conexión cada 4 a 5 segundos.[](source:faa)
- Las fuentes probables fueron un sitio de radio en El Dorado, Arkansas, donde se instalaba un router nuevo, y un sitio de radar en Amarillo, Texas.[](source:faa)
- L3Harris bloqueó los dos sitios y la red se estabilizó; la FAA desactivó la función de difusión en más de 60 routers.[](source:faa)
- Los equipos habían pasado pruebas antes de instalarse, pero se cuestiona si reflejaban las condiciones reales.[](source:agn)

@answer scope="Paro nacional de la FAA · 13 de noviembre de 2026 · información preliminar"
@meta locale=es
@source faa title="FAA: Nationwide Ground Stop, Questions and Answers" url=https://www.faa.gov/newsroom/nationwide-ground-stop-questions-and-answers
@source mte title="Make Tech Easier: FAA ground stop, El Dorado and Amarillo routers" url=https://maketecheasier.com/faa-ground-stop-eldorado-amarillo-routers/
@source agn title="Aerospace Global News: FAA pauses router upgrades after nationwide ground stop" url=https://aerospaceglobalnews.com/news/faa-pauses-router-upgrades-us-ground-stop/

## ¿Cómo un router afectó a todo el país? {#cascada}

@workflow id=faa-flujo title="De un sitio remoto a un paro nacional"
| router | Router nuevo | external |
| flood | Inundación de conexiones | external |
| legado | Equipo antiguo inestable | backend |
| centros | 17 de 22 centros | backend |
| paro | Paro nacional | security |
| router > flood | |
| flood > legado | |
| legado > centros | |
| centros > paro | | emphasis |

@steps id=faa-pasos
| f1 | Router nuevo | Se instalaba a mediodía en un sitio remoto de radio. Tenía una función de difusión que enviaba datos más lejos de lo necesario. | faa-flujo | router |
| f2 | Inundación | La red recibió unos 1 000 intentos de conexión cada 4 a 5 segundos. | faa-flujo | flood |
| f3 | Equipo antiguo | El equipo heredado no estaba hecho para ese volumen y se volvió inestable. | faa-flujo | legado |
| f4 | Centros de control | La inestabilidad llegó a 17 de 22 centros y a varias aproximaciones. | faa-flujo | centros |
| f5 | Paro | La FAA detuvo los despegues en todo el país mientras buscaba la causa. | faa-flujo | paro |

## ¿Cuándo pasó cada cosa? {#cronologia}

@timeline id=faa-cronologia title="13 de noviembre de 2026 (hora del Este)"
| lane faa | FAA |
| inestable | 2026-11-13T14:45:00-05:00 | Empieza la inestabilidad de la red (aprox.) | faa | alert |
| paro | 2026-11-13T15:30:00-05:00 | Paro nacional de despegues | faa | alert |
| bloqueo | 2026-11-13T17:00:00-05:00 | Bloquean los sitios de El Dorado y Amarillo (aprox.) | faa | action |
| reanuda | 2026-11-13T20:15:00-05:00 | Se reanudan los vuelos | faa | recovery |

La hora del inicio y del bloqueo son aproximadas: la FAA solo publicó el paro y la reanudación.

## ¿Qué lo habría prevenido o acortado? {#lecciones}

| Práctica | Qué habría cambiado |
| --- | --- |
| Pruebas en condiciones reales (carga y red completa) | Ver la inundación antes de instalar {good:Prevenir} |
| Métricas de intentos de conexión por sitio | Encontrar el origen en minutos {good:Detectar} |
| Límite de conexiones por origen (rate limit) | Que un sitio no tumbe la red entera {good:Contener} |
| Cambios fuera de horario pico y con reversa lista | Menos impacto y vuelta atrás rápida |
| Degradación elegante | Algunas frecuencias y radares siguieron funcionando: 3 500 aviones aterrizaron sin problema {good:Funcionó} |

## ¿Qué revisamos en PixPro? {#checklist}

- [ ] ¿Nuestras pruebas simulan la carga y la red reales, o solo un laboratorio?
- [ ] ¿Sabríamos qué cliente o servicio manda tráfico de más?
- [ ] ¿Un solo origen puede saturar a todos?
- [ ] ¿Qué sigue funcionando cuando falla una dependencia?
