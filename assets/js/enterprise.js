/* Incremental business layer: existing forms/PDF are retained. New behavior lives
   here instead of being embedded in the HTML. See docs/ARQUITECTURA.md. */
const calc = (t) => LexDomain.quoteTotals(t.quote);
let intakeDraft = null;
function renderSearch() {
  const e = document.getElementById("search-service"),
    pos = e?.selectionStart;
  render();
  const next = document.getElementById("search-service");
  next?.focus();
  next?.setSelectionRange(pos, pos);
}
const renderOperations = render;
render = function () {
  if (route === "reportes") return renderReports();
  if (route === "usuarios") return renderUsers();
  if (route === "facturacion") return renderInvoices();
  renderOperations();
  if (route === "cotizaciones") {
    const button = document.querySelector(".section-head button");
    if (button) {
      button.textContent = "＋ Nueva cotización independiente";
      button.onclick = () => newQuote();
    }
  }
  if (route === "inicio") {
    const heroTitle = document.querySelector(".hero > div");
    if (heroTitle)
      heroTitle.insertAdjacentHTML(
        "afterbegin",
        `<div class="home-brand"><img src="${LOGO}" alt="LEXSAN Radiadores S.A.C."><span>LEXSAN <small>RADIADORES S.A.C.</small></span></div>`,
      );
    document
      .querySelector(".hero")
      ?.insertAdjacentHTML(
        "beforeend",
        '<button class="button outline" onclick="newQuote()">Nueva cotización</button>',
      );
    const m = LexDomain.report(db.tickets);
    document
      .querySelector(".metricgrid")
      ?.insertAdjacentHTML(
        "beforeend",
        `<div class="metric"><span>Trabajos finalizados</span><div>${m.completed}</div></div><div class="metric"><span>Facturación registrada</span><div class="money-metric">${fmt(m.invoiced)}</div></div>`,
      );
    const side = document.querySelector(".dashboard-side");
    if (side)
      side.innerHTML = `<div class="side-panel"><h3>Gestión comercial</h3><p>Cotizaciones aprobadas: <b>${m.approved}</b></p><p style="margin-top:12px">Saldo por cobrar: <b>${fmt(m.pending)}</b></p><button class="button outline" style="margin-top:15px" onclick="go('reportes')">Ver reportes</button></div><div class="side-panel"><h3>Tu información</h3><p>${LexStore.mode === "local" ? "Los registros permanecen en este navegador. Descarga un respaldo al terminar la jornada." : "Sesión autenticada y datos compartidos."}</p><button class="button outline" style="margin-top:15px" onclick="LexStore.export()">Descargar respaldo</button></div>`;
  }
  applyRoleView();
};
function captureIntake() {
  if (modal !== "new") return;
  intakeDraft = {};
  for (const id of [
    "new-client",
    "new-equipment",
    "new-serial",
    "new-condition",
    "maintenance",
    "new-date",
  ])
    intakeDraft[id] = document.getElementById(id)?.value || "";
  intakeDraft.kind = document.querySelector("[name=new-kind]:checked")?.value;
  intakeDraft.requiresOT =
    document.getElementById("new-requires-ot")?.checked || false;
}
const existingNew = newTicket;
newTicket = function () {
  existingNew();
  document
    .getElementById("new-condition")
    ?.closest(".field")
    .insertAdjacentHTML(
      "afterend",
      `<div class="field"><label for="new-date">Fecha de recepción / solicitud</label><input id="new-date" type="date" max="${iso()}" value="${iso()}"></div><p class="small muted" id="intake-note">Al guardar puedes preparar la cotización y adjuntar fotos cuando corresponda.</p>`,
    );
  if (intakeDraft) {
    for (const [id, value] of Object.entries(intakeDraft)) {
      const e = document.getElementById(id);
      if (e) e.value = value;
    }
    const radio = document.querySelector(
      `[name=new-kind][value="${intakeDraft.kind}"]`,
    );
    if (radio) radio.checked = true;
    document.getElementById("new-requires-ot").checked = intakeDraft.requiresOT;
    updateKindForm();
  }
};
function newQuote() {
  intakeDraft = null;
  newTicket();
  const radio = document.querySelector('[name="new-kind"][value="cotizacion"]');
  if (radio) {
    radio.checked = true;
    updateKindForm();
  }
}
const existingAddClient = addClient;
addClient = function (back = false) {
  if (back) captureIntake();
  existingAddClient(back);
};
const existingCreate = createTicket;
createTicket = function () {
  const date = document.getElementById("new-date").value;
  if (!date || date > iso())
    return toast("La fecha de recepción no puede ser futura.");
  const before = db.tickets.length;
  existingCreate();
  if (db.tickets.length > before) {
    const t = ticket(modal);
    t.received = date;
    t.createdAt = new Date().toISOString();
    t.code = "LEX-" + date.slice(0, 4) + "-" + String(t.id).padStart(3, "0");
    intakeDraft = null;
    save();
    renderTicketModal();
  }
};
const existingClose = closeModal,
  existingGo = go;
