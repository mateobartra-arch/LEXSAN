# Portal LEXSAN Radiadores

Esta rama contiene el código fuente del portal.

## Abrir en desarrollo

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:4173. El servidor de desarrollo usa almacenamiento local y datos de ejemplo. Para trabajar con Claude Code, abre una terminal en la carpeta clonada y ejecuta `claude`.

## Firebase

El build de producción usa la configuración web de Firebase en `config/firebase.local.json`, excluida de Git. Ejecuta `node scripts/build.cjs --production` con la configuración del proyecto. Antes de publicar esa versión, despliega las reglas de Firestore de esta rama junto a Hosting, ya que el módulo Gastos usa una colección con acceso de administración y gerencia.

La rama `main` contiene la demostración de GitHub Pages. `npm run build` y `node scripts/package-demo.cjs` generan el paquete estático actualizado para Pages.
