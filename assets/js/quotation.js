/* One editor and one calculation model for screen, PDF and collections. */
function priceMode(q) {
  return (
    q.pricingMode || (q.gross != null && q.gross !== "" ? "agreed" : "items")
  );
}
function quotationSummary(t) {
  const v = calc(t);
  return `<div class="quote-total-label">TOTAL DE LA COTIZACIÓN</div><div class="quote-total-amount">${fmt(v.gross)}</div><p class="small">Incluye IGV (18 %)</p><div class="sep"></div><div class="totalrow"><span>Subtotal</span><b>${fmt(v.sum)}</b></div>${v.discount ? `<div class="totalrow"><span>Descuento</span><b>− ${fmt(v.discount)}</b></div>` : ""}${v.adjust ? `<div class="totalrow"><span>Ajuste histórico sin IGV</span><b>${fmt(v.adjust)}</b></div>` : ""}<div class="totalrow"><span>IGV (18 %)</span><b>${fmt(v.igv)}</b></div><div class="totalrow quote-final"><span>Total a pagar</span><b>${fmt(v.gross)}</b></div>`;
}
function renderQuoteEditor(t) {
  if (t.status === "evaluacion") LexDomain.useBasePrices(t.quote);
  const editable = t.status === "evaluacion",
    q = t.quote;
  const vehicle = t.vehicle || (t.vehicle = { brand: "", model: "" });
  return `<section class="quote-editor quote-simple quote-paper">${quotePaperHeader(t, editable)}<div class="quote-vehicle"><strong>Vehículo</strong><div class="fields2"><label>Marca<input id="vehicle-brand" value="${esc(vehicle.brand)}" placeholder="Ej.: Volvo" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label><label>Modelo<input id="vehicle-model" value="${esc(vehicle.model)}" placeholder="Ej.: FH" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label></div><label>Placa / código<input id="vehicle-code" value="${esc(t.serial || "")}" placeholder="Opcional" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label></div><div class="quote-items">${q.lines.map((l, i) => `<article class="quote-item quote-row"><div class="quote-row-head"><span>Concepto ${i + 1}</span>${editable ? `<button class="button ghost sm" aria-label="Quitar ítem ${i + 1}" onclick="removeLine(${i})">Quitar</button>` : ""}</div><label>Descripción<input class="desc" id="ld${i}" maxlength="1500" value="${esc(l.desc)}" placeholder="Ej.: Mantenimiento y sondeo de radiador" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></label><div class="fields2"><label>Cantidad<input type="number" required inputmode="decimal" id="lq${i}" min="0.01" step="0.01" value="${l.qty}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></label><label>Precio unitario (S/ sin IGV)<input type="number" required inputmode="decimal" id="lp${i}" min="0" step="0.01" value="${l.price}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></label></div><div class="quote-row-total">Importe <b id="line-total-${i}">${fmt(round(l.qty * l.price))}</b></div></article>`).join("")}<button class="button outline" onclick="addLine()" ${editable ? "" : "disabled"}>＋ Agregar concepto</button></div><div id="quote-input-error" class="quote-input-error" role="alert"></div><div class="quote-summary-layout"><div><details class="quote-extra"><summary>Descuento, entrega y garantía</summary><label><input type="checkbox" style="width:auto;display:inline" ${t.requiresOT ? "checked" : ""} ${editable ? "" : "disabled"} onchange="ticket(modal).requiresOT=this.checked;save()"> Requiere orden de trabajo tras aprobar</label><label>Descuento (S/ sin IGV)<input type="number" required id="q-discount" min="0" step=".01" value="${q.discount || 0}" ${editable ? "" : "disabled"} oninput="updatePrice()"></label><label>Condiciones de entrega, pago y garantía<textarea id="q-terms" ${editable ? "" : "disabled"} oninput="draftInput()">${esc(q.terms)}</textarea></label></details></div><aside id="quote-summary" class="detail quote-summary">${quotationSummary(t)}</aside></div><p class="quote-footnote">Precios expresados en soles. El IGV del 18 % se agrega al subtotal.</p></section>`;
}
function saveVehicle() {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  t.vehicle = {
    brand: document.getElementById("vehicle-brand").value.trim(),
    model: document.getElementById("vehicle-model").value.trim(),
  };
  t.serial = document.getElementById("vehicle-code").value.trim();
  save();
}