closeModal = function () {
  captureIntake();
  existingClose();
};
go = function (to) {
  captureIntake();
  existingGo(to);
  document.getElementById("page-top").textContent =
    {
      reportes: "Reportes de operación",
      usuarios: "Usuarios y perfiles",
      facturacion: "Facturación registrada",
    }[to] || document.getElementById("page-top").textContent;
  applyRoleView();
};
const previousModal = modalShow;
modalShow = function (body, small = false) {
  previousModal(body, small);
  const dialog = document.querySelector("[role=dialog]"),
    heading = dialog?.querySelector("h2");
  if (heading) {
    heading.id = "dialog-title";
    dialog.setAttribute("aria-labelledby", "dialog-title");
  }
  document
    .querySelectorAll(".modal input:not([type]),.modal input[type=text]")
    .forEach((x) => {
      x.maxLength = 500;
    });
  document
    .querySelectorAll(".modal textarea")
    .forEach((x) => (x.maxLength = 6000));
  document
    .querySelectorAll(".modal input,.modal select,.modal textarea")
    .forEach((e) => {
      if (!e.labels?.length && !e.hasAttribute("aria-label"))
        e.setAttribute(
          "aria-label",
          e.closest(".field")?.querySelector("label")?.textContent ||
            e.placeholder ||
            "Campo de formulario",
        );
    });
  applyRoleView();
};
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const nodes = [
    ...document.querySelectorAll(
      ".modal button,.modal input,.modal select,.modal textarea,.modal a[href]",
    ),
  ].filter((x) => !x.disabled && x.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0],
    last = nodes.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
