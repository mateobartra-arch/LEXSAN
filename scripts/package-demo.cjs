const fs = require("node:fs"),
  path = require("node:path");
// Run after the local build. Only allowlisted static files enter the demo folder.
const target = "LEXSAN_DEMO_GITHUB";
fs.mkdirSync(target, { recursive: true });
for (const name of ["index.html", "assets"])
  fs.cpSync(path.join("dist", name), path.join(target, name), {
    recursive: true,
  });
fs.mkdirSync(path.join(target, "config"), { recursive: true });
fs.writeFileSync(
  path.join(target, "config/app-config.js"),
  'window.LEXSAN_CONFIG = {mode:"local",firebase:null,demo:true};',
);
fs.writeFileSync(path.join(target, ".nojekyll"), "");
fs.writeFileSync(
  path.join(target, "README.md"),
  `# LEXSAN — Demo local en GitHub Pages

Sube el CONTENIDO de esta carpeta a la raíz del repositorio: index.html, assets/, config/ y .nojekyll. No subas solo el HTML ni el ZIP sin descomprimir.

En GitHub: Settings → Pages → Deploy from a branch → main → /(root) → Save. Espera la publicación y abre el enlace que GitHub indique.

No necesita Firebase. PDF, cotizaciones, OT cuando corresponde, adelantos e inventario se ejecutan en el navegador. No se emiten comprobantes SUNAT.

Cada navegador guarda sus propios datos; no hay sincronización. Los datos ingresados y las fotos no se suben al repositorio. No contiene respaldos ni datos exportados. Usar información ficticia para la demostración. El código y los ejemplos incluidos son públicos si publicas el repositorio.

La demo usa una clave de almacenamiento separada de la versión local de operación. Cambiar de URL/file:// a GitHub Pages no migra registros existentes.

GitHub Pages se utiliza aquí para mostrar el prototipo, no como plataforma productiva de transacciones comerciales.
`,
);
console.log("Demo estática lista: " + target);
