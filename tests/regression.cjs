const { chromium } = require("playwright"),
  assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true }),
    page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173");
  // Checks of commands exposed to existing integrations; the happy path is separately tested entirely through UI.
  await page.evaluate(() => openTicket(89, "evaluacion"));
  await page.fill("#q-discount", "999999");
  await page.locator("#q-discount").blur();
  assert.equal(await page.evaluate(() => ticket(modal).quote.discount), 0);
  const original = await page.evaluate(() => ticket(modal).status);
  await page.evaluate(() => finishWork());
  assert.equal(await page.evaluate(() => ticket(modal).status), original);
  await page.evaluate(() => openTicket(90));
  await page.getByRole("button", { name: "No aprobó", exact: true }).click();
  await page.fill("#rejection-note", "Cliente pospone el servicio");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  assert.equal(await page.evaluate(() => ticket(modal).status), "rechazado");
  assert.ok(await page.evaluate(() => ticket(modal).rejectedAt));
  await page.evaluate(() => go("inventario"));
  await page
    .getByRole("button", { name: "Registrar producto", exact: false })
    .click();
  for (const [k, v] of Object.entries({
    code: "SALE-1",
    name: "Radiador nuevo",
    stock: "1",
    price: "100",
    reason: "Ingreso",
  }))
    await page.fill("#stock-" + k, v);
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await page.evaluate(() => openTicket(92, "evaluacion"));
  await page.selectOption("#stock-sale", "0");
  await page
    .getByRole("button", { name: "Agregar a cotización", exact: true })
    .click();
  await page.fill("#lq1", "2");
  await page.locator("#lq1").blur();
  await page
    .getByRole("button", {
      name: "Enviar cotización a aprobación",
      exact: false,
    })
    .click();
  await page
    .getByRole("button", { name: "Cliente aprobó", exact: false })
    .click();
  await page.fill("#approval-who", "Comprador");
  await page.fill("#approval-role", "Logística");
  await page.getByRole("button", { name: "Confirmar aprobación" }).click();
  await page.evaluate(() => deliver());
  assert.equal(await page.evaluate(() => ticket(modal).status), "entrega");
  assert.equal(await page.evaluate(() => db.inventory[0].stock), 1);
  // Office adjusts physical stock, then confirms delivery once.
  await page.evaluate(() => {
    go("inventario");
    stockForm(0);
  });
  await page.fill("#stock-stock", "3");
  await page.fill("#stock-reason", "Recepción de compra");
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await page.evaluate(() => {
    openTicket(92);
    deliver();
    deliver();
  });
  assert.equal(await page.evaluate(() => db.inventory[0].stock), 1);
  assert.equal(await page.evaluate(() => ticket(modal).status), "documento");
  await page.reload();
  assert.equal(await page.evaluate(() => db.inventory[0].stock), 1);
  await page.evaluate(() => {
    go("usuarios");
    userForm();
  });
  await page.fill("#user-name", "Técnico de pruebas");
  await page.fill("#user-email", "tecnico@example.com");
  await page.getByRole("button", { name: "Guardar perfil" }).click();
  assert.equal(await page.evaluate(() => db.users.length), 4);
  assert.deepEqual(errors, []);
  // Opening an empty existing DB must not reintroduce demonstration records.
  await page.evaluate(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ next: 1, clients: [], tickets: [], inventory: [] }),
    );
  });
  await page.reload();
  assert.equal(await page.evaluate(() => db.tickets.length), 0);
  await page.evaluate(() => localStorage.setItem(KEY, "{broken"));
  await page.reload();
  assert.equal(await page.evaluate(() => LexStore.failed), true);
  assert.equal(await page.evaluate(() => localStorage.getItem(KEY)), "{broken");
  const locked = await browser.newPage();
  await locked.route('**/config/app-config.js', route => route.fulfill({contentType:'application/javascript',body:'window.LEXSAN_CONFIG={mode:"firebase",firebase:null};'}));
  await locked.goto('http://127.0.0.1:4173');
  assert.equal(await locked.locator('.shell').isVisible(),false);
  assert.equal(await locked.getByText('Conexión pendiente',{exact:true}).isVisible(),true);
  await browser.close();
  console.log(
    "PASS: discount limits, state guards, rejection, stock shortage, unique deduction, profiles, empty database, corrupt data protection.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