function quoteFieldError() {
  const area = document.querySelector(".quote-editor");
  if (!db.clients.some((c) => c.id === ticket(modal)?.clientId))
    return "Selecciona la empresa o cliente.";
  if (!ticket(modal)?.equipment.trim())
    return "Completa la descripción de la cotización.";
  if (!area) return "";
  if (!db.clients.some((c) => c.id === ticket(modal).clientId))
    return "Selecciona la empresa o cliente de la cotización.";
  for (const e of area.querySelectorAll("input:not(:disabled)")) {
    if (e.type === "number" && !e.checkValidity())
      return "Revisa las cantidades y los importes marcados. No se puede generar el PDF con esos valores.";
  }
  const discount = document.getElementById("q-discount");
  if (
    discount &&
    !discount.disabled &&
    Number(discount.value) > calc(ticket(modal)).sum
  )
    return "El descuento no puede superar la suma de los ítems.";
  return "";
}
function showQuoteError(message) {
  const el = document.getElementById("quote-input-error");
  const summary = document.getElementById("quote-summary");
  if (summary)
    summary.innerHTML = message
      ? '<p class="quote-input-error">Completa o corrige los precios y cantidades para calcular el total.</p>'
      : quotationSummary(ticket(modal));
  if (el) {
    el.textContent = message;
    el.hidden = !message;
  }
}
refreshQuoteSummary = function () {
  const t = ticket(modal),
    el = document.getElementById("quote-summary");
  if (t && el) el.innerHTML = quotationSummary(t);
};
updateLine = function (i) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  const qty = document.getElementById("lq" + i),
    price = document.getElementById("lp" + i),
    desc = document.getElementById("ld" + i);
  if (!qty.checkValidity() || !price.checkValidity()) {
    document.getElementById("line-total-" + i).textContent = "—";
    showQuoteError(
      "La cantidad debe ser positiva y el precio no puede ser negativo. Completa ambos campos.",
    );
    return;
  }
  t.quote.lines[i] = {
    ...t.quote.lines[i],
    desc: desc.value.trim(),
    qty: Number(qty.value),
    price: round(price.value),
  };
  LexDomain.useBasePrices(t.quote);
  t.quote.pricingMode = "items";
  if (t.quote.pricingMode === "items") t.quote.gross = null;
  document.getElementById("line-total-" + i).textContent = fmt(
    round(qty.value * price.value),
  );
  showQuoteError("");
  save();
  refreshQuoteSummary();
};
updatePrice = function () {
  const t = ticket(modal);
  if (t.status !== "evaluacion") return;
  const discount = document.getElementById("q-discount");
  if (!discount.checkValidity()) {
    showQuoteError("Ingresa un descuento válido sin IGV. Usa 0 si no aplica.");
    return;
  }
  const proposed = {
    ...t.quote,
    discount: round(discount.value),
    pricingMode: "items",
    gross: null,
    pricingReview: false,
  };
  const values = LexDomain.quoteTotals(proposed);
  if (proposed.discount < 0 || proposed.discount > values.sum) {
    showQuoteError("El descuento no puede superar la suma de los ítems.");
    return;
  }
  t.quote = proposed;
  showQuoteError("");
  save();
  refreshQuoteSummary();
};
function setPricingMode(mode) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion" || mode !== "items") return;
  LexDomain.useBasePrices(t.quote);
  save();
  renderTicketModal();
}
const sendQuoteChecked = sendQuote;
sendQuote = function () {
  const t = ticket(modal),
    error = quoteFieldError() || LexDomain.quoteError(t.quote);
  if (error) {
    showQuoteError(error);
    return toast(error);
  }
  sendQuoteChecked();
};
const docPrintChecked = docPrint;
docPrint = function (kind) {
  const error =
    kind === "quote"
      ? quoteFieldError() || LexDomain.quoteError(ticket(modal).quote)
      : "";
  if (error) {
    showQuoteError(error);
    return toast(error);
  }
  docPrintChecked(kind);
};
// Technical observations are optional and never pre-filled with invented results.
function technicalDetails(t) {
  const fields = [
    [
      "method",
      "Método de inspección / ensayo",
      "Ej.: inspección visual y prueba de estanqueidad",
    ],
    [
      "conditions",
      "Condiciones de prueba",
      "Presión, duración, temperatura y unidades, si se midieron",
    ],
    [
      "result",
      "Resultado observado",
      "Resultado real; no registrar pruebas que no se realizaron",
    ],
    [
      "recommendations",
      "Recomendaciones y limitaciones",
      "Acciones sugeridas, restricciones y verificaciones pendientes",
    ],
  ];
  return `<details class="technical-details"><summary>Detalle técnico del informe (opcional)</summary><p>Registra solo mediciones y pruebas efectivamente realizadas.</p><div class="fields2">${fields.map(([key, label, placeholder]) => `<div class="field"><label for="tech-${key}">${label}</label><textarea id="tech-${key}" ${t.status === "evaluacion" ? "" : "disabled"} placeholder="${placeholder}" oninput="saveTechnicalDetails()">${esc(t.eval[key] || "")}</textarea></div>`).join("")}</div></details>`;
}
function saveTechnicalDetails() {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  for (const key of ["method", "conditions", "result", "recommendations"])
    t.eval[key] = document.getElementById("tech-" + key)?.value || "";
  save();
}

