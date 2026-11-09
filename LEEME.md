# LEXSAN — Copiloto local

Abre **`index.html`** o **`LEXSAN_Portal_Visual_Profesional.html`**. Conserva toda la carpeta: los estilos y scripts están separados. La versión original permanece y la copia previa a esta reorganización está en `backups/portal-before-architecture.html`. No hace falta Firebase.

- Registro de reparaciones, mantenimiento preventivo o correctivo, fabricación y venta de radiadores, equipos y piezas nuevos.
- Ventanas con cierre X, regreso e Inicio; formularios y cotización adaptados al celular.
- Fotos desde galería o cámara para evaluación y comprobantes. El selector disponible depende del navegador y dispositivo.
- Aprobación con nombre, cargo, correo opcional y medio de autorización dentro del expediente.
- Adelantos desde la aprobación, historial de pagos y saldo. Pagar todo antes de trabajar no cierra el expediente: también requiere entrega y comprobante registrado.
- Inventario con código, categoría, ubicación, precio sin IGV, existencias y stock mínimo. Agrega productos a la cotización de venta desde el inventario. Las unidades vinculadas se descuentan al confirmar la entrega; las líneas manuales no descuentan inventario. Cotizar no reserva existencias.
- Orden de trabajo PDF con autorización, seguimiento, actividades y control de calidad.

Los datos se guardan en este navegador mediante almacenamiento local. Abrir el archivo en otro celular o computadora no sincroniza registros. El portal es un copiloto local y no emite comprobantes electrónicos. Para operación compartida entre dispositivos hace falta conectar una base de datos y publicar el aplicativo.

También se incorporaron reportes con CSV, facturación registrada, perfiles locales, asignación de técnicos, avances y validaciones. Los perfiles locales sirven para organización/pruebas; no son cuentas autenticadas ni seguridad real.

Para desarrollo con servidor: `npm ci` y `npm run dev`; abrir `http://127.0.0.1:4173`. Este origen tiene almacenamiento distinto de abrir el archivo directamente. No verá automáticamente los datos del archivo `file://`.

Pruebas: `npm test`, `npm run test:e2e`, `npm run test:regression`. Las pruebas de navegador necesitan el servidor y Microsoft Edge. `npm run build` genera `dist/` en modo local.

Documentación: `docs/AUDITORIA.md`, `docs/ARQUITECTURA.md`, `docs/PRUEBAS-Y-ENTREGA.md`.

Se verificó el flujo completo por interfaz, fotos, PDF y vistas de 390/820/1440 px. La cámara física debe comprobarse en el teléfono. No se publicó ni se configuró Firebase. Su adaptador y reglas son preparación pendiente de validación real.
