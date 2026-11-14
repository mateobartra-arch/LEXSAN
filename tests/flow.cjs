const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  fs.mkdirSync("test-results", { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true }),
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto("http://127.0.0.1:4173");
  await page.getByRole("button", { name: "Clientes", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuevo cliente", exact: false })
    .click();
  await page.selectOption("#client-type", "dni");
  await page.fill("#client-id", "12345678");
  await page.fill("#client-name", "Cliente de prueba integral");
  await page.fill("#client-contact", "Responsable de flota");
  await page.fill("#client-phone", "999888777");
  await page.fill("#client-email", "flota@example.com");
  await page
    .getByRole("button", { name: "Guardar cliente", exact: true })
    .click();
  await page.getByRole("button", { name: "Inicio", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuevo trabajo", exact: true })
    .click();
  await page.selectOption("#new-client", "12345678");
  await page.fill("#new-equipment", "Radiador de tractocamión");
  await page.fill("#new-serial", "LEX-PRUEBA-01");
  await page.fill("#new-condition", "Panal con suciedad exterior");
  await page.selectOption("#maintenance", "Mantenimiento preventivo");
  await page
    .getByRole("button", { name: "Guardar y continuar", exact: false })
    .click();
  const id = await page.evaluate(() => modal);
  assert.equal(await page.evaluate(() => ticket(modal).clientId), "12345678");
  await page.fill("#ev-findings", "Obstrucción parcial, sin fuga visible");
  await page.fill("#ev-fixes", "Limpieza y prueba hidrostática");
  await page
    .getByRole("button", {
      name: "Ingresar nuevo ítem para cotizar",
      exact: false,
    })
    .click();
  await page.fill("#ld0", "Mantenimiento y prueba de radiador");
  await page.fill("#lq0", "2");
  await page.fill("#lp0", "100");
  await page.locator("#lp0").blur();
  await page.fill("#q-discount", "20");
  await page.locator("#q-discount").blur();
  assert.equal(await page.evaluate(() => calc(ticket(modal)).gross), 212.4);
  await page.screenshot({
    path: "test-results/desktop-evaluacion.png",
    fullPage: true,
  });
  await page
    .getByLabel("Elegir imagen de galería")
    .setInputFiles("test-results/desktop-evaluacion.png");
  await page.waitForFunction(() => ticket(modal).eval.photos.length === 1);
  assert.equal(
    await page.getByLabel("Tomar foto con cámara").getAttribute("capture"),
    "environment",
  );
  let download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Generar PDF cotización", exact: false })
    .click();
  await (await download).saveAs("test-results/cotizacion.pdf");
  await page
    .getByRole("button", { name: "Enviar cotización", exact: false })
    .click();
  assert.equal(await page.evaluate(() => ticket(modal).status), "aprobacion");
  await page
    .getByRole("button", { name: "Cliente aprobó", exact: false })
    .click();
  await page.fill("#approval-who", "Encargado de flota");
  await page.fill("#approval-role", "Jefe de mantenimiento");
  await page.fill("#approval-email", "flota@example.com");
  await page
    .getByRole("button", { name: "Confirmar aprobación", exact: true })
    .click();
  await page.fill("#advance-amount", "50");
  await page
    .getByRole("button", { name: "Registrar adelanto", exact: true })
    .click();
  assert.equal(await page.evaluate(() => ticket(modal).paid), 50);
  assert.equal(await page.evaluate(() => ticket(modal).status), "inicio");
  await page
    .getByRole("button", { name: "Taller y entrega", exact: true })
    .click();
  await page.selectOption("#assigned-tech", "local-tech");
  await page
    .getByRole("button", { name: "Iniciar trabajo", exact: true })
    .click();
  await page.fill("#progress-percent", "50");
  await page.fill("#progress-note", "Limpieza completada");
  await page
    .getByRole("button", { name: "Guardar avance", exact: true })
    .click();
  await page.check("#qc");
  await page
    .getByRole("button", { name: "Finalizar trabajo", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Taller y entrega", exact: true })
    .click();
  download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar orden PDF", exact: true })
    .click();
  await (await download).saveAs("test-results/orden-trabajo.pdf");
  await page
    .getByRole("button", { name: "Confirmar entrega del equipo", exact: true })
    .click();
  await page.selectOption("#doc-type", "BOLETA");
  await page.fill("#doc-number", "B001-000123");
  await page
    .getByRole("button", { name: "Guardar comprobante", exact: true })
    .click();
  await page
    .getByLabel("Elegir imagen de galería")
    .setInputFiles("test-results/desktop-evaluacion.png");
  await page.waitForFunction(() => ticket(modal).receipts?.length === 1);
  await page.fill("#advance-amount", "162.40");
  await page
    .getByRole("button", { name: "Registrar pago", exact: true })
    .click();
  assert.equal(await page.evaluate(() => ticket(modal).status), "cerrado");
  await page
    .getByRole("button", { name: "Inicio", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Reportes", exact: true }).click();
  assert.match(await page.locator("#page").innerText(), /212,40|212.40/);
  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  await (await download).saveAs("test-results/reporte.csv");
  await page.reload();
  assert.equal(await page.evaluate((id) => ticket(id).status, id), "cerrado");
  // Phone / tablet rendering and draft recovery through client registration.
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Nuevo trabajo", exact: true })
    .click();
  await page.fill("#new-equipment", "Borrador conservado");
  await page
    .getByRole("button", { name: "Registrar cliente nuevo", exact: false })
    .click();
  await page.selectOption("#client-type", "dni");
  await page.fill("#client-id", "87654321");
  await page.fill("#client-name", "Segundo cliente móvil");
  await page
    .getByRole("button", { name: "Guardar cliente", exact: true })
    .click();
  assert.equal(await page.inputValue("#new-equipment"), "Borrador conservado");
  await page
    .getByRole("button", { name: "Guardar y continuar", exact: false })
    .click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "test-results/mobile-recepcion.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Cerrar ventana", exact: true })
    .click();
  await page.selectOption("#operator", { label: "Técnico local · tecnico" });
  assert.equal(
    await page.getByRole("button", { name: "Usuarios", exact: true }).count(),
    0,
  );
  assert.equal(await page.evaluate(() => canCommand("saveAdvance")), false);
  await page.selectOption("#operator", { label: "Gerencia local · gerencia" });
  await page.getByRole("button", { name: "Inventario", exact: true }).click();
  await page
    .getByRole("button", { name: "Registrar producto", exact: false })
    .click();
  for (const [k, v] of Object.entries({
    code: "RAD-TEST",
    name: "Radiador nuevo",
    stock: "3",
    price: "100",
    reason: "Ingreso de compra",
  }))
    await page.fill("#stock-" + k, v);
  await page
    .getByRole("button", { name: "Guardar producto", exact: true })
    .click();
  assert.equal(await page.evaluate(() => db.inventory[0].stock), 3);
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.screenshot({
    path: "test-results/tablet-inventario.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: full UI flow, PDFs, camera selectors, photos, advances, OT, delivery, receipt, reports, persistence, local roles, mobile/tablet, inventory.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
