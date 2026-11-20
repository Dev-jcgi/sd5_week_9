# DS5 · Semana 9 · Cuando algo falla (PixPro)

Presentación interactiva (reveal.js + React) que parte del paro nacional de la FAA del 13 de noviembre de 2026
y recorre: pruebas de integración y de extremo a extremo, métricas, registros y trazas, depuración de proxies y
herramientas de red, problemas comunes (red, concurrencia, configuración) y manejo de fallas
(timeouts, reintentos, disyuntores y degradación elegante).

- `#/profesor` · **modo profesor**: inicias sesión, se abre una sala con un solo QR/PIN y lanzas cada actividad desde la barra de abajo.
- `#/sala` · el celular del estudiante en la clase en vivo (apodo + PIN, una sola vez).
- `#/presentacion` · la presentación pública (→ temas, ↓ profundizar). `?t=t4` abre un tema.
- `#/actividades` · las 4 actividades para practicar por cuenta propia, con autocorrección.
- `#/simuladores` · cazabugs, encuentra el culpable (trazas), consola de diagnóstico y disyuntor.
- `public/diagramas/` · diagramas de Archify (fuentes en `archify/`).

## Desarrollo

```bash
npm install
npm run dev
```

## Publicar en GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: las mismas 5 variables de `sd5_week_8`
   (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_HOST_EMAIL`).
3. Cada push a `main` publica el sitio (o **Actions → Publicar → Run workflow**).

Usa el mismo proyecto de Firebase de las semanas 4–8 (Auth del profesor + Firestore). Las salas se marcan con `week: 9`.
Sin las variables, el sitio funciona en **modo demo local** (la sala solo conecta pestañas del mismo navegador).
