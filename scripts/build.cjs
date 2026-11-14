const fs = require("node:fs"),
  path = require("node:path"),
  esbuild = require("esbuild");
(async () => {
  fs.mkdirSync("dist", { recursive: true });
  for (const name of ["index.html", "assets"])
    fs.cpSync(name, path.join("dist", name), { recursive: true });
  fs.mkdirSync("dist/config", { recursive: true });
  const local = !process.argv.includes("--production");
  let firebase = null;
  if (fs.existsSync("config/firebase.local.json"))
    firebase = JSON.parse(
      fs.readFileSync("config/firebase.local.json", "utf8"),
    );
  if (!local) {
    if (!firebase?.projectId || !firebase?.apiKey)
      throw Error("Falta la configuración de Firebase para producción.");
    const corePath = "dist/assets/js/legacy-core.js";
    const core = fs.readFileSync(corePath, "utf8");
    const start = core.indexOf("const fresh = () => ({");
    const end = core.indexOf("let db = LexStore.load(KEY, fresh);", start);
    if (start < 0 || end < 0) throw Error("No se encontró el bloque de datos de demostración.");
    fs.writeFileSync(corePath, core.slice(0, start) + "const fresh = () => LexStore.empty();\n" + core.slice(end));
  }
  fs.writeFileSync(
    "dist/config/app-config.js",
    "window.LEXSAN_CONFIG=" +
      JSON.stringify({ mode: local ? "local" : "firebase", firebase }) +
      ";",
  );
  await esbuild.build({
    entryPoints: ["assets/js/firebase-adapter.js"],
    bundle: true,
    format: "esm",
    outfile: "dist/assets/js/firebase-adapter.js",
    minify: true,
  });
  fs.mkdirSync("dist/assets/vendor/pdfjs", { recursive: true });
  await esbuild.build({
    entryPoints: ["assets/js/client-file-reader.js"],
    bundle: true,
    format: "esm",
    outfile: "dist/assets/js/client-file-reader.js",
  });
  for (const name of ["pdf.mjs", "pdf.worker.mjs"])
    fs.copyFileSync("node_modules/pdfjs-dist/build/" + name, "dist/assets/vendor/pdfjs/" + name);
  fs.copyFileSync("node_modules/pdfjs-dist/LICENSE", "dist/assets/vendor/pdfjs/LICENSE");
  fs.writeFileSync("dist/.nojekyll", "");
  console.log(
    "Build listo en dist/ · " +
      (local ? "copiloto local" : "Firebase"),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
