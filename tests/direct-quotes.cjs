const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173");
  for (const withOT of [false, true]) {
    await page
      .getByRole("button", { name: "Cotizaciones", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Nueva cotización independiente",
        exact: false,
      })
      .click();
    await page.selectOption("#new-client", "00000000");
    await page.fill(
      "#new-equipment",
      withOT
        ? "Servicio por alcance acordado"
        : "Presupuesto sin recepción física",
    );
    if (withOT) await page.check("#new-requires-ot");
    await page
      .getByRole("button", { name: "Guardar y continuar", exact: false })
      .click();
    assert.equal(await page.locator("#ev-findings").count(), 0);
    assert.equal(
      await page
        .getByRole("button", { name: "Taller y entrega", exact: true })
        .count(),
      withOT ? 1 : 0,
    );
    await page
      .getByRole("button", {
        name: "Ingresar nuevo ítem para cotizar",
        exact: false,
      })
      .click();
    await page.fill("#ld0", "Servicio acordado");
    await page.fill("#lp0", "100");
    await page.locator("#lp0").blur();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Generar PDF cotización", exact: false })
      .click();
    fs.mkdirSync("test-results", { recursive: true });
    await (
      await download
    ).saveAs("test-results/cotizacion-independiente-" + withOT + ".pdf");
    await page
      .getByRole("button", { name: "Enviar cotización", exact: false })
      .click();
    assert.equal(await page.evaluate(() => ticket(modal).status), "aprobacion");
    await page
      .getByRole("button", { name: "Cliente aprobó", exact: false })
      .click();
    await page.fill("#approval-who", "Cliente de prueba");
    await page.fill("#approval-role", "Encargado");
    await page
      .getByRole("button", { name: "Confirmar aprobación", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => ticket(modal).status),
      withOT ? "inicio" : "entrega",
    );
    await page.fill("#advance-amount", "18");
    await page
      .getByRole("button", { name: "Registrar adelanto", exact: true })
      .click();
    if (withOT) {
      await page
        .getByRole("button", { name: "Taller y entrega", exact: true })
        .click();
      const otDownload = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Descargar orden PDF", exact: true })
        .click();
      await (await otDownload).saveAs("test-results/ot-sin-evaluacion.pdf");
    } else {
      await page.getByRole("button", { name: "Resumen", exact: true }).click();
      await page
        .getByRole("button", {
          name: "Confirmar entrega / conformidad",
          exact: false,
        })
        .click();
      await page.selectOption("#doc-type", "BOLETA");
      await page.fill("#doc-number", "B001-567");
      await page
        .getByRole("button", { name: "Guardar comprobante", exact: true })
        .click();
      await page.fill("#advance-amount", "100");
      await page
        .getByRole("button", { name: "Registrar pago", exact: true })
        .click();
      assert.equal(await page.evaluate(() => ticket(modal).status), "cerrado");
      await page
        .getByRole("button", { name: "Documentos", exact: true })
        .click();
      assert.equal(
        await page
          .getByRole("button", {
            name: "Descargar orden de trabajo PDF",
            exact: false,
          })
          .isDisabled(),
        true,
      );
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page
      .getByRole("button", { name: "Cerrar ventana", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Inicio", exact: true }).click();
  await page
    .getByRole("button", { name: "Nueva cotización", exact: true })
    .click();
  await page.screenshot({ path: "test-results/direct-quote-mobile.png" });
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: direct quotes without evaluation, PDF, approval, advance, optional OT, no-OT fulfillment/payment/closure, mobile.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