const evaluationOperations = renderEvaluationView;
renderEvaluationView = function (t, money) {
  let html = evaluationOperations(t, money);
  html = html.replace(
    "Evidencia fotográfica (opcional)",
    "Fotos de recepción y evaluación (opcional)",
  );
  return html;
};
const updateLineOperations = updateLine;
updateLine = function (i) {
  const t = ticket(modal),
    q = document.getElementById("lq" + i),
    p = document.getElementById("lp" + i);
  if (
    !q.checkValidity() ||
    !p.checkValidity() ||
    !Number.isFinite(Number(q.value)) ||
    !Number.isFinite(Number(p.value))
  ) {
    toast("Cantidad positiva y precio no negativo requeridos.");
    return;
  }
  const category = t.quote.lines[i].category;
  updateLineOperations(i);
  if (category) {
    t.quote.lines[i].category = category;
    save();
  }
};
const updatePriceOperations = updatePrice;
updatePrice = function () {
  const t = ticket(modal),
    discount = Number(document.getElementById("q-discount").value),
    gross = document.getElementById("q-gross").value;
  const q = {
      ...t.quote,
      discount,
      gross: gross === "" ? null : Number(gross),
    },
    error = q.lines.length ? LexDomain.quoteError(q) : "";
  if (error) {
    toast(error);
    document.getElementById("q-discount").value = t.quote.discount;
    document.getElementById("q-gross").value = t.quote.gross ?? "";
    return;
  }
  updatePriceOperations();
};
const existingTicketModal = renderTicketModal;
renderTicketModal = function () {
  existingTicketModal();
  const t = ticket(modal);
  if (!t) return;
  if (tab === "evaluacion" && t.status === "evaluacion" && needsEvaluation(t)) {
    document.getElementById("tab-body").insertAdjacentHTML(
      "afterbegin",
      `<div class="field"><label>Técnico encargado de evaluar</label><select id="assigned-tech" onchange="assignTechnician(this.value)"><option value="">Asignar evaluación...</option>${(
        db.users || []
      )
        .filter((u) => u.active && u.role === "tecnico")
        .map(
          (u) =>
            `<option value="${esc(u.uid)}" ${t.work.assignedUid === u.uid ? "selected" : ""}>${esc(u.name)}</option>`,
        )
        .join("")}</select></div>`,
    );
  }
  if (tab === "evaluacion")
    document.querySelectorAll(".quote-table tbody tr").forEach((row, i) => {
      if (!t.quote.lines[i]) return;
      row.cells?.[0]?.insertAdjacentHTML(
        "beforeend",
        `<label class="small">Tipo de ítem</label><select aria-label="Tipo de ítem ${i + 1}" ${t.status !== "evaluacion" ? "disabled" : ""} onchange="setLineCategory(${i},this.value)">${["Servicio", "Repuesto", "Mano de obra", "Producto nuevo"].map((v) => `<option ${t.quote.lines[i].category === v ? "selected" : ""}>${v}</option>`).join("")}</select>`,
      );
    });
  if (tab === "resumen" && t.approval)
    document
      .getElementById("tab-body")
      .insertAdjacentHTML(
        "beforeend",
        `<div class="hint goodhint">Aprobó: ${esc(t.approval.who)} · ${esc(t.approval.role || "Cargo no registrado")} · ${esc(t.approval.at)} · Versión ${t.approval.version || 1}</div>`,
      );
  if (
    tab === "taller" &&
    needsWorkOrder(t) &&
    ["inicio", "taller", "entrega", "documento", "cerrado"].includes(t.status)
  ) {
    const target = document.getElementById("tab-body");
    target.insertAdjacentHTML(
      "afterbegin",
      `<div class="ot-header"><span class="eyebrow">ORDEN AUTORIZADA · OT-${t.id}</span><h2>${esc(t.equipment)}</h2><p>${esc(client(t.clientId).name)} · ${esc(t.maintenance || kindLabels[kindOf(t)])}</p><button class="button outline" onclick="docPrint('ot')">Descargar orden PDF</button></div>`,
    );
    if (t.status === "inicio" || t.status === "taller")
      target.insertAdjacentHTML(
        "beforeend",
        `<div class="sep"></div><div class="field"><label>Técnico asignado</label><select id="assigned-tech" onchange="assignTechnician(this.value)"><option value="">Seleccionar técnico...</option>${(
          db.users || []
        )
          .filter((u) => u.active && u.role === "tecnico")
          .map(
            (u) =>
              `<option value="${esc(u.uid)}" ${t.work.assignedUid === u.uid ? "selected" : ""}>${esc(u.name)}</option>`,
          )
          .join("")}</select></div>`,
      );
    target.insertAdjacentHTML(
      "beforeend",
      `<div class="sep"></div><h3>Avances de taller</h3>${(t.work.progress || []).map((p) => `<div class="payment-entry"><b>${p.percent}% · ${esc(p.note)}</b><br><small>${esc(p.at)} · ${esc(p.who)}</small></div>`).join("") || '<p class="sub">Sin avances registrados.</p>'}${t.status === "taller" ? `<form onsubmit="event.preventDefault();recordProgress()" style="margin-top:16px"><div class="fields2"><div class="field"><label>Avance (%)</label><input id="progress-percent" type="number" min="0" max="100" step="1" required></div><div class="field"><label>Actividad / observación</label><input id="progress-note" maxlength="500" required></div></div><button class="button outline">Guardar avance</button></form>` : ""}`,
    );
  }
  if (tab === "evaluacion" && t.status !== "evaluacion" && t.eval.photos.length)
    document
      .getElementById("tab-body")
      .insertAdjacentHTML(
        "beforeend",
        `<h3 style="margin-top:20px">Fotografías registradas</h3><div class="photo-row">${t.eval.photos.map((src) => `<img src="${src}" alt="Evidencia del equipo">`).join("")}</div>`,
      );
  applyRoleView();
};
function setLineCategory(i, value) {
  const t = ticket(modal);
  if (t.status !== "evaluacion") return;
  t.quote.lines[i].category = value;
  save();
}
function assignTechnician(uid) {
  const t = ticket(modal),
    u = (db.users || []).find(
      (u) => u.uid === uid && u.active && u.role === "tecnico",
    );
  if (!u || !["evaluacion", "inicio", "taller"].includes(t.status)) return;
  t.work.assignedUid = uid;
  t.work.responsible = u.name;
  const input = document.getElementById("responsible");
  if (input) input.value = u.name;
  event(t, "Técnico asignado: " + u.name);
  save();
}
function recordProgress() {
  const t = ticket(modal),
    percent = Number(document.getElementById("progress-percent").value),
    note = document.getElementById("progress-note").value.trim();
  if (
    t.status !== "taller" ||
    !Number.isInteger(percent) ||
    percent < 0 ||
    percent > 100 ||
    !note
  )
    return toast("Ingresa avance entre 0 y 100 y una observación.");
  (t.work.progress ||= []).push({
    percent,
    note,
    at: now(),
    timestamp: new Date().toISOString(),
    who: document.getElementById("operator").value,
  });
  event(t, "Avance de taller: " + percent + "% · " + note);
  save();
  renderTicketModal();
}
const finishExisting = finishWork;
finishWork = function () {
  const t = ticket(modal);
  if (t.status !== "taller" || !t.work.qc) return finishExisting();
  t.completedAt = new Date().toISOString();
  finishExisting();
};
function rejectTicket() {
  const t = ticket(modal);
  if (t.status !== "aprobacion") return;
  document.getElementById("tab-body").innerHTML =
    `<form onsubmit="event.preventDefault();saveRejection()"><h2>Registrar rechazo</h2><div class="field" style="margin-top:16px"><label>Motivo del cliente *</label><textarea id="rejection-note" required></textarea></div><button class="button">Guardar decisión</button> <button class="button outline" type="button" onclick="renderTicketModal()">Cancelar</button></form>`;
}
function saveRejection() {
  const t = ticket(modal),
    note = document.getElementById("rejection-note").value.trim();
  if (t.status !== "aprobacion" || !note) return;
  t.status = "rechazado";
  t.rejection = note;
  t.rejectedAt = new Date().toISOString();
  event(t, "Cotización rechazada: " + note);
  save();
  renderTicketModal();
}
const existingPrint = docPrint;
docPrint = function (kind) {
  const t = ticket(modal);
  if (kind === "quote") {
    const error = LexDomain.quoteError(t.quote);
    if (error) return toast(error);
  }
  existingPrint(kind);
};
let reportFrom = "",
  reportTo = "";
