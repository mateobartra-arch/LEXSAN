# Demostración sin Firebase

La versión estática local funciona sin Authentication, Firestore ni un servidor de datos: permite cotizaciones y PDF, evaluación cuando corresponda, aprobación, OT cuando corresponda, adelantos, comprobantes e inventario. La descarga PDF ocurre en el navegador. Publicar en Pages no habilita sincronización entre usuarios.

## Flujos

- Reparación/mantenimiento o fabricación: evaluación/especificaciones, cotización, aprobación, OT, entrega y cobro.
- Venta nueva: cotización, aprobación, entrega y cobro. Sin evaluación ni OT. Usar venta desde inventario si se desea descontar existencias.
- Cotización independiente: cliente y asunto, presupuesto directo, aprobación; OT opcional marcada al registrar la solicitud. Sin OT pasa a entrega/conformidad y cobro. Puede quedarse como presupuesto sin aprobar; no exige facturar para descargar el PDF.

## Preparar paquete

`npm run build` y `node scripts/package-demo.cjs` generan `LEXSAN_DEMO_GITHUB/` con archivos estáticos seleccionados. Esa carpeta usa modo local con Firebase desactivado y almacenamiento separado. No contiene respaldos, exportaciones, fotografías de pruebas ni credenciales. Los ejemplos de clientes del paquete se anonimizan.

## Subir a GitHub Pages

1. Descomprimir `LEXSAN_DEMO_GITHUB.zip`.
2. Subir **su contenido** al repositorio: `index.html`, `assets/`, `config/`, `.nojekyll` y el README. El HTML debe quedar en la raíz, no dentro de otra carpeta.
3. En Settings → Pages, seleccionar Deploy from a branch, rama `main`, carpeta `/(root)` y guardar.
4. Esperar a que termine la publicación y usar la URL indicada por GitHub, no la vista del archivo en el repositorio.
5. Probar una cotización PDF antes de presentar. Usar datos ficticios.

Los registros ingresados desde la URL de Pages permanecen en ese navegador y no se suben al repositorio. No aparecerán automáticamente los registros del archivo local. Descargar un respaldo antes de borrar datos del navegador. Los perfiles son de prueba, sin autenticación.

Se prepara una exhibición del prototipo. Para operación comercial real, elegir hosting apropiado y seguridad de backend: [GitHub Pages limita el uso como plataforma de transacciones comerciales](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). [Configuración de publicación por rama](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
