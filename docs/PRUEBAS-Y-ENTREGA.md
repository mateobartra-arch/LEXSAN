# Verificación y aceptación

## Ejecutadas

- `npm test`: IGV, descuentos, importe negociado, entradas inválidas, fecha Lima, base vacía y reportes.
- `npm run test:e2e`: flujo por interfaz desde cliente/recepción hasta evaluación, cotización PDF, aprobación, adelanto, técnico, avance, control, OT PDF, entrega, comprobante y pago total. Fotos, CSV, persistencia, borrador y vistas de 390, 820 y 1440 px.
- `npm run test:regression`: descuento excesivo, estados inválidos, rechazo con fecha, falta de stock, ajuste, descuento único al entregar, perfiles y JSON corrupto.
- `node verify.cjs`: prueba heredada antes y después de reorganizar.
- Cotización y orden PDF renderizadas con Poppler e inspeccionadas visualmente.
- Auditoría de paquetes sin vulnerabilidades informadas después de fijar gRPC corregido. Ver `package-lock.json`.

Los tests usan contextos de navegador aislados; no modifican el perfil personal. Evidencias en `test-results/`, excluidas de Git.

## Pendientes / no activadas

- Cámara física Android/iPhone: probar en el dispositivo. Se verificaron `accept="image/*"`, `capture="environment"`, galería separada y carga de imágenes.
- Firebase real: no hay proyecto ni configuración; el usuario pidió modo local.
- Reglas en emulador: tests preparados, pero Java y Firebase CLI no están instalados en este entorno. No se afirma que esas pruebas se hayan ejecutado.
- No se publicó ni subió información a GitHub, Firebase o Sites.

## Prueba con usuarios

1. Descargar un respaldo y usar un cliente de prueba.
2. Recibir radiador, indicar mantenimiento y fecha.
3. Tomar foto en teléfono y adjuntar otra desde galería.
4. Completar diagnóstico, repuesto y mano de obra; contrastar descuento, IGV y total.
5. Descargar cotización; registrar aprobación con encargado/cargo/correo.
6. Registrar adelanto y verificar que no cierre el trabajo.
7. Asignar técnico, iniciar OT, guardar avance, control y entrega.
8. Registrar comprobante externo y pago final; revisar cierre y reportes.
9. Vender producto desde inventario y comprobar descuento al entregar.

No restablecer demostración si contiene datos que se desean conservar. Otro navegador o teléfono no recibe automáticamente los registros.
