/* One editor and one calculation model for screen, PDF and collections. */
const quoteReservations = new WeakMap();
async function ensureQuoteNumber(t) {
  if (t.quote.number) return t.quote.number;
  const issued = db.tickets.filter(x => x.quote?.number);
  let next = Math.max(Number(db.nextQuoteNumber) || 1, issued.length + 1,
    ...issued.map(x => Number(/^COT-(\d+)$/.exec(x.quote.number)?.[1] || 0) + 1));
  while (issued.some(x => x.quote.number === "COT-" + String(next).padStart(3, "0"))) next++;
  if (LexStore.mode === "firebase") {
    if (!quoteReservations.has(t)) {
      quoteReservations.set(t, LexStore.adapter.reserveQuoteNumber(next).then(number => {
        t.quote.number = "COT-" + String(number).padStart(3, "0");
        return t.quote.number;
      }).finally(() => quoteReservations.delete(t)));
    }
    return quoteReservations.get(t);
  }
  t.quote.number = "COT-" + String(next).padStart(3, "0");
  db.nextQuoteNumber = next + 1;
  return t.quote.number;
}
const quoteConditionLabels = { deadline: "Plazo de entrega / realización", place: "Lugar de entrega", validity: "Validez de la oferta", payment: "Forma de pago", warranty: "Garantía" };
function quoteConditionsEditor(t, editable) {
  if (!t.quote.conditions && editable) t.quote.conditions = {};
  const c = t.quote.conditions;
  return `<div class="quote-condition-fields"><h3>Condiciones de la cotización</h3>${c ? `<div class="fields2">${Object.entries(quoteConditionLabels).map(([key,label])=>`<label>${label}<input id="qc-${key}" value="${esc(c[key] || "")}" ${editable ? "" : "disabled"} oninput="saveQuoteConditions()"></label>`).join("")}</div>` : '<p class="small">Se conservan las condiciones originales en el texto de abajo.</p>'}</div>`;
}
function saveQuoteConditions() {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion" || !t.quote.conditions) return;
  for (const key of Object.keys(quoteConditionLabels)) t.quote.conditions[key] = document.getElementById("qc-"+key)?.value || "";
  save();
}
function quoteTermsText(q) {
  return [q.conditions ? Object.entries(quoteConditionLabels).filter(([key])=>q.conditions[key]?.trim()).map(([key,label])=>label + ": " + q.conditions[key].trim()).join("\n") : "", q.terms].filter(Boolean).join("\n\n");
}
function searchQuoteRuc(value) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  const query = value.trim();
  const byDocument = /^\d+$/.test(query);
  const matches = query ? db.clients.filter(c => byDocument
    ? c.id.startsWith(query)
    : normal(c.name + " " + (c.aliases || []).join(" ")).includes(normal(query))).slice(0, 6) : [];
  document.getElementById("quote-ruc-results").innerHTML = matches.map(c=>`<button class="quote-history-option" onclick="selectQuoteCompany('${esc(c.id)}')"><b>${esc(c.name)}</b><span>${esc(c.id)}</span></button>`).join("") || (query ? '<p class="small">No figura en los clientes registrados. Puedes añadirlo en «Cliente nuevo».</p>' : "");
  const exact = matches.find(c => c.id === query && /^\d{11}$/.test(query));
  if (exact) {
    if (t.quote.number && t.clientId !== exact.id) return toast("Crea otra cotización para cambiar de cliente.");
    const previousId = t.clientId;
    if (previousId !== exact.id) {
      delete t.quote.nextNumber;
      applyClientProfile(t, db.quoteLibrary?.profiles?.[exact.id] || {});
    }
    applyCustomerPayment(t, exact.id);
    t.clientId = exact.id;
    document.getElementById("quote-company").value = exact.id;
    if (previousId !== exact.id) t.quote.customer = {};
    document.getElementById("quote-company-data").innerHTML = quoteContactFields(t, exact, true);
    save();
    if (previousId !== exact.id) renderTicketModal();
  }
}
function quoteHistory() {
  return db.tickets.filter(t => t.id !== modal && t.quote?.lines?.some(l => l.desc?.trim() && Number(l.price) > 0))
    .sort((a,b) => String(b.createdAt || b.received).localeCompare(String(a.createdAt || a.received)));
}
function quoteReusePanel(t) {
  return `<details class="quote-reuse"><summary>↻ Hacer otra igual a una anterior</summary><p>Elige una cotización para crear una copia nueva. Revisa cliente, precios y condiciones antes de descargar.</p><input aria-label="Buscar cotización anterior" placeholder="Buscar cliente o trabajo…" oninput="filterQuoteHistory(this.value)"><div id="quote-history">${quoteHistoryRows("")}</div></details>${t.copiedFrom ? '<p class="quote-copy-note">Copia nueva: revisa el cliente y los precios. La placa se dejó vacía para evitar confusiones.</p>' : ""}`;
}
function quoteHistoryRows(query) {
  const rows = quoteHistory().filter(t => normal(client(t.clientId).name + " " + t.equipment + " " + t.quote.lines.map(l=>l.desc).join(" ")).includes(normal(query))).slice(0,8);
  return rows.map(t => `<button class="quote-history-option" onclick="repeatQuote(${Number(t.id)})"><b>${esc(t.equipment || t.quote.lines[0].desc)}</b><span>${esc(client(t.clientId).name)} · ${esc(t.received || "")} · ${fmt(calc(t).gross)} con IGV</span><span>Crear copia →</span></button>`).join("") || "<p>Aquí aparecerán tus cotizaciones anteriores.</p>";
}
function filterQuoteHistory(query) {
  document.getElementById("quote-history").innerHTML = quoteHistoryRows(query);
}
function repeatQuote(id) {
  const source = db.tickets.find(t => t.id === id);
  if (!source?.quote?.lines?.length) return;
  newQuote(id);
}
function quoteSuggestions(query) {
  if (normal(query).length < 2) return [];
  const seen = new Set(), matches = [];
  for (const t of quoteHistory()) for (const l of t.quote.lines) {
    const key = normal(l.desc);
    if (!key.includes(normal(query)) || seen.has(key) || !Number.isFinite(Number(l.price)) || Number(l.price) < 0) continue;
    seen.add(key); matches.push({desc:l.desc, price:Number(l.price), date:t.received || ""});
  }
  return matches.slice(0,3);
}
function showQuoteSuggestions(i) {
  const el = document.getElementById("quote-suggestions-" + i);
  if (!el) return;
  const rows = quoteSuggestions(document.getElementById("ld"+i).value);
  el.innerHTML = rows.length ? `<small>Usado antes · precio de referencia sin IGV</small>${rows.map((l,k)=>`<button class="quote-history-option" onclick="useQuoteSuggestion(${i},${k})"><b>${esc(l.desc)}</b><span>${fmt(l.price)} · ${esc(l.date)} · Usar descripción y precio</span></button>`).join("")}` : "";
}
function useQuoteSuggestion(i,k) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  const match = quoteSuggestions(document.getElementById("ld"+i).value)[k];
  if (!match) return;
  document.getElementById("ld"+i).value = match.desc;
  document.getElementById("lp"+i).value = match.price;
  updateLine(i);
  document.getElementById("quote-suggestions-"+i).innerHTML = "";
  document.getElementById("lq"+i).focus();
}
function saveQuoteClient() {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  const id = document.getElementById("quote-client-id").value.trim();
  const name = document.getElementById("quote-client-name").value.trim();
  if (!/^(\d{8}|\d{11})$/.test(id) || !name) {
    document.getElementById("quote-client-error").textContent = "Completa el RUC de 11 dígitos o DNI de 8 dígitos y el nombre.";
    return;
  }
  if (!db.clients.some(c => c.id === id)) db.clients.push({id, name, type: id.length === 11 ? "ruc" : "dni", contact: document.getElementById("quote-new-contact").value.trim(), phone: document.getElementById("quote-new-phone").value.trim(), email: ""});
  selectQuoteCompany(id);
}
function applyRadiatorTerms() {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  const note = "NOTA 01: Usar refrigerante de composición anticongelante Prestone, Zerex Valvoline u otros (NO VISTONY). Usar gomas de soportes y pernos de seguridad operativos.\nGARANTÍA: 06 meses por defecto de fábrica. Si el radiador presenta oxidación en su interior, abolladura o fisura en colector, no cubre garantía.\nCambio de refrigerante: NO.";
  if (!t.quote.terms.includes(note)) t.quote.terms += "\n\n" + note;
  if (t.quote.conditions) {
    t.quote.conditions.warranty = "06 meses por defecto de fábrica";
    document.getElementById("qc-warranty").value = t.quote.conditions.warranty;
  }
  if (!t.quote.terms.includes("NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES.")) t.quote.terms += "\nNO SE ACEPTAN CAMBIOS NI DEVOLUCIONES.";
  document.getElementById("q-terms").value = t.quote.terms;
  save();
}
const fullTicketModal = renderTicketModal;
renderTicketModal = function () {
  const t = ticket(modal);
  if (t?.kind !== "cotizacion" || tab !== "evaluacion") return fullTicketModal();
  modalShow(`<div class="modal-head"><div><h2>Cotización</h2><p class="small">Completa la hoja y descarga el PDF.</p></div><button class="xbtn" aria-label="Cerrar cotización" onclick="closeModal()">×</button></div><div class="modal-body quote-workspace"><div id="tab-body">${renderQuoteEditor(t)}</div><div class="quote-download-bar"><button class="button" onclick="docPrint('quote')">↓ Descargar cotización PDF</button><button class="button ghost" onclick="tab='resumen';renderTicketModal()">Ver seguimiento</button></div></div>`);
};
addLine = function () {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  if ([...document.querySelectorAll('.quote-editor input[type="number"]')].some(e => !e.checkValidity())) {
    showQuoteError("Completa los importes antes de agregar otro ítem."); return;
  }
  draftInput();
  t.quote.lines.push({desc: "", qty: 1, price: 0});
  save(); renderTicketModal();
  document.getElementById("ld" + (t.quote.lines.length - 1))?.focus();
};
function priceMode(q) {
  return (
    q.pricingMode || (q.gross != null && q.gross !== "" ? "agreed" : "items")
  );
}
function quotationSummary(t) {
  const v = calc(t);
  return `<div class="totalrow"><span>Subtotal sin IGV</span><b>${fmt(v.sum)}</b></div>${v.discount ? `<div class="totalrow"><span>Descuento</span><b>− ${fmt(v.discount)}</b></div>` : ""}${v.adjust ? `<div class="totalrow"><span>Ajuste histórico sin IGV</span><b>${fmt(v.adjust)}</b></div>` : ""}<div class="totalrow"><span>IGV · 18 %</span><b>${fmt(v.igv)}</b></div><div class="totalrow quote-final"><span>Total</span><b>${fmt(v.gross)}</b></div>`;
}
function renderQuoteEditor(t) {
  if (t.status === "evaluacion") LexDomain.useBasePrices(t.quote);
  const editable = t.status === "evaluacion",
    q = t.quote;
  const vehicle = t.vehicle || (t.vehicle = { brand: "", model: "" });
  return `<section class="quote-editor quote-simple quote-paper">${quotePaperHeader(t, editable)}${quoteReusePanel(t)}<div class="quote-items">${q.lines.map((l, i) => `<article class="quote-item quote-row"><div class="quote-row-head"><span>Ítem ${i + 1}</span>${editable ? `<button class="button ghost sm" aria-label="Quitar ítem ${i + 1}" onclick="removeLine(${i})">Quitar</button>` : ""}</div><label>Descripción<textarea class="desc" id="ld${i}" maxlength="1500" rows="3" placeholder="¿Qué vas a cotizar? Describe el producto o trabajo." ${editable ? "" : "disabled"} oninput="updateLine(${i});showQuoteSuggestions(${i})">${esc(l.desc)}</textarea></label><div class="quote-suggestions" id="quote-suggestions-${i}"></div><div class="fields2"><label>Cantidad<input type="number" required inputmode="decimal" id="lq${i}" min="0.01" step="0.01" value="${l.qty}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></label><label>Precio unitario (S/ sin IGV)<input type="number" required inputmode="decimal" id="lp${i}" min="0" step="0.01" value="${l.price}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></label></div><details class="quote-extra" ${l.code ? "open" : ""}><summary>Código del ítem</summary><input aria-label="Código del ítem ${i+1}" value="${esc(l.code || "")}" maxlength="40" ${editable ? "" : "disabled"} oninput="ticket(modal).quote.lines[${i}].code=this.value;save()"></details><div class="quote-row-total">Importe <b id="line-total-${i}">${fmt(round(l.qty * l.price))}</b></div></article>`).join("")}<button class="button outline" onclick="addLine()" ${editable ? "" : "disabled"}>＋ Agregar ítem</button></div>${quotePhotoEditor(t, editable)}<div class="quote-vehicle"><strong>Vehículo</strong><div class="fields2"><label>Marca<input id="vehicle-brand" value="${esc(vehicle.brand)}" placeholder="Ej.: International" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label><label>Modelo<input id="vehicle-model" value="${esc(vehicle.model)}" placeholder="Ej.: 9200" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label></div><label>Placa / código<input id="vehicle-code" value="${esc(t.serial || "")}" placeholder="Opcional" ${editable ? "" : "disabled"} oninput="saveVehicle()"></label></div>${quoteAnnexEditor(t, editable)}<div id="quote-input-error" class="quote-input-error" role="alert"></div><div class="quote-summary-layout"><div><details class="quote-extra"><summary>Descuento y orden de trabajo</summary><label><input type="checkbox" style="width:auto;display:inline" ${t.requiresOT ? "checked" : ""} ${editable ? "" : "disabled"} onchange="ticket(modal).requiresOT=this.checked;save()"> Requiere orden de trabajo tras aprobar</label><label>Descuento (S/ sin IGV)<input type="number" required id="q-discount" min="0" step=".01" value="${q.discount || 0}" ${editable ? "" : "disabled"} oninput="updatePrice()"></label></details><details class="quote-conditions"><summary>Entrega, garantía y condiciones</summary>${quoteConditionsEditor(t, editable)}<label>Notas y condiciones adicionales<textarea id="q-terms" ${editable ? "" : "disabled"} oninput="draftInput()">${esc(q.terms)}</textarea></label>${editable ? `<button class="button ghost sm" onclick="applyRadiatorTerms()">Añadir condiciones para radiador nuevo</button>` : ""}${quoteExtraFields(t, editable)}</details></div><aside id="quote-summary" class="detail quote-summary">${quotationSummary(t)}</aside></div><p class="quote-footnote">Precios expresados en soles. El IGV del 18 % se agrega al subtotal.</p></section>`;
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
  const current = ticket(modal);
  if (current && !current.equipment.trim()) current.equipment = current.quote.lines.find(l => l.desc.trim())?.desc || "";
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
  t.quote.lines[i].desc = desc.value;
  if (!qty.checkValidity() || !price.checkValidity()) {
    document.getElementById("line-total-" + i).textContent = "—";
    showQuoteError(
      "La cantidad debe ser positiva y el precio no puede ser negativo. Completa ambos campos.",
    );
    save();
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
  save();
  showQuoteError(quoteFieldError());
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
  save();
  showQuoteError(quoteFieldError());
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
docPrint = async function (kind) {
  const error =
    kind === "quote"
      ? quoteFieldError() || LexDomain.quoteError(ticket(modal).quote)
      : "";
  if (error) {
    showQuoteError(error);
    return toast(error);
  }
  if (kind === "quote") {
    const id = modal;
    if (ticket(id).status === "evaluacion") draftInput();
    try { await ensureQuoteNumber(ticket(id)); }
    catch { return toast("No se pudo asignar el número de cotización. Revisa tu conexión."); }
    if (!save()) return toast("No se descargó el PDF porque no se pudo guardar la cotización.");
    try { await LexStore.flush(); }
    catch (e) { return toast("No se descargó el PDF: " + e.message); }
    if (modal !== id) return toast("Cotización guardada. Vuelve a abrirla para descargar el PDF.");
    const code = document.querySelector(".paper-letterhead > strong");
    if (code) code.textContent = ticket(id).quote.number;
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
  return `<header class="paper-letterhead"><img src="${LOGO}" alt="LEXSAN"><div><b>LEXSAN RADIADORES S.A.C.</b><p>Cotización editable</p></div><strong>${esc(t.quote.number || cid(t.id))}</strong></header><div class="quote-ruc-search"><label>Buscar empresa por RUC o nombre<input id="quote-ruc" maxlength="120" value="${esc(c?.type === 'ruc' ? c.id : '')}" placeholder="Escribe el RUC o el nombre…" ${editable ? "" : "disabled"} oninput="searchQuoteRuc(this.value)"></label><div id="quote-ruc-results" aria-live="polite"></div></div><div class="paper-customer"><label>Seleccionar empresa por nombre<select id="quote-company" ${editable ? "" : "disabled"} onchange="selectQuoteCompany(this.value)"><option value="">Seleccionar empresa o cliente</option>${[...db.clients].sort((a,b)=>a.name.localeCompare(b.name,"es")).map((c) => `<option value="${esc(c.id)}" ${c.id === t.clientId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label><div id="quote-company-data">${c ? quoteContactFields(t, c, editable) : "Los datos del cliente aparecerán aquí."}</div></div>${editable ? `<details class="quote-new-client"><summary>＋ Cliente nuevo</summary><div class="fields2"><label>RUC o DNI<input id="quote-client-id" inputmode="numeric" maxlength="11"></label><label>Nombre / razón social<input id="quote-client-name"></label><label>Persona de contacto<input id="quote-new-contact"></label><label>Celular<input id="quote-new-phone" type="tel"></label></div><button class="button outline" onclick="saveQuoteClient()">Usar este cliente</button><p id="quote-client-error" role="alert"></p></details>` : ""}<label>Título de la cotización (opcional)<input id="quote-subject" value="${esc(t.equipment)}" ${editable ? "" : "disabled"} oninput="ticket(modal).equipment=this.value;save()" placeholder="Ej.: Venta de radiador de H2O"></label>`;
}
function selectQuoteCompany(id) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  if (t.clientId !== id) t.quote.customer = {};
  applyCustomerPayment(t, id);
  t.clientId = id;
  save();
  renderTicketModal();
}
newQuote = function (sourceId) {
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
        conditions: { deadline: "1 día hábil", place: "Taller Lexsan Radiadores", validity: "07 días", payment: "Contado", warranty: "Por confirmar según producto o servicio" },
        terms: "",
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
  const source = db.tickets.find(x => x.id === sourceId);
  if (source) {
    t.clientId = source.clientId;
    t.equipment = source.equipment;
    t.vehicle = structuredClone(source.vehicle || {brand: "", model: ""});
    t.quote.lines = source.quote.lines.map(l => ({desc: l.desc, qty: l.qty, price: l.price, ...(l.code ? {code: l.code} : {}), ...(l.category ? {category: l.category} : {}), ...(l.costGroup ? {costGroup: l.costGroup} : {}), ...(l.unit ? {unit: l.unit} : {})}));
    for (const key of ["format", "presentation", "overheadPercent"]) if (source.quote[key] !== undefined) t.quote[key] = source.quote[key];
    t.quote.terms = source.quote.terms || "";
    if (source.quote.annex?.body) t.quote.annex = {body: source.quote.annex.body};
    if (source.quote.seller) t.quote.seller = structuredClone(source.quote.seller);
    if (source.quote.conditions) t.quote.conditions = structuredClone(source.quote.conditions);
    else delete t.quote.conditions;
    t.quote.discount = source.quote.discount || 0;
    t.copiedFrom = source.id;
  }
  db.tickets.push(t);
  event(t, source ? "Nueva cotización basada en " + cid(source.id) : "Borrador de cotización directa");
  save();
  openTicket(id, "evaluacion");
};

function quoteContactFields(t, company, editable) {
  const contact = t.quote.customer || {};
  return `<b>${company.type === "ruc" ? "RUC" : "Documento"}: ${esc(company.id)}</b>
    <label>Persona de contacto<input value="${esc(contact.contact ?? company.contact ?? "")}" maxlength="120" ${editable ? "" : "disabled"} oninput="setQuoteField('customer','contact',this.value)"></label>
    <label>Celular del cliente<input type="tel" value="${esc(contact.phone ?? company.phone ?? "")}" maxlength="30" ${editable ? "" : "disabled"} oninput="setQuoteField('customer','phone',this.value)"></label>`;
}
function setQuoteField(group, key, value) {
  const t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  (t.quote[group] ||= {})[key] = value;
  save();
}
const quotePhotos = new WeakMap();
function quotePhotoEditor(t, editable) {
  const image = quotePhotos.get(t);
  if (!editable && !image) return "";
  return `<details class="quote-extra" ${image ? "open" : ""}><summary>Foto en la descripción</summary>
    ${image ? `<div class="photo-row"><img src="${image}" alt="Foto para la cotización"></div>` : ""}
    ${editable ? `${photoInputs("quotation")}<p class="small">La foto se incluye en el PDF. Vuelve a adjuntarla si recargas el portal.</p>
      ${image ? '<button class="button ghost sm" onclick="quotePhotos.delete(ticket(modal));renderTicketModal()">Quitar foto</button>' : ""}` : ""}</details>`;
}
const quoteMaintenanceScope = [
  "Desmontaje de accesorios y limpieza interior y exterior.",
  "Desincrustación y neutralización con aditivos adecuados, cuando corresponda.",
  "Sondeo tubo por tubo del radiador, según evaluación.",
  "Reparación de fugas y soldadura según material y especificación.",
  "Revisión de placas portatubos, tomas, roscas y aletas.",
  "Prueba de estanqueidad según la especificación del componente. Completar presión y duración aplicables."
].join("\n");
function quoteAnnexEditor(t, editable) {
  const { title = "", body = "", notes = "" } = t.quote.annex || {};
  const disabled = editable ? "" : "disabled";
  return `<details class="quote-extra" ${title || body || notes ? "open" : ""}><summary>Anexo de servicio · segunda página</summary>
    ${editable ? '<button class="button outline sm" onclick="fillMaintenanceScope()">Usar plantilla de mantenimiento</button>' : ""}
    <label>Título del servicio<input maxlength="180" value="${esc(title)}" ${disabled} oninput="setQuoteField('annex','title',this.value)"></label>
    <label>Alcance del servicio<textarea id="quote-annex-body" rows="6" maxlength="10000" placeholder="Escribe un paso por línea" ${disabled} oninput="setQuoteField('annex','body',this.value)">${esc(body)}</textarea></label>
    <p class="small">Escribe un paso por línea. El PDF colocará las viñetas automáticamente.</p>
    <label>Notas y observaciones<textarea rows="3" maxlength="4000" placeholder="Una nota por línea; se numerarán automáticamente en el PDF" ${disabled} oninput="setQuoteField('annex','notes',this.value)">${esc(notes)}</textarea></label>
    ${editable && t.eval?.fixes ? '<button class="button outline sm" onclick="fillMaintenanceScope(true)">Usar procedimiento de la evaluación</button>' : ""}</details>`;
}
function fillMaintenanceScope(fromEvaluation = false) {
  const field = document.getElementById("quote-annex-body");
  const body = fromEvaluation ? ticket(modal).eval.fixes : quoteMaintenanceScope;
  field.value = field.value ? field.value + "\n" + body : body;
  setQuoteField("annex", "body", field.value);
}
function quoteExtraFields(t, editable) {
  const seller = t.quote.seller || {};
  const disabled = editable ? "" : "disabled";
  return `<details class="quote-extra"><summary>Asesoría y datos para el pago</summary>
    <div class="fields2">${[["name","Asesor(a)"],["email","Correo"],["phone","Celular"]].map(([key,label]) =>
      `<label>${label}<input maxlength="120" value="${esc(seller[key] || "")}" ${disabled} oninput="setQuoteField('seller','${key}',this.value)"></label>`).join("")}</div>
    <label>Cuentas bancarias para el PDF<textarea rows="5" maxlength="1500" ${disabled} placeholder="Titular, banco, moneda, cuenta y CCI. Escribe cada cuenta en líneas separadas." oninput="setQuoteField('seller','bank',this.value)">${esc(seller.bank || "")}</textarea></label><p class="small">Aparecerán al final de la cotización, después de las notas del servicio. Completa únicamente las cuentas confirmadas.</p></details>`;
}
