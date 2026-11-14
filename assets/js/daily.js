/* Short daily paths over the existing commercial record. */
let quickDraft = null;
const renderBeforeDaily = render;
render = function () {
  renderBeforeDaily();
  if (route === "gastos" && LexSession.user?.role !== "tecnico") return renderExpenses();
  if (route !== "inicio" || LexSession.user?.role === "tecnico") return;
  const pending = db.tickets.filter((t) => t.status !== "cerrado");
  const m = LexDomain.report(db.tickets);
  const month = iso().slice(0, 7);
  const billed = db.tickets
    .filter((t) => t.doc.number && t.doc.date?.startsWith(month))
    .reduce((n, t) => n + calc(t).gross, 0);
  const labels = {
    evaluacion: "En evaluación / presupuesto",
    aprobacion: "Esperando aprobación",
    inicio: "Por iniciar",
    taller: "En reparación",
    entrega: "Listo para entregar",
    documento: "Entregado",
  };
  document.getElementById("page").innerHTML =
    `<section class="home-start"><div class="home-brand"><img src="${LOGO}" alt=""><span>LEXSAN</span></div><h1>Inicio</h1><button class="button home-new-quote" onclick="newQuote()">Nueva cotización</button><details class="home-fold"><summary>Más operaciones</summary><div class="home-secondary"><button class="button outline" onclick="quickSale()">Venta rápida</button><button class="button outline" onclick="newTicket()">Nuevo trabajo</button><button class="button outline" onclick="invoicePicker()">Registrar factura</button><button class="button outline" onclick="go('inventario')">Productos y precios</button><button class="button outline" onclick="go('gastos')">Gastos</button></div></details><details class="home-fold"><summary>Ver pendientes y resumen</summary><div class="metricgrid">${[
      ["Por cobrar", fmt(m.pending)],
      [
        "Trabajos activos",
        pending.filter((t) => kindOf(t) === "reparacion" && !t.work.delivered)
          .length,
      ],
      ["Facturado este mes", fmt(billed)],
      [
        "Listos para entregar",
        pending.filter((t) => t.status === "entrega" && !t.work.delivered)
          .length,
      ],
    ]
      .map(
        ([label, v]) =>
          `<div class="metric"><span>${label}</span><div>${v}</div></div>`,
      )
      .join(
        "",
      )}</div><h2 style="margin:24px 0 12px">Pendientes</h2><div class="daily-pending">${
      pending
        .map((t) => {
          const due = Math.max(0, round(calc(t).gross - t.paid)),
            approved = !!t.approval;
          return `<article class="card"><b>${esc(client(t.clientId).name)}</b><p>${esc(t.equipment)} · ${esc(t.work.delivered ? deliveryText(t) : labels[t.status] || t.status)}</p><p>${approved ? "Saldo: " + fmt(due) : "Importe pendiente de aprobación"}</p><button class="button outline" onclick="openTicket(${t.id},'${approved && due > 0 ? "cobro" : t.status === "entrega" ? "entrega" : "evaluacion"}')">${approved && due > 0 ? "Ver saldo / registrar abono" : t.status === "entrega" ? "Ver entrega" : "Ver trabajo"}</button></article>`;
        })
        .join("") || "<p>No hay pendientes.</p>"
    }</div></details></section>`;
};
function quickSale() {
  quickDraft ||= [{ desc: "", qty: 1, price: 0 }];
  modal = "quick-sale";
  modalShow(
    `<div class="modal-head"><h2>Venta rápida</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><form id="quick-form" onsubmit="event.preventDefault();saveQuickSale()"><p>Precios sin IGV. El impuesto se calcula automáticamente.</p><div id="quick-lines"></div><button type="button" class="button outline" onclick="quickDraft.push({desc:'',qty:1,price:0});quickLines()">Agregar otro producto</button><div class="field"><label>Comprador (opcional, obligatorio para factura)</label><select id="quick-client" onchange="suggestQuickPayment()"><option value="">Público general</option>${db.clients.map((c) => `<option value="${esc(c.id)}">${esc(c.id + " · " + c.name)}</option>`).join("")}</select></div><details><summary>Comprador nuevo / comprobante</summary><p>Completa aquí el comprador si todavía no figura en la lista.</p><div class="fields2"><div class="field"><label>RUC o DNI</label><input id="quick-id" inputmode="numeric" onchange="suggestQuickPayment()"></div><div class="field"><label>Nombre / razón social</label><input id="quick-name" onchange="suggestQuickPayment()"></div><div class="field"><label>Comprobante emitido externamente</label><select id="quick-type"><option value="">Sin registrar por ahora</option><option>FACTURA</option><option>BOLETA</option></select></div><div class="field"><label>Serie y número</label><input id="quick-number" placeholder="F001-123"></div><label>Plazo de pago en días calendario<input id="quick-payment-days" type="number" min="0" max="365" step="1" value="0"></label></div></details><div class="detail" id="quick-total" aria-live="polite"></div><div class="field"><label>Fecha de venta y emisión del comprobante</label><input id="quick-date" type="date" value="${iso()}" max="${iso()}" required></div><label><input id="quick-full" type="checkbox" checked onchange="quickTotals()"> Cobro completo ahora</label><div class="field" id="quick-partial" hidden><label>Importe recibido (0 si queda pendiente)</label><input id="quick-paid" type="number" min="0" step=".01" value="0"></div><div class="field"><label>Medio de pago</label><select id="quick-method"><option>Efectivo</option><option>Transferencia</option><option>Yape / Plin</option><option>Tarjeta</option></select></div><p>Al guardar, los productos se registran como entregados. El saldo permanece disponible para cobrar después.</p><p id="quick-error" role="alert"></p><button class="button">Guardar venta y cobro</button></form></div>`,
  );
  quickLines();
}
function suggestQuickPayment() {
  const id = document.getElementById("quick-id").value.trim() || document.getElementById("quick-client").value;
  const buyer = db.clients.find(c => c.id === id) || {id, name: document.getElementById("quick-name").value};
  const days = defaultPaymentDays(buyer);
  document.getElementById("quick-payment-days").value = days;
  if (days) {
    document.getElementById("quick-full").checked = false;
    quickTotals();
  }
}
function quickLines() {
  document.getElementById("quick-lines").innerHTML = quickDraft
    .map(
      (l, i) =>
        `<div class="card" style="margin:12px 0"><div class="field"><label>Producto ${i + 1}</label><select onchange="quickProduct(${i},this.value)"><option value="">Ingreso manual</option>${db.inventory.map((p) => `<option value="${esc(p.code)}" ${p.code === l.stockCode ? "selected" : ""}>${esc(p.name)} · Stock ${p.stock}</option>`).join("")}</select><input aria-label="Descripción ${i + 1}" required value="${esc(l.desc)}" oninput="quickDraft[${i}].desc=this.value"></div><div class="fields2"><div class="field"><label>Cantidad</label><input aria-label="Cantidad ${i + 1}" type="number" min="0.00001" step="any" required value="${l.qty}" oninput="quickDraft[${i}].qty=Number(this.value);quickTotals()"></div><div class="field"><label>Precio unitario sin IGV</label><input aria-label="Precio ${i + 1}" type="number" min="0" step="any" required value="${l.price}" oninput="quickDraft[${i}].price=Number(this.value);quickTotals()"></div></div>${quickDraft.length > 1 ? `<button type="button" class="button ghost" onclick="quickDraft.splice(${i},1);quickLines()">Quitar producto</button>` : ""}</div>`,
    )
    .join("");
  quickTotals();
}
function quickProduct(i, code) {
  const p = db.inventory.find((x) => x.code === code);
  quickDraft[i] = p
    ? {
        desc: p.name,
        qty: 1,
        price: p.price,
        stockCode: p.code,
        category: "Producto nuevo",
      }
    : { desc: "", qty: 1, price: 0 };
  quickLines();
}
function quickTotals() {
  const v = LexDomain.quoteTotals({
    lines: quickDraft,
    discount: 0,
    pricingMode: "items",
  });
  document.getElementById("quick-total").textContent =
    `Base ${fmt(v.base)} + IGV ${fmt(v.igv)} = Total ${fmt(v.gross)}`;
  document.getElementById("quick-partial").hidden =
    document.getElementById("quick-full").checked;
}
function saveQuickSale() {
  if (modal !== "quick-sale" || !quickDraft) return;
  const form = document.getElementById("quick-form");
  if (!form.reportValidity()) return;
  const value = (id) => document.getElementById("quick-" + id).value.trim();
  const fail = (message) =>
    (document.getElementById("quick-error").textContent = message);
  const quote = {
    lines: structuredClone(quickDraft),
    discount: 0,
    gross: null,
    pricingMode: "items",
    version: 1,
    number: "",
    terms: "Venta directa. Productos entregados.",
  };
  const err = LexDomain.quoteError(quote);
  if (err) return fail(err);
  const total = LexDomain.quoteTotals(quote).gross,
    paid = document.getElementById("quick-full").checked
      ? total
      : round(value("paid"));
  if (!Number.isFinite(paid) || paid < 0 || paid > total)
    return fail("El cobro debe estar entre cero y el total.");
  const date = value("date");
  if (!date || date > iso()) return fail("Revisa la fecha.");
  const newId = value("id"),
    name = value("name");
  let buyer = db.clients.find((c) => c.id === (newId || value("client")));
  if (newId && !buyer) {
    if (!/^(\d{8}|\d{11})$/.test(newId) || !name)
      return fail("Completa documento y nombre del comprador.");
    buyer = {
      id: newId,
      type: newId.length === 11 ? "ruc" : "dni",
      name,
      contact: "",
      phone: "",
      email: "",
    };
  }
  const type = value("type"),
    number = value("number").toUpperCase();
  if (
    type &&
    !new RegExp(
      (type === "FACTURA" ? "^(?:F[A-Z0-9]{3}|E001)" : "^B[A-Z0-9]{3}") + "-\\d{1,8}$",
    ).test(number)
  )
    return fail("Revisa serie y número del comprobante.");
  if (type === "FACTURA" && buyer?.type !== "ruc")
    return fail("Selecciona o registra al comprador con RUC.");
  if (number && !type) return fail("Selecciona el tipo de comprobante.");
  if (number && db.tickets.some((t) => t.doc.number === number))
    return fail("Este comprobante ya está registrado.");
  const paymentDays = Number(value("payment-days"));
  if (!Number.isInteger(paymentDays) || paymentDays < 0 || paymentDays > 365) return fail("Revisa el plazo de pago.");
  const quantities = {};
  for (const l of quote.lines)
    if (l.stockCode)
      quantities[l.stockCode] = (quantities[l.stockCode] || 0) + l.qty;
  for (const [code, qty] of Object.entries(quantities)) {
    const p = db.inventory.find((p) => p.code === code);
    if (!p || !Number.isInteger(qty) || qty > p.stock)
      return fail("Stock insuficiente para " + code);
  }
  buyer ||= db.clients.find((c) => c.id === "publico-general") || {
    id: "publico-general",
    type: "other",
    name: "Público general",
    contact: "",
    phone: "",
    email: "",
  };
  const beforeSale = JSON.stringify(db);
  if (!db.clients.some((c) => c.id === buyer.id)) db.clients.push(buyer);
  const id = LexStore.nextId(db),
    t = {
      id,
      code: "LEX-" + date.slice(0, 4) + "-" + String(id).padStart(3, "0"),
      kind: "venta",
      quickSale: true,
      requiresOT: false,
      clientId: buyer.id,
      equipment: quote.lines.map((l) => l.desc).join(", "),
      serial: "",
      productCode: "",
      received: date,
      createdAt: new Date().toISOString(),
      status: "documento",
      eval: { condition: "", findings: "", fixes: "", photos: [] },
      quote,
      approval: {
        who: "Venta directa",
        at: now(),
        timestamp: new Date().toISOString(),
        version: 1,
      },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: date,
        deliveredDate: date,
        progress: [],
      },
      doc: { type, number, date: number ? date : "", ...(number ? {paymentDays} : {}) },
      paid,
      payments: paid
        ? [
            {
              amount: paid,
              date,
              method: value("method"),
              reference: "Venta rápida",
              operator: document.getElementById("operator").value,
            },
          ]
        : [],
      events: [],
      receipts: [],
      stockDelivered: true,
    };
  for (const [code, qty] of Object.entries(quantities)) {
    const p = db.inventory.find((p) => p.code === code);
    p.stock -= qty;
    (p.movements ||= []).push({
      at: now(),
      delta: -qty,
      note: "Venta " + t.code,
    });
  }
  event(t, "Venta rápida registrada. Entregado; cobrado " + fmt(paid));
  db.tickets.push(t);
  maybeClose(t);
  if (!save()) { db = JSON.parse(beforeSale); return fail("No se guardó la venta. Revisa el aviso de almacenamiento y descarga un respaldo."); }
  quickDraft = null;
  closeModal();
  render();
  toast("Venta guardada · saldo " + fmt(total - paid));
}
function invoicePicker() {
  modal = "invoice-picker";
  modalShow(
    `<div class="modal-head"><h2>Registrar factura o boleta</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><div class="card"><h3>Leer una factura PDF</h3><p>Selecciona el archivo y revisa los datos antes de registrar la venta.</p><input type="file" accept="application/pdf,.pdf" aria-label="Factura PDF" onchange="readInvoicePDF(this.files[0])"><p id="invoice-read-status" role="status"></p><div id="invoice-read-result"></div></div><p>Selecciona la venta o trabajo al que pertenece el comprobante. Facturar no registra un pago.</p><div class="field"><label>Buscar cliente, trabajo o código</label><input oninput="filterInvoiceLinks(this.value)"></div><div id="invoice-links"></div><p>Si es una venta nueva, puedes registrar productos, comprador y comprobante juntos.</p><button class="button" onclick="quickSale()">Registrar venta nueva</button><p class="small">Lectura local de PDF con texto en formato SUNAT. No se envía ni se guarda el archivo. Las fotos escaneadas y XML todavía requieren registro manual.</p></div>`,
  );
  filterInvoiceLinks("");
}
function filterInvoiceLinks(q) {
  document.getElementById("invoice-links").innerHTML =
    db.tickets
      .filter(
        (t) =>
          t.approval &&
          !t.doc.number &&
          normal(
            client(t.clientId).name + " " + t.equipment + " " + cid(t.id),
          ).includes(normal(q)),
      )
      .map(
        (t) =>
          `<div class="card"><b>${esc(client(t.clientId).name)}</b><p>${esc(t.equipment)} · ${fmt(calc(t).gross)}</p><button class="button outline" onclick="openTicket(${t.id},'cobro')">Vincular comprobante</button></div>`,
      )
      .join("") ||
    "<p>No hay operaciones pendientes de comprobante que coincidan.</p>";
}

