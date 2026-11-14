const { chromium } = require("playwright"),
  assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4173");
    assert.equal(await page.locator(".home-brand img").isVisible(), true);
    await page.screenshot({ path: "test-results/home-logo-mobile.png" });
    await page
      .getByRole("button", { name: "Nueva cotización", exact: true })
      .click();
    await page.selectOption("#new-client", "00000000");
    await page.fill("#new-equipment", "Servicio de diagnóstico acordado");
    await page
      .getByRole("button", { name: "Guardar y continuar", exact: false })
      .click();
    await page
      .getByRole("button", {
        name: "Ingresar nuevo ítem para cotizar",
        exact: false,
      })
      .click();
    await page.fill("#ld0", "Mantenimiento de radiador");
    await page.fill("#lp0", "500");
    assert.equal(await page.evaluate(() => calc(ticket(modal)).gross), 590);
    assert.match(await page.locator("#quote-summary").innerText(), /590/);
    assert.equal(await page.locator("#q-gross").isVisible(), false);
    await page.locator("#quote-summary").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "test-results/quote-mobile-totals.png" });
    let dl = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Generar PDF cotización", exact: false })
      .click();
    await (await dl).saveAs("test-results/quote-500-590.pdf");
    assert.equal(await page.locator("#q-pricing-mode").count(), 0);
    await page.fill("#lp0", "250");
    assert.equal(await page.evaluate(() => calc(ticket(modal)).gross), 295);
    await page.fill("#lp0", "");
    assert.match(await page.locator("#quote-summary").innerText(), /Completa/);
    assert.equal(await page.locator("#line-total-0").innerText(), "—");
    await page.fill("#lp0", "500");
    await page.fill("#q-discount", "999");
    await page
      .getByRole("button", { name: "Enviar cotización", exact: false })
      .click();
    assert.equal(await page.evaluate(() => ticket(modal).status), "evaluacion");
    await page.fill("#q-discount", "0");
    await page.fill("#lp0", "-5");
    await page
      .getByRole("button", { name: "Enviar cotización", exact: false })
      .click();
    assert.equal(await page.evaluate(() => ticket(modal).status), "evaluacion");
    await page.fill("#lp0", "500");
    const id = await page.evaluate(() => modal);
    await page.evaluate(() => {
      const t = ticket(modal);
      delete t.quote.pricingMode;
      t.quote.gross = 1000;
      save();
    });
    await page.reload();
    await page.evaluate((id) => openTicket(id, "evaluacion"), id);
    assert.equal(await page.evaluate(() => calc(ticket(modal)).gross), 590);
    await page.evaluate(() => openTicket(89, "evaluacion"));
    await page.fill(
      "#ev-findings",
      "Fuga visible en unión del tanque superior. Aletas con obstrucción externa.",
    );
    await page.fill(
      "#ev-fixes",
      "Limpieza exterior, reparación localizada y verificación de estanqueidad.",
    );
    await page.locator(".technical-details summary").click();
    await page.fill(
      "#tech-method",
      "Inspección visual. Ensayo de estanqueidad pendiente.",
    );
    await page.fill(
      "#tech-conditions",
      "No se registraron mediciones de presión ni temperatura.",
    );
    await page.fill(
      "#tech-result",
      "Se observa fuga en unión. Sin resultado de prueba presurizada.",
    );
    await page.fill(
      "#tech-recommendations",
      "Confirmar especificación del fabricante antes de efectuar la prueba.",
    );
    await page
      .getByLabel("Elegir imagen de galería")
      .setInputFiles("test-results/home-logo-mobile.png");
    await page.waitForFunction(() => ticket(modal).eval.photos.length > 0);
    dl = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "PDF evaluación", exact: false })
      .click();
    await (await dl).saveAs("test-results/evaluation-professional.pdf");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      document.querySelector(".modal").scrollTop = 0;
    });
    await page.screenshot({ path: "test-results/evaluation-desktop.png" });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 250+IGV=295, 500+IGV=590, base prices only, legacy drafts migrated, invalid inputs blocked, mobile logo, PDF and technical report.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
