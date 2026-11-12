"use strict";
const LOGO =
    "data:image/png;base64,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",
  KEY = "lexsan_ciclo_phva_v2";
const iso = () => LexDomain.localDate(),
  now = () =>
    new Date().toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const round = (x) => Math.round((Number(x) + Number.EPSILON) * 100) / 100;
const fmt = (x) =>
  "S/ " +
  Number(x || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const normal = (x) =>
  String(x || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
const checkRuc = (id) => {
  if (!/^\d{11}$/.test(id)) return false;
  let w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2],
    s = w.reduce((a, x, i) => a + x * Number(id[i]), 0),
    c = 11 - (s % 11);
  return Number(id[10]) === (c === 10 ? 0 : c === 11 ? 1 : c);
};
const editDistance = (a, b) => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  let old = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let row = [i];
    for (let j = 1; j <= b.length; j++)
      row[j] = Math.min(
        row[j - 1] + 1,
        old[j] + 1,
        old[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    old = row;
  }
  return old[b.length];
};
const nameLooksLike = (a, b) => {
  let x = normal(a),
    y = normal(b);
  return x.length >= 7 && y.length >= 7 && (x === y || editDistance(x, y) <= 2);
};
const fresh = () => ({
  next: 93,
  clients: [
    {
      id: "20456091033",
      type: "ruc",
      name: "TRANSPORTES DEMO S.A.C.",
      contact: "Contacto de demostración",
      email: "",
      phone: "000000000",
    },
    {
      id: "20999999990",
      type: "ruc",
      name: "CLIENTE DE DEMOSTRACIÓN S.A.C.",
      contact: "Encargado de mantenimiento",
      email: "",
      phone: "",
    },
    {
      id: "00000000",
      type: "dni",
      name: "CLIENTE FINAL DE PRUEBA",
      contact: "",
      email: "",
      phone: "",
    },
  ],
  tickets: [
    {
      id: 89,
      clientId: "20456091033",
      equipment: "Radiador H2O · Motor Foton",
      serial: "PL-000-000",
      received: "2026-11-07",
      status: "evaluacion",
      eval: {
        condition: "Equipo recibido para inspección.",
        findings: "",
        fixes: "",
        photos: [],
      },
      quote: {
        number: "261-26",
        version: 1,
        lines: [
          {
            desc: "Evaluación, mantenimiento y reparación de radiador H2O",
            qty: 1,
            price: 250,
          },
          {
            desc: "Evaluación y mantenimiento de intercooler",
            qty: 1,
            price: 100,
          },
        ],
        discount: 0,
        gross: null,
        terms:
          "Entrega: 1 día hábil. Validez: 7 días. Lugar: taller Lexsan Radiadores. Pago: contado.",
      },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: "",
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      events: [
        {
          at: "07/11/2026",
          who: "Asistente",
          text: "Recepción del radiador. Pendiente de evaluación.",
        },
      ],
    },
    {
      id: 90,
      clientId: "20999999990",
      equipment: "Intercooler industrial",
      serial: "EQ-090",
      received: "2026-11-07",
      status: "aprobacion",
      eval: {
        condition: "Equipo con suciedad y posible fuga",
        findings: "Acumulación interna y fuga en unión",
        fixes: "Limpieza, reparación y prueba de presión",
        photos: [],
      },
      quote: {
        number: "262-26",
        version: 1,
        lines: [
          { desc: "Mantenimiento de intercooler", qty: 1, price: 100 },
          { desc: "Evaluación y reparación", qty: 1, price: 250 },
        ],
        discount: 0,
        gross: null,
        terms: "Entrega: 2 días hábiles. Validez: 7 días. Pago: contado.",
      },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: "",
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      events: [
        {
          at: "07/11/2026",
          who: "Asistente",
          text: "Cotización enviada. En espera de aprobación.",
        },
      ],
    },
    {
      id: 91,
      clientId: "20999999990",
      equipment: "Radiador industrial CAT",
      serial: "EQ-091",
      received: "2026-11-06",
      status: "taller",
      eval: {
        condition: "Sin accesorios",
        findings: "Fisura en tanque superior",
        fixes: "Soldadura y prueba hidrostática",
        photos: [],
      },
      quote: {
        number: "260-26",
        version: 1,
        lines: [{ desc: "Reparación de tanque superior", qty: 1, price: 480 }],
        discount: 0,
        gross: null,
        terms:
          "Entrega: 2 días hábiles. Validez: 7 días. Pago: crédito 15 días.",
      },
      approval: {
        who: "Encargado de mantenimiento",
        at: "06/11/2026",
        proof: "Correo",
      },
      work: {
        responsible: "Técnico de taller",
        start: "07/11/2026",
        finished: "",
        qc: false,
        delivered: "",
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      events: [
        { at: "06/11/2026", who: "Gerenta", text: "Cotización aprobada." },
        {
          at: "07/11/2026",
          who: "Asistente",
          text: "Orden de trabajo iniciada.",
        },
      ],
    },
    {
      id: 92,
      kind: "venta",
      productCode: "451",
      clientId: "20999999990",
      equipment: "Radiador H2O importado · Freightliner Century",
      serial: "Código producto: 451",
      received: "2026-11-07",
      status: "evaluacion",
      eval: {
        condition: "Venta de repuesto: no requiere evaluación de taller.",
        findings: "",
        fixes: "",
        photos: [],
      },
      quote: {
        number: "256-26",
        version: 1,
        lines: [
          {
            desc: "Radiador H2O importado · Código 451 · Freightliner Century",
            qty: 1,
            price: 1949.15,
          },
        ],
        discount: 0,
        gross: 2300,
        terms:
          "Precio final incluye IGV 18%. Entrega: 1 día hábil. Validez de oferta: 7 días. Pago: contado. Garantía: 6 meses por defectos de fábrica, sujeta a condiciones aplicables. Cambio de refrigerante: no incluido.",
      },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: "",
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      events: [
        {
          at: "07/11/2026",
          who: "Asistente",
          text: "Solicitud de venta registrada, pendiente de cotización.",
        },
      ],
    },
  ],
});
let db = LexStore.load(KEY, fresh);
let route = "inicio",
  modal = null,
  tab = "resumen",
  search = "",
  filter = "todos";
let save = () => LexStore.save(db);
const client = (id) =>
  db.clients.find((c) => c.id === id) || { id, name: "Cliente sin ficha" };
const ticket = (id) => db.tickets.find((t) => t.id === Number(id));
const cid = (id) =>
  ticket(id)?.code ||
  "LEX-" +
    (ticket(id)?.received?.slice(0, 4) || iso().slice(0, 4)) +
    "-" +
    String(id).padStart(3, "0");
const kindOf = (t) => t.kind || "reparacion";
const needsEvaluation = (t) => !["venta", "cotizacion"].includes(kindOf(t));
const needsWorkOrder = (t) =>
  kindOf(t) === "venta"
    ? false
    : kindOf(t) === "cotizacion"
      ? t.requiresOT === true
      : true;
const kindLabels = {
  cotizacion: "Cotización independiente",
  reparacion: "Reparación / mantenimiento",
  venta: "Venta de radiadores, equipos y piezas nuevos",
  fabricacion: "Fabricación / conversión",
};
const TECH_PRESETS = {
  radiador: {
    name: "Radiador H2O: evaluación y mantenimiento",
    price: 250,
    text: "Verificar desmontaje de accesorios; limpieza interior y exterior; desincrustación y neutralización cuando corresponda; sondeo de tubos; reparación autorizada; prueba hidrostática según especificación del componente.",
  },
  intercooler: {
    name: "Intercooler: evaluación y reparación",
    price: 350,
    text: "Inspección de fugas; desmontaje de accesorios; limpieza interior y exterior; verificación de placa porta tubo; reparación aprobada; prueba hidrostática bajo especificación aplicable al intercooler.",
  },
  fabricacion: {
    name: "Fabricación / conversión a medida",
    price: 0,
    text: "Confirmar medidas, planos, materiales y especificaciones; validar presupuesto y alcance; fabricar y controlar dimensiones, estanqueidad y acabado antes de entregar.",
  },
};
const SALE_PRESETS = {
  radiador451: {
    code: "451",
    equipment: "Radiador H2O importado · Freightliner Century",
    description: "Radiador H2O importado · Código 451 · Freightliner Century",
    price: 1949.15,
    terms:
      "Precio final incluye IGV 18%. Entrega: 1 día hábil. Validez de oferta: 7 días. Pago: contado. Garantía: 6 meses por defectos de fábrica, sujeto a condiciones aplicables. Cambio de refrigerante: no incluido.",
  },
};
const progress = [
  "evaluacion",
  "aprobacion",
  "inicio",
  "taller",
  "entrega",
  "documento",
  "cerrado",
];
const labels = {
  evaluacion: "Pendiente evaluación",
  aprobacion: "Pendiente aprobación",
  inicio: "Pendiente de inicio",
  taller: "En taller",
  entrega: "Pendiente de entrega",
  documento: "Comprobante y cobro",
  cerrado: "Cerrado",
  rechazado: "No aprobado",
};
const tones = {
  evaluacion: "orange",
  aprobacion: "amber",
  inicio: "amber",
  taller: "orange",
  entrega: "amber",
  documento: "amber",
  cerrado: "green",
  rechazado: "red",
};
const badge = (t) =>
  `<span class="tag ${tones[t.status] || ""}">${esc(!needsEvaluation(t) && t.status === "evaluacion" ? "Pendiente cotización" : labels[t.status])}</span>`;
const event = (t, text) => {
  t.events ||= [];
  t.updatedAt = new Date().toISOString();
  t.events.unshift({
    at: now(),
    timestamp: new Date().toISOString(),
    who: document.getElementById("operator").value,
    text,
  });
  save();
};
const UI_ICONS = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-8h6v8"/>',
  list: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  file: '<path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 12h8M8 16h8"/>',
  arrowdown: '<path d="M12 3v14m-5-5 5 5 5-5M4 21h16"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  package:
    '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
  chart: '<path d="M4 20h16M7 16v-5m5 5V5m5 11V9"/>',
};
function uiIcon(name) {
  return (
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    (UI_ICONS[name] || UI_ICONS.file) +
    "</svg>"
  );
}
function toast(s) {
  let x = document.getElementById("toast");
  x.textContent = s;
  x.style.display = "block";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (x.style.display = "none"), 3200);
}
function go(to) {
  route = to;
  modal = null;
  document.getElementById("modal-root").innerHTML = "";
  document
    .querySelectorAll(".nav")
    .forEach((x) => x.classList.toggle("selected", x.dataset.route === to));
  document.getElementById("page-top").textContent = {
    inicio: "Panel de control",
    servicios: "Servicios y seguimiento",
    clientes: "Directorio de clientes",
    cotizaciones: "Cotizaciones",
    inventario: "Inventario",
  }[to];
  render();
  window.scrollTo(0, 0);
}
function kpis() {
  const m = [
    {
      label: "Por evaluar / cotizar",
      value: db.tickets.filter((t) => t.status === "evaluacion").length,
    },
    {
      label: "Pendientes de aprobación",
      value: db.tickets.filter((t) => t.status === "aprobacion").length,
    },
    {
      label: "En taller",
      value: db.tickets.filter((t) => ["inicio", "taller"].includes(t.status))
        .length,
    },
    {
      label: "Entrega y cobranza",
      value: db.tickets.filter((t) =>
        ["entrega", "documento"].includes(t.status),
      ).length,
    },
  ];
  return `<div class="metricgrid">${m.map((x) => `<div class="metric"><span>${x.label}</span><div>${x.value}</div></div>`).join("")}</div>`;
}
function rowTickets(items) {
  return `<div class="tablebox"><table><thead><tr><th>Servicio</th><th>Cliente / equipo</th><th>Estado</th><th>Gestión</th><th></th></tr></thead><tbody>${items.map((t) => `<tr class="clickable" onclick="openTicket(${t.id})"><td><span class="id-dot"></span><span class="ticket-id">${cid(t.id)}</span><div class="muted small" style="margin:4px 0 0 12px">${esc(t.received)}</div></td><td class="namecell"><b>${esc(client(t.clientId).name)}</b><small>${esc(t.equipment)}</small></td><td>${badge(t)}</td><td><span class="table-action">${esc(next(t))}</span></td><td><button class="button outline sm" onclick="event.stopPropagation();openTicket(${t.id})">Abrir ${uiIcon("arrow")}</button></td></tr>`).join("") || `<tr><td colspan="5" class="empty">Sin servicios registrados.</td></tr>`}</tbody></table></div>`;
}
function next(t) {
  if (!needsEvaluation(t)) {
    if (t.status === "evaluacion") return "Preparar cotización";
    if (t.status === "entrega") return "Confirmar entrega / conformidad";
  }
  return {
    evaluacion: "Evaluar y cotizar",
    aprobacion: "Registrar decisión del cliente",
    inicio: "Iniciar orden de trabajo",
    taller: "Registrar fin del trabajo",
    entrega: "Confirmar entrega",
    documento: "Registrar comprobante y pago",
    cerrado: "Consultar historial",
    rechazado: "Consultar motivo",
  }[t.status];
}
function render() {
  let p = document.getElementById("page");
  if (route === "inicio") {
    const active = db.tickets.filter(
      (t) => !["cerrado", "rechazado"].includes(t.status),
    ).length;
    p.innerHTML = `<div class="hero"><div><div class="eyebrow">LEXSAN / CONTROL DE SERVICIOS</div><h1>Panel operativo</h1><p>${active} servicios activos · Cotizaciones, taller y entregas</p></div><button class="button" onclick="newTicket()">${uiIcon("plus")} Nuevo trabajo</button></div>${kpis()}<div class="tilegrid"><button class="tile" onclick="newTicket()"><span class="tile-icon">${uiIcon("plus")}</span><span><b>Nuevo trabajo</b><small>Reparación, venta o fabricación</small></span></button><button class="tile" onclick="go('servicios')"><span class="tile-icon">${uiIcon("list")}</span><span><b>Seguimiento</b><small>Servicios y órdenes</small></span></button><button class="tile" onclick="go('clientes')"><span class="tile-icon">${uiIcon("search")}</span><span><b>Buscar cliente</b><small>Ficha e historial</small></span></button></div><div class="dashboard-grid"><div><div class="section-head"><div><h2>Servicios recientes</h2><p class="small">${db.tickets.length} registros · Ordenados por correlativo</p></div><button class="button outline sm" onclick="go('servicios')">Ver todos ${uiIcon("arrow")}</button></div>${rowTickets([...db.tickets].sort((a, b) => b.id - a.id).slice(0, 8))}</div><aside class="dashboard-side"><div class="side-panel"><div class="row between" style="margin-bottom:7px"><h3>Cotizaciones</h3>${uiIcon("file")}</div><p>Documentos comerciales</p><button class="doc-shortcut" onclick="downloadSampleQuote()">${uiIcon("file")}<span><b>Cotización 261-26</b><small>TRANS VILAC · S/ 413.00</small></span><span class="download">↓</span></button><button class="doc-shortcut" onclick="downloadSampleSale()">${uiIcon("file")}<span><b>Cotización 256-26</b><small>Freightliner Century · S/ 2,300.00</small></span><span class="download">↓</span></button></div><div class="side-panel"><div class="row between" style="margin-bottom:8px"><h3>Control de atención</h3>${uiIcon("chart")}</div><p>Trabajos activos: <strong style="color:#172639">${active}</strong></p><p style="margin-top:7px">Servicios cerrados: <strong style="color:#172639">${db.tickets.filter((t) => t.status === "cerrado").length}</strong></p></div></aside></div>`;
  } else if (route === "servicios" || route === "cotizaciones") {
    let arr = db.tickets.filter((t) => {
      let s = (
        cid(t.id) +
        " " +
        client(t.clientId).name +
        " " +
        t.equipment +
        " " +
        t.serial
      ).toLowerCase();
      return (
        s.includes(search.toLowerCase()) &&
        (filter === "todos" || t.status === filter)
      );
    });
    if (route === "cotizaciones") arr = arr.filter((t) => t.quote.lines.length);
    p.innerHTML = `<div class="section-head"><div><div class="eyebrow">OPERACIONES</div><h1>${route === "cotizaciones" ? "Cotizaciones" : "Seguimiento de servicios"}</h1><p class="sub">${arr.length} registros</p></div><button class="button" onclick="newTicket()">${uiIcon("plus")} Nuevo trabajo</button></div><div class="card" style="margin:18px 0 14px;padding:16px;display:flex;align-items:center;gap:13px;flex-wrap:wrap"><div class="searchrow" style="flex:1;min-width:230px"><input id="search-service" value="${esc(search)}" placeholder="Correlativo, cliente, equipo o placa" oninput="search=this.value;renderSearch()" style="width:100%"></div><select style="max-width:220px" onchange="filter=this.value;render()"><option value="todos" ${filter === "todos" ? "selected" : ""}>Todos los estados</option>${Object.entries(
      labels,
    )
      .map(
        ([x, y]) =>
          `<option value="${x}" ${filter === x ? "selected" : ""}>${esc(y)}</option>`,
      )
      .join("")}</select></div>${rowTickets(arr.sort((a, b) => b.id - a.id))}`;
  } else if (route === "clientes") {
    p.innerHTML = `<div class="section-head"><div><div class="eyebrow">DIRECTORIO</div><h1>Clientes</h1><p class="sub">${db.clients.length} clientes registrados</p></div><button class="button" onclick="addClient()">${uiIcon("plus")} Nuevo cliente</button></div><div class="card" style="margin:18px 0 14px;padding:17px"><label>Buscar cliente</label><input id="find-client" placeholder="RUC, DNI, nombre o contacto" oninput="renderClientList(this.value)"></div><div id="clients-list"></div>`;
    renderClientList("");
  } else {
    p.innerHTML = `<div class="section-head"><h1>Inventario</h1></div><div class="card"><h2>Productos y materiales</h2></div>`;
  }
}
function renderClientList(q) {
  let el = document.getElementById("clients-list");
  if (!el) return;
  let clients = db.clients.filter((c) =>
    normal(c.name + " " + c.id + " " + c.contact).includes(normal(q)),
  );
  el.innerHTML = `<div class="tablebox"><table><thead><tr><th>Cliente</th><th>Documento</th><th>Contacto</th><th>Servicios</th><th></th></tr></thead><tbody>${clients.map((c) => `<tr><td><b>${esc(c.name)}</b></td><td>${c.type === "ruc" ? "RUC" : "DNI"} ${esc(c.id)}</td><td>${esc(c.contact || "—")}</td><td>${db.tickets.filter((t) => t.clientId === c.id).length}</td><td><button class="button outline sm" onclick="clientHistory('${esc(c.id)}')">Historial</button></td></tr>`).join("") || '<tr><td colspan="5" class="empty">Sin coincidencias.</td></tr>'}</tbody></table></div>`;
}
function modalShow(body, small = false) {
  document.getElementById("modal-root").innerHTML =
    `<div class="modal-cover" onclick="if(event.target===this)closeModal()"><section class="modal ${small ? "modal-sm" : ""}" role="dialog" aria-modal="true">${body}</section></div>`;
}
function closeModal() {
  modal = null;
  document.getElementById("modal-root").innerHTML = "";
  render();
}
function newTicket() {
  modal = "new";
  modalShow(
    `<div class="modal-head"><div><div class="eyebrow">NUEVO INGRESO</div><h2>Registrar trabajo</h2><p class="small">Recepción / solicitud</p></div><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><div class="field"><label>Tipo de operación</label><div class="operation-choices"><label class="operation-choice"><input type="radio" name="new-kind" value="reparacion" checked onchange="updateKindForm()"><b>🔧 Reparación / mantenimiento</b><small>Evaluación + cotización + taller</small></label><label class="operation-choice"><input type="radio" name="new-kind" value="venta" onchange="updateKindForm()"><b>▣ Venta de radiadores, equipos y piezas nuevos</b><small>Catálogo + cotización + entrega</small></label><label class="operation-choice"><input type="radio" name="new-kind" value="fabricacion" onchange="updateKindForm()"><b>▤ Fabricación / conversión</b><small>Especificaciones + OT + entrega</small></label><label class="operation-choice"><input type="radio" name="new-kind" value="cotizacion" onchange="updateKindForm()"><b>Cotización independiente</b><small>Presupuesto directo sin evaluación</small></label></div></div><div class="field"><label>Cliente registrado</label><select id="new-client"><option value="">Seleccionar cliente...</option>${db.clients.map((c) => `<option value="${esc(c.id)}">${esc(c.name)} · ${esc(c.id)}</option>`).join("")}</select><button class="button link sm" onclick="addClient(true)">＋ Registrar cliente nuevo</button></div><div class="fields2"><div class="field"><label id="new-equipment-label">Equipo / componente</label><input id="new-equipment" placeholder="Ej.: Radiador H2O motor Foton"></div><div class="field"><label id="new-serial-label">Placa, serie o código de producto</label><input id="new-serial" placeholder="Ej.: PL-000-000"></div></div><div class="field"><label id="new-condition-label">Condiciones de ingreso (opcional)</label><textarea id="new-condition" placeholder="Daños visibles, accesorios, guía de remisión..." style="min-height:65px"></textarea></div><div class="field" id="direct-ot-field" hidden><label><input type="checkbox" id="new-requires-ot"> Este servicio requiere orden de trabajo después de la aprobación</label><p class="small">Sin marcar: se confirma la entrega o conformidad y se registra el cobro, sin pasar por taller.</p></div><div class="hint" id="kind-help">Evaluación técnica y cotización</div><div class="row between"><span class="muted small">Correlativo: <b>${cid(db.next)}</b></span><button class="button" onclick="createTicket()">Guardar y continuar →</button></div></div>`,
    true,
  );
  updateKindForm();
}
function updateKindForm() {
  const k =
    document.querySelector('input[name="new-kind"]:checked')?.value ||
    "reparacion";
  document.getElementById("new-equipment-label").textContent =
    k === "venta"
      ? "Producto y compatibilidad"
      : k === "fabricacion"
        ? "Componente a fabricar / convertir"
        : "Equipo / componente";
  document.getElementById("new-condition-label").textContent =
    k === "venta"
      ? "Nota de venta (opcional)"
      : k === "fabricacion"
        ? "Medidas, planos o requisitos iniciales"
        : "Condición de recepción";
  document.getElementById("kind-help").textContent =
    k === "venta"
      ? "Cotización de venta · Disponibilidad por confirmar"
      : k === "fabricacion"
        ? "Especificaciones · Cotización · Producción"
        : "Evaluación · Cotización · Taller · Entrega";
}
function createTicket() {
  const k =
    document.querySelector('input[name="new-kind"]:checked')?.value ||
    "reparacion";
  let clientId = document.getElementById("new-client").value,
    equip = document.getElementById("new-equipment").value.trim(),
    serial = document.getElementById("new-serial").value.trim(),
    condition = document.getElementById("new-condition").value.trim();
  if (!db.clients.some((c) => c.id === clientId) || !equip)
    return toast("Selecciona un cliente y registra el equipo o producto.");
  let id = LexStore.nextId(db),
    t = {
      id,
      kind: k,
      requiresOT:
        k === "cotizacion"
          ? document.getElementById("new-requires-ot").checked
          : k !== "venta",
      clientId,
      equipment: equip,
      serial,
      productCode: "",
      received: iso(),
      status: "evaluacion",
      eval: { condition, findings: "", fixes: "", photos: [] },
      quote: {
        number: "",
        version: 1,
        lines: [],
        discount: 0,
        gross: null,
        terms: ["venta", "cotizacion"].includes(k)
          ? "Entrega: 1 día hábil. Validez: 7 días. Pago: contado. Refrigerante recomendado: Prestone, Zerex Valvoline u otro; no Vistony. Usar gomas de soporte y pernos de seguridad operativos. Garantía: 6 meses por defecto de fábrica. No cubre oxidación interior, abolladuras ni fisuras del colector. Cambio de refrigerante: No."
          : "Entrega según evaluación. Validez de oferta: 7 días. Lugar de entrega: Taller Lexsan Radiadores. Condición de pago: contado.",
      },
      work: {
        responsible: "",
        start: "",
        finished: "",
        qc: false,
        delivered: "",
      },
      doc: { type: "", number: "", date: "" },
      paid: 0,
      events: [],
    };
  event(
    t,
    "Nuevo " +
      kindLabels[k].toLowerCase() +
      ". " +
      (["venta", "cotizacion"].includes(k)
        ? "Pendiente de cotización."
        : "Pendiente de evaluación y cotización."),
  );
  db.tickets.push(t);
  save();
  toast("Trabajo guardado como " + cid(id));
  openTicket(id, "evaluacion");
}
function addClient(fromTicket = false) {
  modal = "client";
  modalShow(
    `<div class="modal-head"><div><div class="eyebrow">CLIENTES</div><h2>Nuevo cliente</h2><p class="small">Identificación del cliente</p></div><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body"><div class="fields2"><div class="field"><label>Tipo de documento</label><select id="client-type"><option value="ruc">RUC (11 dígitos)</option><option value="dni">DNI (8 dígitos)</option></select></div><div class="field"><label>Número de documento</label><input id="client-id" placeholder="Ingresa el número" inputmode="numeric" oninput="checkClientMatch()"></div></div><div class="field"><label>Razón social / nombre</label><input id="client-name" placeholder="Nombre legal del cliente" oninput="checkClientMatch()"></div><div class="fields2"><div class="field"><label>Persona de contacto</label><input id="client-contact"></div><div class="field"><label>Teléfono</label><input id="client-phone"></div></div><div class="field"><label>Correo</label><input type="email" id="client-email"></div><div id="client-warning" class="hint" style="display:none"></div><div class="row between"><span class="small muted">Registro único por documento</span><button class="button" onclick="saveClient(${fromTicket})">Guardar cliente</button></div></div>`,
    true,
  );
}
function checkClientMatch() {
  let id = document.getElementById("client-id").value.replace(/\D/g, ""),
    name = document.getElementById("client-name").value;
  let duplicate = db.clients.find((c) => c.id === id),
    similar = db.clients.find(
      (c) => nameLooksLike(c.name, name) && name.trim().length >= 7,
    );
  let warn = document.getElementById("client-warning");
  warn.style.display = duplicate || similar ? "block" : "none";
  warn.textContent = duplicate
    ? "Este documento ya está registrado como " +
      duplicate.name +
      ". No se puede duplicar."
    : similar
      ? "Existe un cliente con nombre similar: " +
        similar.name +
        ". Verifica antes de guardar."
      : "";
}
function saveClient(back) {
  let type = document.getElementById("client-type").value,
    id = document.getElementById("client-id").value.replace(/\D/g, ""),
    name = document.getElementById("client-name").value.trim().toUpperCase();
  if (
    document.getElementById("client-email").value &&
    !document.getElementById("client-email").checkValidity()
  )
    return toast("Revisa el correo del cliente.");
  if (id.length !== (type === "ruc" ? 11 : 8) || name.length < 3)
    return toast("Revisa el número de documento y el nombre.");
  if (type === "ruc" && !checkRuc(id))
    return toast(
      "El RUC tiene un dígito de verificación incorrecto. Revísalo.",
    );
  if (db.clients.some((c) => c.id === id))
    return toast("Ese documento ya existe. Usa la ficha registrada.");
  let dup = db.clients.find((c) => nameLooksLike(c.name, name));
  if (
    dup &&
    !confirm(
      "Ya existe una ficha con nombre similar: " +
        dup.name +
        ". ¿Confirmas que es otra persona o empresa?",
    )
  )
    return;
  db.clients.push({
    id,
    type,
    name,
    contact: document.getElementById("client-contact").value.trim(),
    phone: document.getElementById("client-phone").value.trim(),
    email: document.getElementById("client-email").value.trim(),
  });
  save();
  toast("Cliente registrado sin duplicar su documento");
  if (back) {
    newTicket();
    document.getElementById("new-client").value = id;
  } else closeModal();
}
function clientHistory(id) {
  let c = client(id),
    arr = db.tickets
      .filter((t) => t.clientId === id)
      .sort((a, b) => b.id - a.id);
  modalShow(
    `<div class="modal-head"><div><div class="eyebrow">HISTORIAL COMERCIAL</div><h2>${esc(c.name)}</h2><p class="small">${c.type === "ruc" ? "RUC" : "DNI"} ${esc(c.id)} · ${arr.length} servicios registrados</p></div><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body">${rowTickets(arr)}<div class="sep"></div><button class="button outline" onclick="closeModal();newTicket();document.getElementById('new-client').value='${esc(c.id)}'">＋ Nuevo ingreso para este cliente</button></div>`,
  );
}
function stepsHTML(t) {
  const sale = !needsWorkOrder(t),
    current = sale
      ? {
          evaluacion: 1,
          aprobacion: 2,
          entrega: 3,
          documento: 4,
          cerrado: 5,
          rechazado: 2,
        }[t.status] || 0
      : {
          evaluacion: 1,
          aprobacion: 2,
          inicio: 3,
          taller: 3,
          entrega: 4,
          documento: 5,
          cerrado: 6,
          rechazado: 2,
        }[t.status] || 0;
  const st = sale
    ? ["Solicitud", "Cotización", "Aprobación", "Entrega", "Comprobante"]
    : [
        needsEvaluation(t) ? "Ingreso" : "Solicitud",
        needsEvaluation(t) ? "Evaluar + cotizar" : "Cotización",
        "Aprobación",
        "Producción",
        "Entrega",
        "Comprobante",
      ];
  return `<div class="steps" style="grid-template-columns:repeat(${st.length},minmax(0,1fr))">${st.map((s, i) => `<div class="step ${i < current ? "done" : ""} ${i === current ? "current" : ""}">${i + 1}. ${s}</div>`).join("")}</div>`;
}
function openTicket(id, nextTab = "resumen") {
  let t = ticket(id);
  if (!t) return;
  modal = t.id;
  tab = nextTab;
  renderTicketModal();
}
function renderTicketModal() {
  let t = ticket(modal);
  if (!t) return;
  let c = client(t.clientId);
  modalShow(
    `<div class="modal-head"><div><div class="eyebrow">${esc(kindLabels[kindOf(t)])} · EXPEDIENTE</div><div class="row wrap" style="margin-top:5px"><h2>${cid(t.id)}</h2>${badge(t)}</div><p class="small">${esc(c.name)} · ${esc(t.equipment)}</p></div><button class="xbtn" onclick="closeModal()">×</button></div><div class="modal-body">${stepsHTML(t)}<div class="tabs">${[["resumen", "Resumen"], ["evaluacion", needsEvaluation(t) ? "Evaluación + cotización" : "Cotización"], ...(!needsWorkOrder(t) ? [] : [["taller", "Taller y entrega"]]), ["cobro", "Comprobante y pago"], ["docs", "Documentos"]].map(([id, label]) => `<button class="${tab === id ? "on" : ""}" onclick="tab='${id}';renderTicketModal()">${label}</button>`).join("")}</div><div id="tab-body">${ticketBody(t)}</div></div>`,
  );
}
function renderEvaluationView(t, money) {
  const sale = kindOf(t) === "venta",
    fab = kindOf(t) === "fabricacion",
    editable = t.status === "evaluacion";
  const quoteView = renderQuoteEditor(t);
  const commonActions = `<div class="row wrap" style="margin-top:15px">${editable ? `<button class="button" onclick="sendQuote()">${sale ? "Enviar cotización a aprobación" : "Enviar cotización"} →</button>` : ""}${needsEvaluation(t) ? `<button class="button outline" onclick="docPrint('eval')">↓ PDF evaluación</button>` : ""}<button class="button outline" onclick="docPrint('quote')">↓ Generar PDF cotización</button></div>`;
  if (!editable)
    return `<div class="hint goodhint">${!needsEvaluation(t) ? "Cotización registrada" : "Evaluación y cotización registradas"}</div>${!needsEvaluation(t) ? "" : `<div class="detail"><b>Observaciones:</b> ${esc(t.eval.findings || "---")}<br><b>Correcciones:</b> ${esc(t.eval.fixes || "---")}</div><div class="sep"></div>`}${needsEvaluation(t) ? technicalDetails(t) : ""}${quoteView}${commonActions}`;
  const saleForm = `<div class="hint">Venta de producto · Disponibilidad por confirmar</div><div class="field"><label>Catálogo de productos</label><div class="row wrap"><select id="sale-preset" style="flex:1;min-width:230px"><option value="">Seleccionar producto...</option><option value="radiador451">451 · Radiador importado Freightliner Century</option></select><button class="button soft" onclick="applySalePreset()">Usar producto</button></div></div><div class="detail"><b>Producto:</b> ${esc(t.equipment)}<br><b>Código:</b> ${esc(t.productCode || "Pendiente de identificar")}<br><b>Disponibilidad:</b> por confirmar</div>`;
  const technicalForm = `<div class="hint">${fab ? "Especificaciones de fabricación" : "Diagnóstico técnico"}</div><div class="fields2"><div class="field"><label>Condiciones de ingreso</label><textarea id="ev-condition" oninput="draftInput()">${esc(t.eval.condition)}</textarea></div><div class="field"><label>${fab ? "Especificaciones y medidas detectadas" : "Observaciones del técnico"}</label><textarea id="ev-findings" oninput="draftInput()" placeholder="${fab ? "Dimensiones, planos, material y requerimientos" : "Ej.: fuga visible en panal del intercooler"}">${esc(t.eval.findings)}</textarea></div></div><div class="field"><label>Procedimiento técnico</label><div class="row wrap"><select id="tech-preset" style="flex:1;min-width:240px"><option value="">Seleccionar procedimiento...</option>${Object.entries(
    TECH_PRESETS,
  )
    .map(([key, x]) => `<option value="${key}">${esc(x.name)}</option>`)
    .join(
      "",
    )}</select><button class="button soft" onclick="applyTechnicalPreset()">Agregar propuesta</button></div><p class="small" style="margin:5px 0"></p></div><div class="field"><label>Corrección o procedimiento propuesto</label><textarea id="ev-fixes" oninput="draftInput()" placeholder="Procesos técnicos aplicables y aprobados">${esc(t.eval.fixes)}</textarea></div><div class="field"><label>Evidencia fotográfica (opcional)</label><input type="file" accept="image/*" id="ev-photo" onchange="addPhoto(this)"><div class="photo-row">${t.eval.photos.map((src) => `<img src="${src}" alt="Evidencia">`).join("")}</div></div>`;
  return `${quoteView}<details class="quote-extra" style="margin-top:20px"><summary>${sale ? "Catálogo de productos" : "Evaluación técnica y fotografías"}</summary>${sale ? saleForm : needsEvaluation(t) ? technicalForm + technicalDetails(t) : "Cotización directa, sin evaluación."}</details>${commonActions}`;
}
function applyTechnicalPreset() {
  const t = ticket(modal),
    key = document.getElementById("tech-preset")?.value,
    p = TECH_PRESETS[key];
  if (!p || t.status !== "evaluacion") return;
  const notes = document.getElementById("ev-fixes");
  if (
    notes?.value.trim() &&
    !confirm("¿Reemplazar los procedimientos propuestos?")
  )
    return;
  t.eval.fixes = p.text;
  if (!t.quote.lines.length) {
    t.quote.lines.push({ desc: p.name, qty: 1, price: p.price });
  }
  save();
  tab = "evaluacion";
  renderTicketModal();
  toast(
    "Plantilla aplicada: revisa procedimientos y precios antes de cotizar.",
  );
}
function applySalePreset() {
  const t = ticket(modal),
    key = document.getElementById("sale-preset")?.value,
    p = SALE_PRESETS[key];
  if (!p || t.status !== "evaluacion") return;
  if (
    t.quote.lines.length &&
    !confirm("¿Reemplazar las partidas actuales con el producto seleccionado?")
  )
    return;
  t.equipment = p.equipment;
  t.productCode = p.code;
  t.quote.lines = [{ desc: p.description, qty: 1, price: p.price }];
  t.quote.discount = 0;
  t.quote.gross = null;
  t.quote.pricingMode = "items";
  t.quote.pricingReview = false;
  t.quote.terms = p.terms;
  save();
  tab = "evaluacion";
  renderTicketModal();
  toast("Producto cargado; revisa precio, disponibilidad y condiciones.");
}
function ticketBody(t) {
  let c = client(t.clientId),
    money = calc(t);
  if (tab === "resumen")
    return `<div class="detailgrid"><div class="detail"><div class="eyebrow">ESTADO DEL SERVICIO</div><h2 style="margin:8px 0 8px">${esc(!needsEvaluation(t) && t.status === "evaluacion" ? "Pendiente cotización" : labels[t.status])}</h2><p>Siguiente etapa: <b>${esc(next(t))}</b>.</p><div class="sep"></div><dl><dt>Cliente</dt><dd>${esc(c.name)} · ${esc(c.id)}</dd><dt>Equipo</dt><dd>${esc(t.equipment)}</dd><dt>Serie / placa</dt><dd>${esc(t.serial || "No registrada")}</dd><dt>Ingreso</dt><dd>${esc(t.received)}</dd><dt>Importe cotizado</dt><dd>${t.quote.lines.length ? fmt(money.gross) : "Pendiente"}</dd></dl>${t.status === "evaluacion" ? `<button class="button" onclick="tab='evaluacion';renderTicketModal()">${needsEvaluation(t) ? "Evaluar y cotizar" : "Preparar cotización"} →</button>` : ""}${t.status === "aprobacion" ? `<div class="row wrap"><button class="button green" onclick="approveTicket()">✓ Cliente aprobó</button><button class="button outline" onclick="rejectTicket()">No aprobó</button></div>` : ""}${t.status === "inicio" ? `<button class="button" onclick="tab='taller';renderTicketModal()">Crear / iniciar OT →</button>` : ""}${["taller", "entrega"].includes(t.status) ? `<button class="button" onclick="${!needsWorkOrder(t) ? "deliver()" : "tab='taller';renderTicketModal()"}">${!needsWorkOrder(t) ? "Confirmar entrega / conformidad" : "Continuar con taller"} →</button>` : ""}${t.status === "documento" ? `<button class="button" onclick="tab='cobro';renderTicketModal()">Registrar comprobante y cobro →</button>` : ""}${t.status === "cerrado" ? '<span class="tag green">✓ Expediente cerrado</span>' : ""}</div><div class="detail"><h3>Historial de movimientos</h3><div class="timeline">${t.events.map((e) => `<div class="event"><b>${esc(e.text)}</b><small>${esc(e.at)} · ${esc(e.who)}</small></div>`).join("")}</div></div></div>`;
  if (tab === "evaluacion") return renderEvaluationView(t, money);
  if (tab === "taller")
    return `<h3>Orden de trabajo</h3><p class="sub">Actividades autorizadas</p><div class="detail" style="margin-top:15px"><b>Trabajo aprobado</b><p style="margin-top:8px">${esc(t.eval.fixes || "Pendiente de evaluación")}</p>${t.quote.lines.length ? `<ul>${t.quote.lines.map((l) => `<li>${esc(l.desc)} · Cant. ${l.qty}</li>`).join("")}</ul>` : ""}</div>${t.status === "inicio" ? `<div class="field" style="margin-top:16px"><label>Responsable de taller</label><input id="responsible" value="${esc(t.work.responsible)}" placeholder="Nombre del técnico"></div><button class="button" onclick="startWork()">Iniciar trabajo</button>` : ""}${t.status === "taller" ? `<div style="margin-top:17px"><label>Control de calidad completado</label><label class="row" style="color:#333;font-size:13px"><input type="checkbox" style="width:auto" id="qc" ${t.work.qc ? "checked" : ""} onchange="qcChange(this.checked)"> Prueba de presión e inspección final realizadas</label><div class="row wrap"><button class="button" onclick="finishWork()">Finalizar trabajo → pendiente de entrega</button><button class="button outline" onclick="docPrint('ot')">PDF orden de trabajo</button></div></div>` : ""}${t.status === "entrega" ? `<div class="hint goodhint">Trabajo finalizado. Falta registrar la entrega al cliente.</div><button class="button" onclick="deliver()">Confirmar entrega del equipo</button>` : ""}${!["inicio", "taller", "entrega"].includes(t.status) ? `<div class="hint">La orden de trabajo se habilita al aprobar la cotización. Estado actual: ${esc(!needsEvaluation(t) && t.status === "evaluacion" ? "Pendiente cotización" : labels[t.status])}.</div>` : ""}`;
  if (tab === "cobro")
    return `<div class="hint">Factura y boleta son ambos comprobantes. Registro del comprobante emitido externamente. No realiza emisión electrónica.</div>${t.status === "documento" || t.status === "cerrado" ? `<div class="fields2"><div class="field"><label>Tipo de comprobante</label><select id="doc-type" ${t.status === "cerrado" ? "disabled" : ""}><option value="">Seleccionar...</option><option value="FACTURA" ${t.doc.type === "FACTURA" ? "selected" : ""}>Factura</option><option value="BOLETA" ${t.doc.type === "BOLETA" ? "selected" : ""}>Boleta de venta</option></select></div><div class="field"><label>Serie y correlativo real</label><input id="doc-number" value="${esc(t.doc.number)}" placeholder="Ej.: F001-0000123" ${t.status === "cerrado" ? "disabled" : ""}></div></div><div class="detail"><div class="totalrow"><span>Total del servicio</span><b>${fmt(money.gross)}</b></div><div class="totalrow"><span>Abonos registrados</span><b>${fmt(t.paid)}</b></div><div class="totalrow big"><span>Saldo pendiente</span><b>${fmt(Math.max(0, round(money.gross - t.paid)))}</b></div></div>${t.status !== "cerrado" ? `<div class="fields2" style="margin-top:15px"><div class="field"><label>Nuevo pago recibido (S/)</label><input type="number" id="payment-amount" min="0" step=".01" value="0"></div><div class="field"><label>Fecha del comprobante</label><input type="date" id="doc-date" value="${esc(t.doc.date || iso())}"></div></div><button class="button" onclick="registerPayment()">Guardar comprobante y pago</button><p class="small" style="margin-top:8px">Si el saldo llega a cero y hay comprobante registrado, el servicio se cierra automáticamente.</p>` : '<div class="hint goodhint">Servicio cerrado y totalmente cobrado.</div>'}` : `<div class="hint">Pendiente de entrega.</div>`}`;
  return `<h3>Documentos del expediente</h3><p class="sub">Todas las salidas se generan desde la misma información, sin digitar nuevamente.</p><div class="docActions" style="margin-top:16px">${!needsEvaluation(t) ? "" : `<button class="button outline" onclick="docPrint('eval')">↓ &nbsp; Descargar evaluación PDF</button>`}<button class="button outline" onclick="docPrint('quote')">↓ &nbsp; Generar cotización PDF</button><button class="button outline" onclick="docPrint('ot')" ${!needsWorkOrder(t) || !["inicio", "taller", "entrega", "documento", "cerrado"].includes(t.status) ? "disabled" : ""}>↓ &nbsp; Descargar orden de trabajo PDF</button><button class="button outline" onclick="prepareEmail()" ${!t.quote.lines.length ? "disabled" : ""}>✉ &nbsp; Preparar correo administrativo</button></div><div class="detail" style="margin-top:17px"><h3>Comprobante de pago</h3><p style="margin-top:9px">${t.doc.type ? esc(t.doc.type) + " · " + esc(t.doc.number) : "Aún no registrado"}</p><p class="small" style="margin-top:8px">El número de factura o boleta se asocia al servicio cuando se emite en el sistema tributario correspondiente.</p></div>`;
}
function draftInput() {
  let t = ticket(modal);
  if (!t || t.status !== "evaluacion") return;
  for (const [id, key] of [
    ["ev-condition", "condition"],
    ["ev-findings", "findings"],
    ["ev-fixes", "fixes"],
  ]) {
    let e = document.getElementById(id);
    if (e) t.eval[key] = e.value;
  }
  let terms = document.getElementById("q-terms");
  if (terms) t.quote.terms = terms.value;
  save();
}
function addPhoto(input) {
  return attachImage(input, "evaluation");
}
function addLine() {
  let t = ticket(modal);
  if (t.status !== "evaluacion") return;
  t.quote.lines.push({
    desc: t.eval.fixes
      ? "Reparación: " + t.eval.fixes
      : needsEvaluation(t)
        ? "Servicio de radiador"
        : "Producto o servicio a cotizar",
    qty: 1,
    price: 0,
  });
  save();
  renderTicketModal();
}
function removeLine(i) {
  let t = ticket(modal);
  if (t.status !== "evaluacion") return;
  t.quote.lines.splice(i, 1);
  save();
  renderTicketModal();
}
function refreshQuoteSummary() {
  const el = document.querySelector("#tab-body .quotegrid .detail");
  if (!el) return;
  const money = calc(ticket(modal));
  el.innerHTML = `<div class="totalrow"><span>Base imponible</span><b>${fmt(money.base)}</b></div><div class="totalrow"><span>IGV 18%</span><b>${fmt(money.igv)}</b></div><div class="totalrow big"><span>TOTAL</span><span>${fmt(money.gross)}</span></div>${money.adjust ? `<small class="muted">Ajuste por precio cerrado: ${fmt(money.adjust)}</small>` : ""}`;
}
function updateLine(i) {
  let t = ticket(modal);
  if (t.status !== "evaluacion") return;
  let d = document.getElementById("ld" + i),
    q = document.getElementById("lq" + i),
    p = document.getElementById("lp" + i);
  t.quote.lines[i] = {
    desc: d.value.trim(),
    qty: Number(q.value) || 0,
    price: round(p.value),
  };
  t.quote.gross = null;
  let gross = document.getElementById("q-gross");
  if (gross) gross.value = "";
  save();
  refreshQuoteSummary();
}
function updatePrice() {
  let t = ticket(modal);
  if (t.status !== "evaluacion") return;
  t.quote.discount = round(document.getElementById("q-discount").value);
  let total = document.getElementById("q-gross").value;
  t.quote.gross = total.trim() === "" ? null : round(total);
  save();
  refreshQuoteSummary();
}
function updateTerms() {
  ticket(modal).quote.terms = document.getElementById("q-terms").value;
  save();
}
function sendQuote() {
  let t = ticket(modal);
  if (t.status !== "evaluacion") return;
  for (const [id, key] of [
    ["ev-condition", "condition"],
    ["ev-findings", "findings"],
    ["ev-fixes", "fixes"],
  ]) {
    let e = document.getElementById(id);
    if (e) t.eval[key] = e.value.trim();
  }
  let terms = document.getElementById("q-terms");
  if (terms) t.quote.terms = terms.value.trim();
  const technical = needsEvaluation(t);
  if (
    (technical && (!t.eval.findings || !t.eval.fixes)) ||
    !t.quote.lines.length ||
    t.quote.lines.some((l) => !l.desc || l.qty <= 0 || l.price < 0)
  )
    return toast(
      "Faltan especificaciones técnicas o ítems de cotización válidos.",
    );
  if (LexDomain.quoteError(t.quote))
    return toast(LexDomain.quoteError(t.quote));
  if (calc(t).gross <= 0)
    return toast("La cotización debe tener importe positivo.");
  t.quote.sentAt = new Date().toISOString();
  t.status = "aprobacion";
  t.quote.number = t.quote.number || "COT-" + String(t.id).padStart(3, "0");
  event(
    t,
    (technical ? "Evaluación registrada y " : "") +
      "Cotización lista para aprobación.",
  );
  save();
  toast("Cotización preparada. Espera la aceptación del cliente.");
  tab = "resumen";
  renderTicketModal();
}
function startWork() {
  let t = ticket(modal);
  if (t.status !== "inicio") return;
  let resp = document.getElementById("responsible").value.trim();
  if (!resp) return toast("Ingresa el responsable del trabajo.");
  t.work.responsible = resp;
  t.work.start = now();
  t.status = "taller";
  event(t, "Orden de trabajo iniciada. Responsable: " + resp);
  save();
  tab = "taller";
  renderTicketModal();
}
function qcChange(checked) {
  if (ticket(modal).status === "taller") {
    ticket(modal).work.qc = checked;
    save();
  }
}
function finishWork() {
  let t = ticket(modal);
  if (t.status !== "taller") return;
  if (!t.work.qc) return toast("Primero confirma el control de calidad.");
  t.status = "entrega";
  t.work.finished = now();
  event(
    t,
    "Reparación terminada y control de calidad aprobado. Pendiente de entrega.",
  );
  save();
  tab = "resumen";
  renderTicketModal();
}
function deliver() {
  let t = ticket(modal);
  if (t.status !== "entrega") return;
  t.status = "documento";
  t.work.delivered = now();
  event(
    t,
    "Entrega / conformidad registrada. Pendiente de comprobante y cobro.",
  );
  save();
  tab = "cobro";
  renderTicketModal();
}
function prepareEmail() {
  let t = ticket(modal),
    c = client(t.clientId);
  if (!c.email)
    return toast("El cliente no tiene correo registrado en su ficha.");
  let subject =
      "Cotización " + (t.quote.number || cid(t.id)) + " · Lexsan Radiadores",
    text =
      "Estimados señores de " +
      c.name +
      ":\n\nAdjuntamos nuestra cotización para el equipo " +
      t.equipment +
      ".\n\nQuedamos atentos a su aprobación.\n\nAtentamente,\nÁrea Administrativa\nLEXSAN RADIADORES S.A.C.\n\nIMPORTANTE: adjuntar manualmente el PDF. Seleccionar la cuenta administrativa antes de enviar.";
  window.location.href =
    "mailto:" +
    encodeURIComponent(c.email) +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(text);
}
function resetDemo() {
  if (
    !confirm(
      "¿Restablecer los registros locales? Esta acción eliminará los cambios de esta sesión.",
    )
  )
    return;
  db = fresh();
  search = "";
  filter = "todos";
  save();
  go("inicio");
  toast("Registros restablecidos");
}
// Adaptación de la versión de demostración anterior: mantener ediciones existentes.
if (!db.pdfDemo2026) {
  let sample = db.tickets.find((t) => t.id === 89);
  if (
    sample &&
    sample.status === "evaluacion" &&
    sample.quote.lines.length === 0
  ) {
    sample.quote.lines = [
      {
        desc: "Evaluación, mantenimiento y reparación de radiador H2O",
        qty: 1,
        price: 250,
      },
      { desc: "Evaluación y mantenimiento de intercooler", qty: 1, price: 100 },
    ];
  }
  db.pdfDemo2026 = true;
}

/* Generador PDF independiente y offline para el prototipo de LEXSAN.
   Genera PDF binario descargable sin usar window.print(), servicios web ni bibliotecas externas. */