function renderExpenses() {
  const page = document.getElementById("page");
  const expenses = [...(db.expenses || [])].sort((a, b) => b.date.localeCompare(a.date));
  const month = iso().slice(0, 7);
  const monthTotal = expenses.filter(e => e.date.startsWith(month)).reduce((total, e) => total + e.amount, 0);
  document.getElementById("page-top").textContent = "Gastos";
  page.innerHTML = `<section class="home-start"><h1>Gastos</h1>
    <form class="card" onsubmit="event.preventDefault();saveExpense(this)">
      <h2>Registrar gasto</h2>
      <label>Concepto<input name="description" required maxlength="140" placeholder="Ej.: examen, insumos o transporte"></label>
      <div class="fields2">
        <label>Fecha<input name="date" type="date" required value="${iso()}"></label>
        <label>Monto (S/)<input name="amount" type="number" inputmode="decimal" min="0.01" max="1000000" step="0.01" required></label>
      </div>
      <button class="button">Guardar gasto</button>
    </form>
    <h2>Gastos de este mes · ${fmt(monthTotal)}</h2>
    <div class="daily-pending">${expenses.map(e => `<article class="card"><b>${esc(e.description)}</b><p>${esc(e.date)} · ${fmt(e.amount)}</p><button class="button outline sm" onclick="editExpense('${esc(e.id)}')">Editar</button></article>`).join("") || "<p>Aún no hay gastos registrados.</p>"}</div>
  </section>`;
}
function editExpense(id) {
  const entry = db.expenses?.find(e => e.id === id);
  if (!entry) return;
  const form = document.querySelector("#page form");
  form.dataset.expenseId = id;
  for (const key of ["description", "date", "amount"]) form.elements.namedItem(key).value = entry[key];
  form.querySelector("h2").textContent = "Editar gasto";
  form.elements.namedItem("description").focus();
}
async function saveExpense(form) {
  if (LexSession.user?.role === "tecnico" || LexStore.failed || !form.reportValidity()) return;
  const fields = new FormData(form);
  const description = fields.get("description").trim();
  if (!description) return toast("Escribe el concepto del gasto.");
  const expenses = db.expenses ||= [];
  const existing = expenses.find(e => e.id === form.dataset.expenseId);
  const entry = {id: existing?.id || crypto.randomUUID(), description, date: fields.get("date"), amount: round(Number(fields.get("amount")))};
  form.querySelector("button").disabled = true;
  if (existing) Object.assign(existing, entry);
  else expenses.push(entry);
  try {
    if (!save()) throw Error("Revisa el estado del guardado.");
    await LexStore.flush();
    if (route === "gastos") renderExpenses();
    toast("Gasto guardado");
  } catch (error) {
    if (form.isConnected && !LexStore.failed) form.querySelector("button").disabled = false;
    toast(error.message);
  }
}
