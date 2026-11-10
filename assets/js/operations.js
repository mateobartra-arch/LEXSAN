// Compatible migration: preserve existing clients, tickets and recorded balances.
db.inventory ||= [];
const priorRender = render,
  priorBody = ticketBody,
  priorNew = newTicket,
  priorKind = updateKindForm,
  priorCreate = createTicket,
  priorEvaluation = renderEvaluationView,
  priorDeliver = deliver;
const maintenanceOptions = [
  "Reparación",
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
];
function maintenanceSelect(value, handler) {
  return `<label>Tipo de atención técnica</label><select id="maintenance" onchange="${handler}">${maintenanceOptions.map((x) => `<option ${x === value ? "selected" : ""}>${x}</option>`).join("")}</select>`;
}
newTicket = function () {
  priorNew();
  document
    .getElementById("kind-help")
    .insertAdjacentHTML(
      "beforebegin",
      `<div class="field" id="maintenance-field">${maintenanceSelect("Reparación", "")}</div>`,
    );
  updateKindForm();
};
updateKindForm = function () {
  priorKind();
  const direct =
    document.querySelector('[name="new-kind"]:checked')?.value === "cotizacion";
  const field = document.getElementById("direct-ot-field");
  if (field) field.hidden = !direct;
  if (direct) {
    document.getElementById("new-equipment-label").textContent =
      "Asunto / servicio a cotizar";
    document.getElementById("new-condition-label").textContent =
      "Alcance o notas comerciales (opcional)";
    document.getElementById("kind-help").textContent =
      "Cotización directa · Sin evaluación · OT solo si la necesitas";
  }
  const dateLabel = document.querySelector('label[for="new-date"]');
  if (dateLabel)
    dateLabel.textContent = direct
      ? "Fecha de solicitud"
      : "Fecha de recepción / solicitud";
  const note = document.getElementById("intake-note");
  if (note)
    note.textContent = direct
      ? "No necesitas recibir un equipo: guarda la solicitud y prepara tu presupuesto."
      : "Al guardar puedes preparar la cotización y adjuntar fotos cuando corresponda.";
  const e = document.getElementById("maintenance-field");
  if (e)
    e.hidden =
      document.querySelector("[name=new-kind]:checked").value !== "reparacion";
};
createTicket = function () {
  const v = document.getElementById("maintenance")?.value;
  priorCreate();
  const t = ticket(modal);
  if (t && v && kindOf(t) === "reparacion") {
    t.maintenance = v;
    save();
    renderTicketModal();
  }
};
const oldModalShow = modalShow;
modalShow = function (body, small = false) {
  oldModalShow(body, small);
  document
    .querySelector(".modal-body")
    ?.insertAdjacentHTML(
      "afterbegin",
      `<div class="modal-nav"><button class="button outline sm" onclick="closeModal()">← Volver al listado</button><button class="button outline sm" onclick="go('inicio')">Inicio</button></div>`,
    );
  document.querySelector(".xbtn")?.setAttribute("aria-label", "Cerrar ventana");
  document.body.style.overflow = "hidden";
};
const oldClose = closeModal,
  oldGo = go;
