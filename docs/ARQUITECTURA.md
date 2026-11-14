# Arquitectura incremental

El usuario confirmó que el trabajo actual es **un copiloto local**. No se crearon proyectos, cuentas ni servicios remotos. Firebase es preparación opcional, no una integración productiva verificada.

| Archivo | Responsabilidad |
|---|---|
| `index.html` y entrada con nombre anterior | Estructura HTML y compatibilidad de entrada |
| `assets/css/portal.css` | Estilos existentes extraídos |
| `assets/css/enterprise.css` | Nuevos módulos y adaptación responsive |
| `assets/js/domain.js` | Cálculos, validación, migración, reportes y fecha Lima |
| `assets/js/store.js` | Persistencia y tratamiento de errores |
| `assets/js/legacy-core.js` | Formularios y flujo original conservados |
| `assets/js/operations.js` | Mantenimiento, ventas, fotos, pagos e inventario |
| `assets/js/enterprise.js` | Recepción mejorada, técnicos, reportes, validación |
| `assets/js/pdf.js` | Generador PDF propio |
| `assets/js/session.js` | Arranque, navegación y perfiles |
| `assets/js/firebase-adapter.js` | Adaptador opcional Auth/Firestore/Storage |

La capa de compatibilidad mantiene funciones y manejadores inline para no reconstruir el portal. No elimina toda la deuda del monolito. La siguiente extracción debe separar plantillas por módulo y reemplazar manejadores inline para aplicar una CSP estricta.

## Persistencia local

Se conserva `lexsan_ciclo_phva_v2`, con migración aditiva `schemaVersion: 3`. Una base válida vacía permanece vacía; JSON corrupto bloquea el guardado. Clientes, expedientes, inventario, perfiles y fotos comprimidas permanecen en el navegador. No hay sincronización entre pestañas o dispositivos. Se puede descargar un respaldo JSON.

Flujo: evaluación → aprobación → inicio → taller → entrega → documento → cerrado; ventas pasan de aprobación a entrega. El cierre exige entrega, comprobante y pago total. Los adelantos no cierran ni adelantan el estado del trabajo.

Los perfiles locales organizan y permiten probar permisos de interfaz. No son una barrera de seguridad: quien tiene acceso al navegador puede modificar sus datos.

## Preparación Firebase

- Authentication con correo/contraseña y sesión de navegador.
- `users/{uid}`: nombre, email, organización `lexsan`, rol (`gerencia`, `administracion`, `tecnico`) y `active`.
- Colecciones por entidad bajo `organizations/lexsan`: `clients`, `tickets`, `inventory`, `invoices`.
- Cada entidad tiene `payload`, `revision`, `updatedBy`, `updatedAt`. Transacciones comprueban revisión para detectar ediciones concurrentes, y un registro separado evita reutilizar el mismo comprobante.
- Fotografías en Storage autenticado, no dentro del documento Firestore ni mediante URLs públicas permanentes.
- Reglas niegan anónimos, otras organizaciones, autoasignación de roles y cambios comerciales por técnicos.
- Cuentas y roles futuros se provisionan por consola/Admin SDK; editar perfiles desde el portal solo funciona en modo local.

**Pendiente antes de producción:** ejecutar emuladores y pruebas en Firebase real; validar Storage/CORS y revocación de sesión; incorporar paginación y escucha de cambios; separar datos técnicos/comerciales si los técnicos no deben conocer precios; validar operaciones comerciales en backend; bitácora inmutable y estrategia de respaldos. El adaptador actual carga colecciones al iniciar y los documentos asignados al técnico aún incluyen datos comerciales, aunque la interfaz los oculta. No se presenta como una arquitectura productiva ya terminada.

## Publicación futura

Frontend estático con rutas relativas; compilación a `dist/`. GitHub Pages es técnicamente capaz de alojarlo, pero limita aplicaciones orientadas a operaciones comerciales; revisar elegibilidad antes de usarlo. Firebase Hosting es el destino preparado en `firebase.json`. No se configuró despliegue automático.

Referencias oficiales:

- [Authentication y reglas](https://firebase.google.com/docs/rules/rules-and-auth)
- [Reglas y transacciones](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Límite de documentos Firestore](https://firebase.google.com/docs/firestore/quotas)
- [GitHub Pages estático](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Límites de uso de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
