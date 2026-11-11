/* Short daily paths over the existing commercial record. */
let quickDraft = null;
const renderBeforeDaily = render;
render = function () {
  renderBeforeDaily();
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
    `<div class="home-brand"><img src="${LOGO}" alt="LEXSAN Radiadores"><span>LEXSAN <small>COPILOTO DE GESTIÓN</small></span></div><h1>¿Qué vamos a hacer hoy?</h1><div class="daily-actions"><button class="card" onclick="quickSale()"><h2>Venta rápida</h2><p>Productos, cobro y comprobante en una pantalla.</p></button><button class="card" aria-label="Nuevo trabajo" onclick="newTicket()"><h2>Nuevo trabajo</h2><p>Recibir un equipo y seguir su reparación.</p></button><button class="card" onclick="invoicePicker()"><h2>Registrar factura</h2><p>Vincular un comprobante emitido a una venta o trabajo.</p></button></div><div class="row" style="margin:16px 0"><button class="button outline" onclick="newQuote()">Nueva cotización</button><button class="button outline" onclick="go('inventario')">Productos y precios</button></div><div class="metricgrid">${[
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
          return `<article class="card"><b>${esc(client(t.clientId).name)}</b><p>${esc(t.equipment)} · ${esc(t.work.delivered ? "Entregado" : labels[t.status] || t.status)}</p><p>${approved ? "Saldo: " + fmt(due) : "Importe pendiente de aprobación"}</p><button class="button outline" onclick="openTicket(${t.id},'${approved && due > 0 ? "cobro" : t.status === "entrega" ? "entrega" : "evaluacion"}')">${approved && due > 0 ? "Ver saldo / registrar abono" : t.status === "entrega" ? "Ver entrega" : "Ver trabajo"}</button></article>`;
        })
        .join("") || "<p>No hay pendientes.</p>"
    }</div>`;
};
function quickSale() {
  quickDraft ||= [{ desc: "", qty: 1, price: 0 }];
  modal = "quick-sale";
  modalShow(
    `<div class="modal-head"><h2>Venta rápida</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><form id="quick-form" onsubmit="event.preventDefault();saveQuickSale()"><p>Precios sin IGV. El impuesto se calcula automáticamente.</p><div id="quick-lines"></div><button type="button" class="button outline" onclick="quickDraft.push({desc:'',qty:1,price:0});quickLines()">Agregar otro producto</button><div class="field"><label>Comprador (opcional, obligatorio para factura)</label><select id="quick-client"><option value="">Público general</option>${db.clients.map((c) => `<option value="${esc(c.id)}">${esc(c.id + " · " + c.name)}</option>`).join("")}</select></div><details><summary>Comprador nuevo / comprobante</summary><p>Completa aquí el comprador si todavía no figura en la lista.</p><div class="fields2"><div class="field"><label>RUC o DNI</label><input id="quick-id" inputmode="numeric"></div><div class="field"><label>Nombre / razón social</label><input id="quick-name"></div><div class="field"><label>Comprobante emitido externamente</label><select id="quick-type"><option value="">Sin registrar por ahora</option><option>FACTURA</option><option>BOLETA</option></select></div><div class="field"><label>Serie y número</label><input id="quick-number" placeholder="F001-123"></div></div></details><div class="detail" id="quick-total" aria-live="polite"></div><div class="field"><label>Fecha de venta y pago</label><input id="quick-date" type="date" value="${iso()}" max="${iso()}" required></div><label><input id="quick-full" type="checkbox" checked onchange="quickTotals()"> Cobro completo ahora</label><div class="field" id="quick-partial" hidden><label>Importe recibido (0 si queda pendiente)</label><input id="quick-paid" type="number" min="0" step=".01" value="0"></div><div class="field"><label>Medio de pago</label><select id="quick-method"><option>Efectivo</option><option>Transferencia</option><option>Yape / Plin</option><option>Tarjeta</option></select></div><p>Al guardar, los productos se registran como entregados. El saldo permanece disponible para cobrar después.</p><p id="quick-error" role="alert"></p><button class="button">Guardar venta y cobro</button></form></div>`,
  );
  quickLines();
}
function quickLines() {
  document.getElementById("quick-lines").innerHTML = quickDraft
    .map(
      (l, i) =>
        `<div class="card" style="margin:12px 0"><div class="field"><label>Producto ${i + 1}</label><select onchange="quickProduct(${i},this.value)"><option value="">Ingreso manual</option>${db.inventory.map((p) => `<option value="${esc(p.code)}" ${p.code === l.stockCode ? "selected" : ""}>${esc(p.name)} · Stock ${p.stock}</option>`).join("")}</select><input aria-label="Descripción ${i + 1}" required value="${esc(l.desc)}" oninput="quickDraft[${i}].desc=this.value"></div><div class="fields2"><div class="field"><label>Cantidad</label><input aria-label="Cantidad ${i + 1}" type="number" min="1" step="1" required value="${l.qty}" oninput="quickDraft[${i}].qty=Number(this.value);quickTotals()"></div><div class="field"><label>Precio unitario sin IGV</label><input aria-label="Precio ${i + 1}" type="number" min="0" step=".01" required value="${l.price}" oninput="quickDraft[${i}].price=Number(this.value);quickTotals()"></div></div>${quickDraft.length > 1 ? `<button type="button" class="button ghost" onclick="quickDraft.splice(${i},1);quickLines()">Quitar producto</button>` : ""}</div>`,
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
      "^" + (type === "FACTURA" ? "F" : "B") + "[A-Z0-9]{3}-\\d{1,8}$",
    ).test(number)
  )
    return fail("Revisa serie y número del comprobante.");
  if (type === "FACTURA" && buyer?.type !== "ruc")
    return fail("Selecciona o registra al comprador con RUC.");
  if (number && !type) return fail("Selecciona el tipo de comprobante.");
  if (number && db.tickets.some((t) => t.doc.number === number))
    return fail("Este comprobante ya está registrado.");
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
        progress: [],
      },
      doc: { type, number, date: number ? date : "" },
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
    `<div class="modal-head"><h2>Registrar factura o boleta</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><p>Selecciona la venta o trabajo al que pertenece el comprobante. Facturar no registra un pago.</p><div class="field"><label>Buscar cliente, trabajo o código</label><input oninput="filterInvoiceLinks(this.value)"></div><div id="invoice-links"></div><p>Si es una venta nueva, puedes registrar productos, comprador y comprobante juntos.</p><button class="button" onclick="quickSale()">Registrar venta nueva</button><p class="small">La lectura automática de PDF/XML aún no está disponible. Por ahora se registra el número y se adjunta una foto desde el expediente.</p></div>`,
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