function quotePaperHeader(t, editable) {
  const c = db.clients.find((c) => c.id === t.clientId);
  return `<header class="paper-letterhead"><img src="${LOGO}" alt="LEXSAN"><div><b>LEXSAN RADIADORES S.A.C.</b><p>Cotización editable</p></div><strong>${esc(t.quote.number || cid(t.id))}</strong></header><div class="paper-customer"><label>Empresa / cliente<select id="quote-company" ${editable ? "" : "disabled"} onchange="selectQuoteCompany(this.value)"><option value="">Seleccionar empresa o cliente</option>${db.clients.map((c) => `<option value="${esc(c.id)}" ${c.id === t.clientId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label><div id="quote-company-data">${c ? `<b>${c.type === "ruc" ? "RUC" : "Documento"}: ${esc(c.id)}</b><p>${esc(c.contact || "")} ${esc(c.phone || "")}</p><p>${esc(c.email || "")}</p>` : "Los datos del cliente aparecerán aquí."}</div></div><label>Descripción / asunto<input id="quote-subject" value="${esc(t.equipment)}" ${editable ? "" : "disabled"} oninput="ticket(modal).equipment=this.value;save()" placeholder="Ej.: Venta de radiador de H2O"></label>`;
}
function selectQuoteCompany(id) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  t.clientId = id;
  save();
  renderTicketModal();
}
newQuote = function () {
  const id = LexStore.nextId(db),
    t = {
      id,
      kind: "cotizacion",
      requiresOT: false,
      clientId: "",
      equipment: "",
      serial: "",
      productCode: "",
      received: iso(),
      createdAt: new Date().toISOString(),
      status: "evaluacion",
      eval: { condition: "", findings: "", fixes: "", photos: [] },
      quote: {
        number: "",
        version: 1,
        pricingMode: "items",
        lines: [{ desc: "", qty: 1, price: 0 }],
        discount: 0,
        gross: null,
        terms:
          "Entrega por confirmar. Lugar: Taller Lexsan Radiadores. Validez de oferta: 7 días. Pago: contado.",
      },
      vehicle: { brand: "", model: "" },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: "",
        progress: [],
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      payments: [],
      receipts: [],
      events: [],
    };
  db.tickets.push(t);
  event(t, "Borrador de cotización directa");
  save();
  openTicket(id, "evaluacion");
};