closeModal = function () {
  document.body.style.overflow = "";
  oldClose();
};
go = function (to) {
  document.body.style.overflow = "";
  oldGo(to);
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.querySelector(".modal-cover"))
    closeModal();
});
renderEvaluationView = function (t, money) {
  let html = priorEvaluation(t, money);
  if (kindOf(t) === "reparacion")
    html =
      `<div class="field">${t.status === "evaluacion" ? maintenanceSelect(t.maintenance || "Reparación", "ticket(modal).maintenance=this.value;save()") : esc(t.maintenance || "Tipo de atención no registrado")}</div>` +
      html;
  if (kindOf(t) === "venta" && t.status === "evaluacion")
    html =
      `<div class="field"><label>Agregar producto del inventario</label><div class="row"><select id="stock-sale"><option value="">Seleccionar producto...</option>${db.inventory.map((p, i) => `<option value="${i}">${esc(p.code + " · " + p.name)} · Stock ${p.stock}</option>`).join("")}</select><button class="button outline" onclick="addStockLine()">Agregar a cotización</button></div></div>` +
      html;
  return html.replace(
    '<input type="file" accept="image/*" id="ev-photo" onchange="addPhoto(this)">',
    photoInputs("evaluation"),
  );
};
function photoInputs(target) {
  return `<div class="fields2"><div><label>Elegir foto de galería</label><input type="file" accept="image/*" onchange="attachImage(this,'${target}')"></div><div><label>Tomar fotografía</label><input type="file" accept="image/*" capture="environment" onchange="attachImage(this,'${target}')"></div></div>`;
}
async function attachImage(input, target) {
  const t = ticket(modal),
    f = input.files?.[0];
  if (!t || !f) return;
  if (target === "evaluation" && t.status !== "evaluacion") return;
  if (!f.type.startsWith("image/") || f.size > 20 * 1024 * 1024)
    return toast("Elige una imagen de hasta 20 MB.");
  try {
    const data = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    const img = await new Promise((resolve, reject) => {
      const x = new Image();
      x.onload = () => resolve(x);
      x.onerror = reject;
      x.src = data;
    });
    const canvas = document.createElement("canvas"),
      scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const src = canvas.toDataURL("image/jpeg", 0.72);
    if (target === "evaluation") t.eval.photos.push(src);
    else (t.receipts ||= []).push({ name: f.name, src, at: now() });
    save();
    if (modal === t.id) renderTicketModal();
    toast("Fotografía adjuntada");
  } catch (e) {
    toast("No se pudo leer la imagen. Prueba con JPG o PNG.");
  }
}
function approveTicket() {
  const t = ticket(modal);
  if (t.status !== "aprobacion") return;
  document.getElementById("tab-body").innerHTML =
    `<h2>Registrar aprobación del cliente</h2><p class="sub">Encargado autorizado de ${esc(client(t.clientId).name)}</p><form onsubmit="event.preventDefault();saveApproval()"><div class="fields2" style="margin-top:16px"><div class="field"><label>Nombre del encargado *</label><input id="approval-who" required></div><div class="field"><label>Cargo *</label><input id="approval-role" required></div></div><div class="field"><label>Correo del encargado (opcional)</label><input type="email" id="approval-email"></div><div class="field"><label>Medio de aprobación</label><select id="approval-proof"><option>Correo electrónico</option><option>WhatsApp</option><option>Orden de compra</option><option>Firma presencial</option></select></div><div class="field"><label>Referencia / observaciones</label><textarea id="approval-note"></textarea></div><div class="row"><button class="button green">Confirmar aprobación</button><button type="button" class="button outline" onclick="renderTicketModal()">Cancelar</button></div></form>`;
}
function saveApproval() {
  const t = ticket(modal),
    who = document.getElementById("approval-who").value.trim(),
    role = document.getElementById("approval-role").value.trim();
  if (!document.getElementById("approval-email").checkValidity())
    return toast("Revisa el correo del encargado.");
  if (t.status !== "aprobacion" || !who || !role)
    return toast("Completa nombre y cargo.");
  t.approval = {
    timestamp: new Date().toISOString(),
    who,
    role,
    email: document.getElementById("approval-email").value.trim(),
    proof: document.getElementById("approval-proof").value,
    note: document.getElementById("approval-note").value.trim(),
    at: now(),
    version: t.quote.version,
  };
  t.status = needsWorkOrder(t) ? "inicio" : "entrega";
  event(t, "Cotización aprobada por " + who + " · " + role);
  save();
  tab = "cobro";
  renderTicketModal();
  toast("Aprobación registrada. Ya puedes registrar un adelanto.");
}
ticketBody = function (t) {
  if (tab !== "cobro") return priorBody(t);
  const enabled = ["inicio", "taller", "entrega", "documento"].includes(
      t.status,
    ),
    due = round(calc(t).gross - t.paid);
  return `<h3>Pagos y comprobante</h3><p class="sub">Registra adelantos desde la aprobación, incluso antes de empezar. El saldo se cobra al entregar.</p><div class="detail" style="margin:16px 0"><div class="totalrow"><span>Total aprobado</span><b>${fmt(calc(t).gross)}</b></div><div class="totalrow"><span>Total recibido</span><b>${fmt(t.paid)}</b></div><div class="totalrow big"><span>Saldo pendiente</span><b>${fmt(Math.max(0, due))}</b></div></div>${enabled ? `<form onsubmit="event.preventDefault();saveAdvance()"><div class="fields2"><div class="field"><label>Importe recibido (S/)</label><input id="advance-amount" type="number" min="0.01" max="${Math.max(0, due)}" step=".01" required></div><div class="field"><label>Fecha del pago</label><input id="advance-date" type="date" value="${iso()}" required></div><div class="field"><label>Medio de pago</label><select id="advance-method"><option>Transferencia</option><option>Efectivo</option><option>Yape / Plin</option><option>Tarjeta</option></select></div><div class="field"><label>Referencia / número de operación</label><input id="advance-ref"></div></div><button class="button" ${due <= 0 ? "disabled" : ""}>Registrar ${t.work.delivered ? "pago" : "adelanto"}</button></form>` : t.status === "cerrado" ? '<div class="hint goodhint">Expediente cerrado y totalmente cobrado.</div>' : '<div class="hint">Los pagos se habilitan al aprobar la cotización.</div>'}<div class="sep"></div><h3>Historial de pagos</h3>${(t.payments || []).map((p) => `<div class="payment-entry"><b>${fmt(p.amount)}</b> · ${esc(p.date)} · ${esc(p.method)}<br><span class="small muted">${esc(p.reference || "Sin referencia")} · ${esc(p.operator || "")}</span></div>`).join("") || '<p class="sub">Sin nuevos pagos registrados.</p>'}${t.paid > round((t.payments || []).reduce((a, p) => a + p.amount, 0)) ? `<p class="sub">Pagos anteriores: ${fmt(round(t.paid - (t.payments || []).reduce((a, p) => a + p.amount, 0)))}</p>` : ""}<div class="sep"></div><h3>Comprobante emitido externamente</h3><p class="sub">Registro de factura o boleta; el portal no emite comprobantes electrónicos.</p>${enabled ? `<form onsubmit="event.preventDefault();saveDocument()"><div class="fields3" style="margin-top:14px"><div class="field"><label>Tipo</label><select id="doc-type"><option ${t.doc.type === "FACTURA" ? "selected" : ""}>FACTURA</option><option ${t.doc.type === "BOLETA" ? "selected" : ""}>BOLETA</option></select></div><div class="field"><label>Serie y número</label><input id="doc-number" value="${esc(t.doc.number)}" placeholder="F001-0000123" required></div><div class="field"><label>Fecha de emisión</label><input id="doc-date" type="date" value="${t.doc.date || iso()}" required></div></div><button class="button outline">Guardar comprobante</button></form>` : `<p class="sub">${esc(t.doc.number || "Sin comprobante registrado")}</p>`}<div class="sep"></div><h3>Fotos de comprobantes / constancias de pago</h3>${enabled ? photoInputs("receipt") : ""}<div class="photo-row">${(t.receipts || []).map((r) => `<a href="${r.src}" download="comprobante.jpg"><img class="attachment" src="${r.src}" alt="${esc(r.name)}"></a>`).join("")}</div>`;
};
function maybeClose(t) {
  if (t.work.delivered && t.doc.number && round(t.paid) >= calc(t).gross) {
    t.status = "cerrado";
    event(
      t,
      "Expediente cerrado: entregado, comprobante registrado y saldo cancelado.",
    );
  }
}
function saveAdvance() {
  const t = ticket(modal);
  if (!["inicio", "taller", "entrega", "documento"].includes(t.status)) return;
  const amount = round(document.getElementById("advance-amount").value),
    date = document.getElementById("advance-date").value;
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > round(calc(t).gross - t.paid) ||
    !date
  )
    return toast("Revisa el importe: debe ser positivo y no superar el saldo.");
  (t.payments ||= []).push({
    amount,
    date,
    method: document.getElementById("advance-method").value,
    reference: document.getElementById("advance-ref").value.trim(),
    operator: document.getElementById("operator").value,
  });
  t.paid = round(t.paid + amount);
  event(
    t,
    (t.work.delivered ? "Pago" : "Adelanto") + " recibido: " + fmt(amount),
  );
  maybeClose(t);
  save();
  renderTicketModal();
}
function saveDocument() {
  const t = ticket(modal);
  if (!["inicio", "taller", "entrega", "documento"].includes(t.status)) return;
  const type = document.getElementById("doc-type").value,
    number = document.getElementById("doc-number").value.trim().toUpperCase(),
    date = document.getElementById("doc-date").value;
  if (
    !new RegExp(
      "^" + (type === "FACTURA" ? "F" : "B") + "[A-Z0-9]{3}-\\d{1,8}$",
    ).test(number) ||
    !date
  )
    return toast("Revisa serie, número y fecha del comprobante.");
  if (type === "FACTURA" && client(t.clientId).type !== "ruc")
    return toast("La factura requiere un cliente con RUC.");
  if (db.tickets.some((x) => x.id !== t.id && x.doc.number === number))
    return toast("Este comprobante ya está registrado.");
  t.doc = { ...t.doc, type, number, date };
  event(t, "Comprobante registrado: " + number);
  maybeClose(t);
  save();
  renderTicketModal();
}
render = function () {
  if (route !== "inventario") return priorRender();
  db.inventory ||= [];
  document.getElementById("page").innerHTML =
    `<div class="section-head"><div><div class="eyebrow">PRODUCTOS PARA VENTA</div><h1>Inventario</h1><p class="sub">Radiadores nuevos, equipos y piezas · ${db.inventory.length} productos</p></div><button class="button" onclick="stockForm()">＋ Registrar producto</button></div><div class="field"><label>Buscar por código, producto o ubicación</label><input id="stock-search" oninput="stockList(this.value)" placeholder="Ej.: radiador, CAT, almacén"></div><div id="stock-list" class="stock-grid"></div>`;
  stockList("");
};
function stockList(q) {
  document.getElementById("stock-list").innerHTML =
    db.inventory
      .map((p, i) => ({ p, i }))
      .filter(({ p }) =>
        normal(p.code + " " + p.name + " " + p.location).includes(normal(q)),
      )
      .map(
        ({ p, i }) =>
          `<div class="card stock-card"><span class="tag ${p.stock <= p.minimum ? "amber" : "green"}">${p.stock <= p.minimum ? "Stock bajo" : "Disponible"} · ${p.stock} unidades</span><h3 style="margin-top:12px">${esc(p.name)}</h3><p>${esc(p.code)} · ${esc(p.category)}</p><p>${esc(p.location || "Sin ubicación")}</p><b>${fmt(p.price)} sin IGV</b><div class="row" style="margin-top:12px"><button class="button outline sm" onclick="stockForm(${i})">Editar producto / stock</button></div><p class="small">${esc(p.movements?.at(-1)?.note || "")}</p></div>`,
      )
      .join("") ||
    '<div class="empty">No hay productos. Registra tu inventario para cotizar ventas.</div>';
}
function stockForm(i = -1) {
  const p = db.inventory[i] || {
    code: "",
    name: "",
    category: "Radiador nuevo",
    location: "",
    stock: 0,
    minimum: 1,
    price: 0,
  };
  modalShow(
    `<div class="modal-head"><h2>${i < 0 ? "Registrar" : "Editar"} producto</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><form onsubmit="event.preventDefault();saveStock(${i})"><div class="fields2">${[
      ["code", "Código / SKU", p.code],
      ["name", "Producto / compatibilidad", p.name],
      ["location", "Ubicación", p.location],
    ]
      .map(
        ([k, l, v]) =>
          `<div class="field"><label>${l}</label><input id="stock-${k}" value="${esc(v)}" ${k === "location" ? "" : "required"}></div>`,
      )
      .join(
        "",
      )}<div class="field"><label>Categoría</label><select id="stock-category">${["Radiador nuevo", "Equipo nuevo", "Pieza / repuesto"].map((c) => `<option ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>${[
      ["stock", "Existencia física", p.stock],
      ["minimum", "Stock mínimo", p.minimum],
      ["price", "Precio unitario sin IGV (S/)", p.price],
    ]
      .map(
        ([k, l, v]) =>
          `<div class="field"><label>${l}</label><input type="number" min="0" step="${k === "price" ? ".01" : "1"}" id="stock-${k}" value="${v}" required></div>`,
      )
      .join(
        "",
      )}</div><div class="field"><label>Motivo del registro / ajuste *</label><input id="stock-reason" required placeholder="Ingreso de compra, conteo físico..."></div><button class="button">Guardar producto</button></form></div>`,
    true,
  );
}
function saveStock(i) {
  const v = (k) => document.getElementById("stock-" + k).value.trim(),
    p = {
      code: v("code"),
      name: v("name"),
      category: v("category"),
      location: v("location"),
      stock: Number(v("stock")),
      minimum: Number(v("minimum")),
      price: Number(v("price")),
    };
  if (
    !p.code ||
    !p.name ||
    !v("reason") ||
    ![p.stock, p.minimum, p.price].every((n) => Number.isFinite(n) && n >= 0) ||
    !Number.isInteger(p.stock) ||
    !Number.isInteger(p.minimum)
  )
    return toast("Completa datos y cantidades válidas.");
  if (db.inventory.some((x, j) => j !== i && normal(x.code) === normal(p.code)))
    return toast("El código ya existe.");
  if (
    i >= 0 &&
    p.code !== db.inventory[i].code &&
    db.tickets.some((t) =>
      t.quote.lines.some((l) => l.stockCode === db.inventory[i].code),
    )
  )
    return toast(
      "El código está vinculado a cotizaciones y no puede cambiarse.",
    );
  p.movements = [
    ...(db.inventory[i]?.movements || []),
    {
      at: now(),
      delta: p.stock - (db.inventory[i]?.stock || 0),
      note: v("reason"),
    },
  ];
  if (i < 0) db.inventory.push(p);
  else db.inventory[i] = p;
  save();
  closeModal();
  toast("Inventario actualizado");
}
function addStockLine() {
  const v = document.getElementById("stock-sale").value,
    t = ticket(modal);
  if (v === "" || t.status !== "evaluacion") return;
  const p = db.inventory[Number(v)];
  t.quote.lines.push({
    desc: p.code + " · " + p.name,
    qty: 1,
    price: p.price,
    stockCode: p.code,
  });
  // Respect an explicitly agreed total; the visible summary reconciles the new item.
  save();
  renderTicketModal();
}
// Preserve the stock reference while editing a quotation line.
const oldUpdateLine = updateLine;
updateLine = function (i) {
  const code = ticket(modal).quote.lines[i].stockCode;
  oldUpdateLine(i);
  if (code) {
    ticket(modal).quote.lines[i].stockCode = code;
    save();
  }
};
deliver = function () {
  const t = ticket(modal);
  if (t.status !== "entrega") return;
  if (kindOf(t) === "venta" && !t.stockDelivered) {
    const amounts = {};
    for (const l of t.quote.lines)
      if (l.stockCode)
        amounts[l.stockCode] = (amounts[l.stockCode] || 0) + Number(l.qty);
    for (const [code, qty] of Object.entries(amounts)) {
      const p = db.inventory.find((p) => p.code === code);
      if (!p || !Number.isInteger(qty) || qty > p.stock)
        return toast(
          "No se puede entregar: verifica unidades enteras y stock de " + code,
        );
    }
    for (const [code, qty] of Object.entries(amounts)) {
      const p = db.inventory.find((p) => p.code === code);
      p.stock -= qty;
      (p.movements ||= []).push({
        at: now(),
        delta: -qty,
        note: "Entrega " + cid(t.id),
      });
    }
    t.stockDelivered = true;
  }
  priorDeliver();
  maybeClose(t);
  save();
  renderTicketModal();
};
// Make storage failures visible instead of silently pretending data was saved.

if (!document.querySelector('[data-route="inventario"]')) {
  const b = document.createElement("button");
  b.className = "nav";
  b.dataset.route = "inventario";
  b.textContent = "Inventario";
  b.onclick = () => go("inventario");
  document.querySelector(".rail").appendChild(b);
}
