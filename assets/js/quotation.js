/* One editor and one calculation model for screen, PDF and collections. */
function priceMode(q) {
  return (
    q.pricingMode || (q.gross != null && q.gross !== "" ? "agreed" : "items")
  );
}
function quotationSummary(t) {
  const q = t.quote,
    v = calc(t),
    agreed = priceMode(q) === "agreed";
  return `<div class="quote-total-label">${agreed ? "TOTAL ACORDADO CON EL CLIENTE" : "TOTAL A COTIZAR"}</div><div class="quote-total-amount">${fmt(v.gross)}</div><p class="small">Incluye IGV del 18%</p><div class="sep"></div><div class="totalrow"><span>Suma de ítems sin IGV</span><b>${fmt(v.sum)}</b></div>${v.discount ? `<div class="totalrow"><span>Descuento sin IGV</span><b>− ${fmt(v.discount)}</b></div>` : ""}${v.adjust ? `<div class="totalrow quote-adjust"><span>${v.adjust > 0 ? "Aumento" : "Reducción"} para llegar al total acordado</span><b>${v.adjust > 0 ? "+" : "−"} ${fmt(Math.abs(v.adjust))}</b></div>` : ""}<div class="totalrow"><span>Neto sin IGV <small>(base imponible)</small></span><b>${fmt(v.base)}</b></div><div class="totalrow"><span>IGV · 18%</span><b>${fmt(v.igv)}</b></div><div class="quote-equation">${fmt(v.base)} + ${fmt(v.igv)} de IGV = <strong>${fmt(v.gross)}</strong></div>${agreed ? '<p class="quote-mode-note">El total acordado reemplaza el total calculado por ítems. El ajuste se muestra aquí y en el PDF.</p>' : '<p class="quote-mode-note">El total se calcula automáticamente. Ingresa los precios unitarios sin IGV.</p>'}`;
}
function renderQuoteEditor(t) {
  if (t.status === "evaluacion") LexDomain.useBasePrices(t.quote);
  const editable = t.status === "evaluacion",
    q = t.quote,
    agreed = priceMode(q) === "agreed";
  const calculated = LexDomain.quoteTotals({ ...q, pricingMode: "items" });
  return `<section class="quote-editor"><div class="quote-heading"><div><span class="eyebrow">PRESUPUESTO</span><h3>¿Qué vas a cotizar?</h3><p>Agrega productos o servicios. Los precios de cada ítem se ingresan <strong>sin IGV</strong>.</p></div>${editable ? '<button class="button outline" onclick="addLine()">＋ Ingresar nuevo ítem para cotizar</button>' : ""}</div><div class="quote-items">${q.lines.map((l, i) => `<article class="quote-item"><div class="row between"><span class="tag">Ítem ${i + 1}</span>${editable ? `<button class="button ghost sm" aria-label="Quitar ítem ${i + 1}" onclick="removeLine(${i})">Quitar ×</button>` : ""}</div><label for="ld${i}">Descripción del producto o servicio</label><input class="desc" id="ld${i}" maxlength="1500" value="${esc(l.desc)}" ${editable ? "" : "disabled"} oninput="updateLine(${i})" placeholder="Ej.: Limpieza y prueba de estanqueidad"><div class="quote-item-numbers"><div><label for="lq${i}">Cantidad</label><input type="number" inputmode="decimal" required id="lq${i}" min="0.01" step="0.01" value="${l.qty}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></div><div><label for="lp${i}">Precio unitario sin IGV (S/)</label><input type="number" inputmode="decimal" required id="lp${i}" min="0" step="0.01" value="${l.price}" ${editable ? "" : "disabled"} oninput="updateLine(${i})"></div><div class="quote-line-total"><span>Importe sin IGV</span><b id="line-total-${i}">${fmt(round(l.qty * l.price))}</b></div></div><details class="quote-item-details"><summary>Tipo de ítem: ${esc(l.category || "Servicio")}</summary><select aria-label="Tipo de ítem ${i + 1}" ${editable ? "" : "disabled"} onchange="setLineCategory(${i},this.value);this.closest('details').querySelector('summary').textContent='Tipo de ítem: '+this.value">${["Servicio", "Repuesto", "Mano de obra", "Producto nuevo"].map((c) => `<option ${l.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></details></article>`).join("") || '<div class="quote-empty">Aún no hay ítems. Agrega el primer producto o servicio para calcular el presupuesto.</div>'}</div><div id="quote-input-error" class="quote-input-error" role="alert"></div><div class="quotegrid"><div><div class="field"><label for="q-discount">Descuento sobre los ítems (S/, sin IGV)</label><input type="number" inputmode="decimal" id="q-discount" min="0" step="0.01" required value="${q.discount || 0}" ${editable ? "" : "disabled"} oninput="updatePrice()"><p class="small">Se resta antes de calcular el IGV. Usa 0 si no aplica.</p></div><div class="field" style="margin-top:18px"><label for="q-terms">Entrega, forma de pago y garantía</label><textarea id="q-terms" ${editable ? "" : "disabled"} oninput="draftInput()">${esc(q.terms)}</textarea></div></div><aside id="quote-summary" class="detail quote-summary" aria-live="polite">${quotationSummary(t)}</aside></div></section>`;
}
function quoteFieldError() {
  const area = document.querySelector(".quote-editor");
  if (!area) return "";
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