function reportingTickets() {
  return db.tickets.filter(
    (t) =>
      (!reportFrom || t.received >= reportFrom) &&
      (!reportTo || t.received <= reportTo),
  );
}
function renderReports() {
  const list = reportingTickets(),
    m = LexDomain.report(list),
    counts = {},
    tech = {};
  for (const t of list) {
    counts[t.clientId] = (counts[t.clientId] || 0) + 1;
    if (t.work.responsible) {
      const name = t.work.responsible;
      tech[name] ||= { total: 0, finished: 0 };
      tech[name].total++;
      if (t.work.finished) tech[name].finished++;
    }
  }
  document.getElementById("page").innerHTML =
    `<div class="section-head"><div><div class="eyebrow">CONTROL DE GESTIÓN</div><h1>Reportes</h1><p class="sub">Agrupados por fecha de recepción. Los importes incluyen IGV.</p></div><button class="button outline" onclick="exportReport()">Exportar CSV</button></div><div class="card fields2"><div><label>Desde</label><input type="date" value="${reportFrom}" onchange="reportFrom=this.value;renderReports()"></div><div><label>Hasta</label><input type="date" value="${reportTo}" onchange="reportTo=this.value;renderReports()"></div></div><div class="metricgrid" style="margin-top:18px">${[
      ["Recepciones", m.count],
      ["Cotizaciones aprobadas", m.approved],
      ["Trabajos finalizados", m.completed],
      ["Facturación registrada", fmt(m.invoiced)],
      ["Pagos recibidos", fmt(m.received)],
      [
        "Tiempo medio a finalización",
        m.averageDays === null ? "Sin datos" : m.averageDays + " días",
      ],
    ]
      .map(
        ([l, v]) =>
          `<div class="metric"><span>${l}</span><div class="money-metric">${v}</div></div>`,
      )
      .join(
        "",
      )}</div><div class="detailgrid"><div class="card"><h2>Clientes frecuentes</h2>${
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(
          ([id, n]) =>
            `<div class="payment-entry">${esc(client(id).name)} <b>· ${n} trabajos</b></div>`,
        )
        .join("") || '<p class="sub">Sin registros en el período.</p>'
    }</div><div class="card"><h2>Productividad por técnico</h2>${
      Object.entries(tech)
        .map(
          ([name, n]) =>
            `<div class="payment-entry"><b>${esc(name)}</b><p>${n.total} asignados · ${n.finished} finalizados</p></div>`,
        )
        .join("") ||
      '<p class="sub">Asigna técnicos para obtener este reporte.</p>'
    }</div></div><p class="footer-note">El tiempo medio usa registros nuevos con fechas completas. Los ejemplos antiguos no se incluyen en ese cálculo.</p>`;
}
function exportReport() {
  const cell = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const rows = [
    [
      "Código",
      "Cliente",
      "Recepción",
      "Estado",
      "Total con IGV",
      "Pagado",
      "Comprobante",
      "Técnico",
    ],
    ...reportingTickets().map((t) => [
      cid(t.id),
      client(t.clientId).name,
      t.received,
      labels[t.status],
      calc(t).gross,
      t.paid,
      t.doc.number,
      t.work.responsible,
    ]),
  ];
  pdfDownload(
    new Blob(["\ufeff" + rows.map((r) => r.map(cell).join(";")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    }),
    "LEXSAN-reporte-" + iso() + ".csv",
  );
}
function renderInvoices() {
  const items = db.tickets.filter((t) => t.doc.number);
  document.getElementById("page").innerHTML =
    `<div class="section-head"><div><h1>Facturación registrada</h1><p class="sub">Comprobantes emitidos externamente. Sin integración con SUNAT.</p></div></div><div class="tablebox"><table><thead><tr><th>Comprobante</th><th>Cliente</th><th>Importe</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>${items.map((t) => `<tr class="clickable" onclick="openTicket(${t.id},'cobro')"><td>${esc(t.doc.type)}<br><b>${esc(t.doc.number)}</b><br>${esc(t.doc.date)}</td><td>${esc(client(t.clientId).name)}</td><td>${fmt(calc(t).gross)}</td><td>${fmt(t.paid)}</td><td>${fmt(Math.max(0, calc(t).gross - t.paid))}</td><td>${t.paid >= calc(t).gross ? "Pagado" : t.paid ? "Pago parcial" : "Pendiente"}</td></tr>`).join("") || '<tr><td colspan="6" class="empty">Aún no hay comprobantes registrados.</td></tr>'}</tbody></table></div>`;
}
function renderUsers() {
  document.getElementById("page").innerHTML =
    `<div class="section-head"><h1>Usuarios y perfiles</h1><button class="button" onclick="userForm()">Registrar perfil</button></div><div class="hint">${LexStore.mode === "local" ? "Modo local: estos perfiles organizan el trabajo y permiten probar vistas. No son cuentas autenticadas ni una barrera de seguridad." : "Cuentas verificadas con Firebase Authentication. Los roles se aplican mediante reglas de Firestore."}</div><div class="stock-grid">${(db.users || []).map((u, i) => `<div class="card"><h3>${esc(u.name)}</h3><p>${esc(u.email || "Sin correo")}</p><p style="margin:10px 0">${esc(u.role)} · ${u.active ? "Activo" : "Inactivo"}</p><button class="button outline sm" onclick="userForm(${i})">Editar perfil</button></div>`).join("")}</div>`;
}
function userForm(i = -1) {
  const u = db.users?.[i] || {
    name: "",
    email: "",
    role: "tecnico",
    active: true,
    uid: "",
  };
  modalShow(
    `<div class="modal-head"><h2>Perfil de usuario</h2><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><form onsubmit="event.preventDefault();saveUser(${i})"><div class="field"><label>Nombre *</label><input id="user-name" value="${esc(u.name)}" required></div><div class="field"><label>Correo</label><input id="user-email" type="email" value="${esc(u.email)}"></div><div class="field"><label>Rol</label><select id="user-role">${["administracion", "gerencia", "tecnico"].map((r) => `<option ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></div><label><input id="user-active" type="checkbox" ${u.active ? "checked" : ""}> Perfil activo</label><button class="button">Guardar perfil</button></form></div>`,
    true,
  );
}
function saveUser(i) {
  const name = document.getElementById("user-name").value.trim(),
    email = document.getElementById("user-email"),
    role = document.getElementById("user-role").value,
    active = document.getElementById("user-active").checked;
  if (!name || !email.checkValidity()) return toast("Revisa nombre y correo.");
  const uid = db.users[i]?.uid || crypto.randomUUID();
  if (uid === LexSession.user?.uid && (!active || role !== "gerencia"))
    return toast("Conserva tu perfil de gerencia activo.");
  const u = { uid, name, email: email.value.trim(), role, active };
  if (i < 0) db.users.push(u);
  else db.users[i] = u;
  save();
  refreshProfileSelector();
  closeModal();
}
function applyRoleView() {
  if (!window.LexSession) return;
  const tech = LexSession.user?.role === "tecnico";
  for (const route of [
    "clientes",
    "cotizaciones",
    "facturacion",
    "reportes",
    "inventario",
    "usuarios",
  ]) {
    const b = document.querySelector(`[data-route="${route}"]`);
    if (b)
      b.hidden =
        tech || (route === "usuarios" && LexSession.user?.role !== "gerencia");
  }
  if (!tech) return;
  document
    .querySelectorAll(
      '[onclick*="newTicket"],[onclick*="approveTicket"],[onclick*="rejectTicket"],[onclick*="saveDocument"],[onclick*="sendQuote"],[onclick*="exportReport"],[onclick*="LexStore.export"],[onclick*="addLine"],[onclick*="applySalePreset"],[onclick*="applyTechnicalPreset"],[onclick*="addStockLine"]',
    )
    .forEach((e) => (e.hidden = true));
  document
    .querySelectorAll(
      ".quotegrid,.quote-table,.quote-table~.splithead,#assigned-tech",
    )
    .forEach((e) => (e.disabled = true));
  document.querySelectorAll(".tabs button").forEach((b) => {
    if (["Comprobante y pago", "Documentos"].includes(b.textContent))
      b.hidden = true;
  });
}
