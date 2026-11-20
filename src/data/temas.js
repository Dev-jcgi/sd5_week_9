// Temas de la Semana 9 (DS5): probar, observar, diagnosticar y resistir fallas, a partir del paro nacional de la FAA (13 nov 2026).
export const TEMAS = [
  { id: 't1', n: 1, titulo: 'Caso real: un router detiene los vuelos de un país', corto: 'Caso FAA', color: '#FF6B8B', min: 12 },
  { id: 't2', n: 2, titulo: 'Pruebas automatizadas de integración y de extremo a extremo', corto: 'Pruebas', color: '#C6F33A', min: 17 },
  { id: 't3', n: 3, titulo: 'Métricas, registros y trazas en sistemas distribuidos', corto: 'Observabilidad', color: '#6EA8FF', min: 15 },
  { id: 't4', n: 4, titulo: 'Depurar proxies y herramientas de diagnóstico de red', corto: 'Proxies y red', color: '#B78CFF', min: 12 },
  { id: 't5', n: 5, titulo: 'Problemas comunes: red, concurrencia y configuración', corto: 'Problemas comunes', color: '#5CE1E6', min: 10 },
  { id: 't6', n: 6, titulo: 'Manejo de fallas: errores, reintentos, disyuntores y degradación', corto: 'Manejo de fallas', color: '#FF8A3D', min: 15 },
];
export const TEMA = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
