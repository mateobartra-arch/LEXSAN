# Fase 1: auditoría del portal recibido

Se revisaron HTML, estilos, generador PDF binario, funciones de operación, almacenamiento, eventos y la prueba `verify.cjs`. Se conservaron los logotipos. La prueba heredada pasó antes de modificar archivos.

| Área | Implementación inicial real | Hallazgo / tratamiento |
|---|---|---|
| Dashboard | Conteos de expedientes | Añadidos finalizados y facturación; accesos de muestra sustituidos por indicadores actuales. |
| Clientes | RUC/DNI, duplicados, contacto e historial | Validación de correo añadida. La validación RUC es matemática, no consulta SUNAT. |
| Recepción | Cliente, equipo, serie, condición, correlativo | Año fijo 2026, fecha UTC y pérdida de borrador al registrar cliente. Corregidos. |
| Evaluación | Diagnóstico, procedimientos, fotos | Conservada; categorías para repuesto/mano de obra y selectores separados de cámara/galería. |
| Cotización | IGV, descuentos, importe negociado, PDF | Corregida validación de descuentos excesivos y valores no finitos. Cálculos extraídos y probados. |
| Aprobación | Formulario activo más código anterior con prompt | Eliminada implementación obsoleta; rechazo ahora con formulario y fecha. |
| OT | Inicio, responsable, control, fin y entrega | Añadidos perfiles técnicos, asignación, avances y defensas de estado. |
| Facturación | Registro externo, adelantos y fotos | Conservada; listado de comprobantes y estado de pago. Sin emisión SUNAT. |
| Inventario | Productos, stock y vínculo con ventas | Conservado descuento al entregar; protección de códigos vinculados. |
| Reportes | Sin módulo operativo | Implementados sobre registros reales, período y CSV. |
| Usuarios | Selector visual Asistente / Gerenta | Sin autenticación. Nuevos perfiles locales son de prueba, no seguridad multiusuario. |

## Dependencias y límites iniciales

HTML/CSS/JavaScript sin bibliotecas externas; Canvas, FileReader, Blob y localStorage. Motor PDF propio offline. Funciones redefinidas por capas y CSS repetido. Fotos y registros competían por localStorage; no había servidor, sincronización, autenticación ni pruebas de reglas.

La prueba inicial forzaba estados por JavaScript. Se añadió otra que completa el flujo prioritario con formularios y botones, además de regresiones de comandos.

## Conservación

Se mantienen reparación, mantenimiento, fabricación, ventas, clientes e historial, evaluación, fotografías, cotizaciones/PDF, aprobación, OT, adelantos, comprobantes, inventario, correo administrativo y restablecimiento de demostración. El HTML previo a esta reorganización queda en `backups/portal-before-architecture.html`; también se conserva el original anterior.

Las pruebas utilizan navegadores aislados. No se importaron registros personales del usuario, ni se publicó información.
