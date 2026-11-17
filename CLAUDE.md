# Portal LEXSAN Radiadores S.A.C.

Sistema de gestión interno de LEXSAN (Arequipa): clientes, recepción, evaluación, cotizaciones con PDF, aprobación, órdenes de trabajo, pagos y adelantos, inventario, compras y gastos, registro diario y reportes. Lo inició Codex (OpenAI); desde el 16/11/2026 lo continúa Claude Code. Todo el trabajo y la comunicación van en español.

## Stack

- HTML, CSS y JavaScript sin framework. Scripts clásicos con funciones globales y manejadores `onclick` en línea; no es una SPA con módulos.
- Firebase 12: Authentication (correo y contraseña), Firestore y Storage. Proyecto `lexsan-portal`.
- esbuild empaqueta solo `firebase-adapter.js` y `client-file-reader.js`; el resto se copia tal cual a `dist/`.
- PDF con generador propio (`assets/js/pdf.js`); `pdfjs-dist` se usa para leer comprobantes.
- Pruebas: `node --test` para dominio, Playwright con Microsoft Edge para flujos.

## Comandos

| Para | Comando |
|---|---|
| Instalar | `npm ci` |
| Servidor local (modo local, sin Firebase) | `npm run dev` y abrir http://127.0.0.1:4173 |
| Compilar en modo local | `npm run build` |
| Compilar para producción (Firebase) | `node scripts/build.cjs --production` (necesita `config/firebase.local.json`) |
| Pruebas de dominio | `npm test` |
| Flujo completo por interfaz | `npm run test:e2e` (necesita el servidor corriendo y Edge) |
| Regresiones | `npm run test:regression` |
| Reglas de Firestore | `npm run test:rules` (necesita Java y Firebase CLI) |

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura y entrada |
| `assets/js/domain.js` | Cálculos, validación, migración, reportes, fecha de Lima. Es lo que cubren las pruebas unitarias |
| `assets/js/store.js` | Persistencia local (`localStorage`, clave `lexsan_ciclo_phva_v2`) |
| `assets/js/firebase-adapter.js` | Auth, Firestore y Storage |
| `assets/js/legacy-core.js` | Formularios y flujo original; incluye los datos de demostración que el build de producción elimina |
| `assets/js/operations.js`, `enterprise.js` | Mantenimiento, ventas, fotos, pagos, inventario, técnicos, reportes |
| `assets/js/quotation.js`, `quote-assistant.js`, `pdf.js` | Cotizaciones, asistente y PDF |
| `assets/js/expenses.js`, `invoice-import.js`, `daily.js` | Compras y gastos, lectura de comprobantes, registro diario |
| `firestore.rules`, `storage.rules` | Seguridad real del sistema |
| `docs/` | Auditoría, arquitectura y pruebas escritas por Codex. Están desactualizadas respecto a Firebase |

## Git y publicación

- Repositorio: `mateobartra-arch/LEXSAN` (público).
- `portal-firebase`: código fuente. Aquí se trabaja, en ramas nuevas que salen de esta.
- `main`: **solo la aplicación compilada** que sirve GitHub Pages. No se edita a mano.
- Publicado en https://lexsan-portal.web.app/ (Firebase Hosting, el oficial) y https://mateobartra-arch.github.io/LEXSAN/. Ambos usan los mismos datos de producción.
- El proyecto de Firebase está en la cuenta de Google de administración de LEXSAN. Desplegar o cambiar reglas requiere que Mateo inicie sesión y lo apruebe cada vez.

## Reglas del negocio

- Los precios se ingresan sin IGV; el IGV (18 %) se calcula solo: 500 sin IGV siempre da 590.
- Los costos detallados suman gastos generales antes del descuento y del IGV.
- Flujo: evaluación → aprobación → inicio → taller → entrega → documento → cerrado. Las ventas pasan de aprobación a entrega, sin evaluación ni orden de trabajo.
- Un expediente solo se cierra con entrega, comprobante registrado y pago total. Un adelanto no cierra ni adelanta el estado.
- Cotizar no reserva stock. El stock se descuenta al confirmar la entrega, y solo para líneas vinculadas al inventario.
- Los totales ya aprobados no se recalculan; los borradores antiguos con valores forzados piden revisión.
- La fecha de negocio es la de Lima, no UTC.
- Las cotizaciones llevan numeración correlativa que nunca retrocede: una serie por emisor (razón social), compartida por todos sus clientes y sin reinicio anual; el formato es número-año. El emisor, el formato, la presentación con o sin IGV, el porcentaje de gastos generales y el plazo de pago salen del perfil del cliente en el catálogo privado (`quoteLibrary`: `issuers`, `profiles`, `costCatalog`). Sin catálogo solo existe el emisor S.A.C.
- `assets/js/quote-templates.js` tiene las plantillas de servicio, notas e ítems frecuentes. Solo redacción técnica: nunca precios, clientes ni cuentas.
- Publicar la numeración por emisor exige cargar antes `privado/catalogo-emisores.json` en Firestore; sin eso la serie arrancaría desde el último número que conozca el portal.
- Antes de cambiar cualquier cosa de cotizaciones, leer `privado/COMO-COTIZA-LEXSAN.md` (carpeta local, fuera de Git): emisores, formatos por cliente, plantillas de pasos, notas y precios de referencia.
- Roles: `gerencia`, `administracion`, `tecnico`. Los técnicos solo ven tickets asignados y solo editan evaluación y avance. Nada se borra desde el portal.
- El portal no emite comprobantes electrónicos; solo registra los emitidos fuera.

## Reglas de trabajo

- Respetar la arquitectura y el estilo existentes. No reescribir ni cambiar de framework sin preguntar.
- Commits pequeños y descriptivos en español. No hacer `push`, desplegar ni tocar `main` sin visto bueno.
- No borrar archivos ni datos sin confirmación. Firestore tiene datos reales de clientes.
- Nunca subir `config/firebase.local.json`, claves de cuenta de servicio, respaldos ni cotizaciones reales. La carpeta `Downloads\LEXSAN_ANALISIS_PRIVADO` (cotizaciones históricas y scripts de importación) queda fuera del repositorio, igual que `privado/` (excluida en `.gitignore`; nunca usar `git add -f` sobre ella).
- Probar en modo local (`npm run dev`) antes de proponer un despliegue.

## Deuda conocida

- Los documentos que recibe un técnico incluyen datos comerciales; la interfaz los oculta, pero las reglas no.
- El adaptador carga colecciones completas al iniciar: sin paginación ni escucha de cambios.
- Los manejadores en línea impiden una política CSP estricta.
- Sin bitácora inmutable ni estrategia de respaldos de Firestore.
- Las pruebas de reglas no se han corrido en esta PC.
