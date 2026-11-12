window.LexSession = { user: null, ready: LexStore.mode === "local" };
const commercialCommands = [
  "quickSale",
  "saveQuickSale",
  "invoicePicker",
  "newTicket",
  "newQuote",
  "createTicket",
  "addClient",
  "saveClient",
  "addLine",
  "removeLine",
  "updateLine",
  "updatePrice",
  "setPricingMode",
  "saveVehicle",
  "selectQuoteCompany",
  "updateTerms",
  "applyTechnicalPreset",
  "applySalePreset",
  "addStockLine",
  "sendQuote",
  "approveTicket",
  "saveApproval",
  "rejectTicket",
  "saveRejection",
  "saveAdvance",
  "saveDocument",
  "registerPayment",
  "deliver",
  "stockForm",
  "saveStock",
  "setLineCategory",
  "assignTechnician",
  "exportReport",
];
const technicalCommands = [
  "draftInput",
  "saveTechnicalDetails",
  "attachImage",
  "addPhoto",
  "startWork",
  "qcChange",
  "finishWork",
  "recordProgress",
];
function canCommand(name) {
  const u = LexSession.user;
  if (!u?.active || !LexSession.ready) return false;
  if (["saveUser", "userForm", "resetDemo"].includes(name))
    return LexStore.mode === "local" && u.role === "gerencia";
  if (u.role !== "tecnico") return true;
  if (!technicalCommands.includes(name)) return false;
  const t = ticket(modal);
  return t?.work.assignedUid === u.uid;
}
function refreshProfileSelector() {
  const select = document.getElementById("operator");
  select.innerHTML = (db.users || [])
    .filter((u) => u.active)
    .map(
      (u) =>
        `<option value="${esc(u.name)}" data-uid="${esc(u.uid)}" ${u.uid === LexSession.user?.uid ? "selected" : ""}>${esc(u.name)} · ${esc(u.role)}</option>`,
    )
    .join("");
  select.disabled = LexStore.mode !== "local";
  select.setAttribute(
    "aria-label",
    LexStore.mode === "local"
      ? "Perfil local de prueba"
      : "Usuario autenticado",
  );
  select.onchange = () => {
    LexSession.user = db.users.find(
      (u) => u.uid === select.selectedOptions[0].dataset.uid,
    );
    document.body.classList.toggle(
      "technical-mode",
      LexSession.user.role === "tecnico",
    );
    go("servicios");
  };
}
function guardCommands() {
  for (const name of [
    ...commercialCommands,
    ...technicalCommands,
    "saveUser",
    "userForm",
    "resetDemo",
  ]) {
    const action = window[name];
    if (typeof action !== "function") continue;
    window[name] = function (...args) {
      if (!canCommand(name))
        return toast("Tu perfil no tiene permiso para esta operación.");
      if (LexStore.failed)
        return toast(
          "Guardado bloqueado. Descarga un respaldo antes de recargar.",
        );
      if (
        name === "attachImage" &&
        LexSession.user.role === "tecnico" &&
        args[1] !== "evaluation"
      )
        return toast("Los comprobantes los registra administración.");
      return action.apply(this, args);
    };
  }
}
function setupNavigation() {
  for (const [id, label, icon] of [
    ["cotizaciones", "Cotizaciones", "file"],
    ["inventario", "Inventario", "package"],
    ["facturacion", "Facturación", "briefcase"],
    ["reportes", "Reportes", "chart"],
    ["usuarios", "Usuarios", "users"],
  ]) {
    let b = document.querySelector(`[data-route="${id}"]`);
    if (!b) {
      b = document.createElement("button");
      b.className = "nav";
      b.dataset.route = id;
      document
        .querySelector(".rail")
        .insertBefore(b, document.querySelector(".rail-bottom"));
    }
    b.innerHTML = uiIcon(icon) + label;
    b.title = label;
  }
  document.querySelectorAll(".nav").forEach((b) => {
    b.onclick = () => {
      if (
        LexSession.user?.role === "tecnico" &&
        !["inicio", "servicios"].includes(b.dataset.route)
      )
        return;
      go(b.dataset.route);
    };
  });
  document
    .querySelector(".topbar")
    .insertAdjacentHTML(
      "afterend",
      `<div class="save-strip"><span>${LexStore.mode === "local" ? "Copiloto local · sin sincronización entre dispositivos" : "Sesión compartida · Firebase"}</span><span id="save-state" role="status" aria-live="polite"></span></div>`,
    );
  document.getElementById("toast").setAttribute("role", "status");
  document.getElementById("toast").setAttribute("aria-live", "polite");
  document.querySelector(".system-tag").textContent =
    LexStore.mode === "local" ? "Pruebas locales" : "Sesión segura";
  document.querySelector(".rail-bottom").innerHTML =
    `<div class="rail-environment">${LexStore.mode === "local" ? "Datos de este navegador" : "Firebase"}</div><button class="button outline sm" onclick="LexStore.export()">Descargar respaldo</button>${LexStore.mode === "local" ? '<button class="button outline sm" onclick="resetDemo()">Restablecer demostración</button>' : '<button class="button outline sm" onclick="logout()">Cerrar sesión</button>'}`;
}
// Consistent separate pickers: no capture attribute on gallery input.
photoInputs = function (target) {
  return `<div class="fields2" style="margin-top:12px"><div class="camera-control"><label>Elegir de la galería / archivos</label><input aria-label="Elegir imagen de galería" type="file" accept="image/*" onchange="attachImage(this,'${target}')"></div><div class="camera-control"><label>Tomar foto con la cámara</label><input aria-label="Tomar foto con cámara" type="file" accept="image/*" capture="environment" onchange="attachImage(this,'${target}')"></div></div><p class="small muted" style="margin-top:8px">En el celular, permite el acceso a la cámara cuando el dispositivo lo solicite. En computadora puede abrirse el selector de archivos.</p>`;
};
const openExisting = openTicket;
openTicket = function (id, nextTab = "resumen") {
  if (LexSession.user?.role === "tecnico") {
    const t = ticket(id);
    if (t?.work.assignedUid !== LexSession.user.uid)
      return toast("Solo puedes abrir tus trabajos asignados.");
    if (["cobro", "docs", "resumen"].includes(nextTab))
      nextTab = t.status === "evaluacion" ? "evaluacion" : "taller";
  }
  openExisting(id, nextTab);
};
const bodyExisting = ticketBody;
ticketBody = function (t) {
  if (
    LexSession.user?.role === "tecnico" &&
    ["resumen", "cobro", "docs"].includes(tab)
  )
    return '<div class="hint">Accede a la evaluación o al taller para registrar tu trabajo.</div>';
  return bodyExisting(t);
};
const rowsExisting = rowTickets;
rowTickets = function (items) {
  if (LexSession.user?.role === "tecnico")
    items = items.filter((t) => t.work.assignedUid === LexSession.user.uid);
  return rowsExisting(items);
};
const printExisting = docPrint;
docPrint = function (kind) {
  if (LexSession.user?.role === "tecnico" && kind === "quote")
    return toast("La cotización económica la gestiona administración.");
  return printExisting(kind);
};
const resetExisting = resetDemo;
resetDemo = function () {
  const users = db.users;
  resetExisting();
  db.users = users;
  db.inventory ||= [];
  LexStore.committed = JSON.stringify(db);
  save();
  render();
};
function seedLocalProfiles() {
  db.users ||= [
    {
      uid: "local-gerencia",
      name: "Gerencia local",
      role: "gerencia",
      email: "",
      active: true,
    },
    {
      uid: "local-admin",
      name: "Administración local",
      role: "administracion",
      email: "",
      active: true,
    },
    {
      uid: "local-tech",
      name: "Técnico local",
      role: "tecnico",
      email: "",
      active: true,
    },
  ];
  LexSession.user =
    db.users.find((u) => u.active && u.role === "gerencia") ||
    db.users.find((u) => u.active);
  refreshProfileSelector();
}
async function startCloud() {
  const cfg = window.LEXSAN_CONFIG?.firebase;
  document.querySelector(".shell").hidden = true;
  const box = document.createElement("main");
  box.id = "login-root";
  box.className = "card auth-screen";
  document.body.prepend(box);
  if (!cfg?.projectId || !cfg?.apiKey) {
    box.innerHTML =
      '<div class="eyebrow">LEXSAN</div><h1>Conexión pendiente</h1><p>Esta versión está preparada para Firebase, pero aún no está configurada. Utiliza la versión local para las pruebas.</p>';
    return;
  }
  box.innerHTML =
    '<div class="eyebrow">LEXSAN</div><h1>Iniciar sesión</h1><form id="login-form"><div class="field"><label>Correo</label><input id="login-email" type="email" autocomplete="username" required></div><div class="field"><label>Contraseña</label><input id="login-password" type="password" autocomplete="current-password" required></div><button class="button">Ingresar</button><p id="login-message" role="alert" style="margin-top:12px"></p></form>';
  try {
    const { createFirebaseAdapter } = await import("./firebase-adapter.js");
    const adapter = await createFirebaseAdapter(cfg);
    LexStore.adapter = adapter;
    document.getElementById("login-form").onsubmit = async (e) => {
      e.preventDefault();
      const button = e.target.querySelector("button");
      button.disabled = true;
      try {
        const result = await adapter.login(
          document.getElementById("login-email").value,
          document.getElementById("login-password").value,
        );
        db = result.data;
        LexSession.user = result.user;
        LexSession.ready = true;
        LexStore.committed = JSON.stringify(db);
        box.remove();
        document.querySelector(".shell").hidden = false;
        refreshProfileSelector();
        render();
        LexStore.status("Datos cargados desde Firebase");
      } catch (error) {
        document.getElementById("login-message").textContent =
          "No se pudo iniciar sesión. Revisa tus credenciales y permisos.";
      } finally {
        button.disabled = false;
      }
    };
  } catch (e) {
    box.innerHTML =
      "<h1>Conexión no disponible</h1><p>No se pudo cargar Firebase. Usa la compilación y revisa la conexión.</p>";
  }
}
async function logout() {
  try {
    await LexStore.flush();
    await LexStore.adapter.logout();
    location.reload();
  } catch (e) {
    toast("No se cerró la sesión: hay cambios sin guardar.");
  }
}
setupNavigation();
guardCommands();
if (LexStore.mode === "local") {
  seedLocalProfiles();
  render();
  if (LexStore.loadError)
    LexStore.status(
      "No se pudo leer el respaldo local; no se sobrescribirá",
      true,
    );
  else save();
} else startCloud();
