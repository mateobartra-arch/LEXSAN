/* The catalogue and client history load from Firestore after sign-in.
   No customer, historical price or bank account is embedded in this file. */
const quoteCostGroups = ["Materiales", "Equipos utilizados", "Mano de obra", "Suministros"];
function quoteClientProfile(t) {
  return db.quoteLibrary?.profiles?.[t.clientId] || {};
}
/* Emisores: LEXSAN cotiza bajo más de una razón social. Cada emisor tiene su
   propia serie correlativa, compartida por todos sus clientes y sin reinicio
   anual. Los emisores adicionales y sus últimos números llegan del catálogo
   privado; aquí solo queda el emisor público por defecto. */
const defaultQuoteIssuers = [{ id: "sac", name: "LEXSAN RADIADORES S.A.C.", ruc: "20614867443" }];
function quoteIssuers() {
  const list = (db.quoteLibrary?.issuers || []).filter(x => /^[a-z0-9]{2,20}$/.test(x?.id || "") && x.name);
  return list.length ? list : defaultQuoteIssuers;
}
function quoteIssuer(t) {
  const list = quoteIssuers();
  const id = t.quote.issuerId || quoteClientProfile(t).issuer;
  return list.find(x => x.id === id) || list[0];
}
/* Datos del emisor que se imprimen: se congelan al asignar el número. */
function quoteIssuerPrint(t) {
  if (t.quote.number && t.quote.issuerName) return { name: t.quote.issuerName, ruc: t.quote.issuerRuc || "" };
  const issuer = quoteIssuer(t);
  return { name: issuer.name, ruc: issuer.ruc || "" };
}
function quoteSeriesMinimum(t, includeOverride = true) {
  const issuer = quoteIssuer(t);
  const used = db.tickets.filter(x => x !== t && x.quote?.number && quoteIssuer(x).id === issuer.id).map(x => {
    const match = /^(\d+)-(\d{2})$/.exec(x.quote.number);
    return match ? Number(match[1]) : 0;
  });
  return Math.max(1, Number(issuer.lastNumber || 0) + 1, ...used.map(n => n + 1), includeOverride ? Number(t.quote.nextNumber || 1) : 1);
}
ensureQuoteNumber = async function(t) {
  if (t.quote.number) return t.quote.number;
  if (!db.clients.some(c => c.id === t.clientId)) throw Error("Selecciona el cliente.");
  if (!quoteReservations.has(t)) {
    const clientId = t.clientId, issuer = quoteIssuer(t), year = Number(iso().slice(0, 4)), minimum = quoteSeriesMinimum(t);
    quoteReservations.set(t, (async () => {
      const number = LexStore.mode === "firebase"
        ? await LexStore.adapter.reserveIssuerQuoteNumber(issuer.id, minimum) : minimum;
      if (clientId !== t.clientId || quoteIssuer(t).id !== issuer.id) throw Error("Cambió el cliente o el emisor; vuelve a descargar.");
      t.quote.number = String(number) + "-" + String(year).slice(-2);
      t.quote.numberClientId = clientId;
      t.quote.issuerId = issuer.id;
      t.quote.issuerName = issuer.name;
      t.quote.issuerRuc = issuer.ruc || "";
      return t.quote.number;
    })().finally(() => quoteReservations.delete(t)));
  }
  return quoteReservations.get(t);
};
/* Lo que el perfil del cliente fija por defecto. El usuario puede cambiarlo después. */
function applyClientProfile(t, profile) {
  t.quote.format = profile.format || "standard";
  t.quote.presentation = profile.presentation || "total";
  if (profile.issuer) t.quote.issuerId = profile.issuer; else delete t.quote.issuerId;
  if (Number.isFinite(profile.overheadPercent)) t.quote.overheadPercent = profile.overheadPercent;
  else if (t.quote.format !== "detailed") delete t.quote.overheadPercent;
  // El cliente aún no está asignado al expediente: el emisor sale del perfil recibido.
  const issuers = quoteIssuers(), issuer = issuers.find(x => x.id === profile.issuer) || issuers[0];
  const accounts = defaultBankAccounts(issuer.id);
  if (accounts.length && !t.quote.seller?.bank) t.quote.bankAccounts = accounts;
}
/* Cuentas bancarias: el catálogo guarda todas las opciones; cada cotización
   imprime solo las marcadas. Vienen marcadas las que tienen `preselect`; si
   ninguna lo tiene, las del emisor; si tampoco, todas. */
const bankLimit = 8;
function libraryBankAccounts() {
  return (db.quoteLibrary?.bankAccounts || []).filter(a => a?.account && a?.bank);
}
function bankKey(a) {
  return String(a.bank || "").trim().toUpperCase() + "|" + String(a.account || "").replace(/\D/g, "");
}
function bankSnapshot(a) {
  return { holder: a.holder || "", bank: a.bank || "", currency: a.currency || "Soles", account: a.account || "", cci: a.cci || "" };
}
function defaultBankAccounts(issuerId) {
  const all = libraryBankAccounts();
  const preset = all.filter(a => a.preselect);
  const own = all.filter(a => a.issuer === issuerId);
  return (preset.length ? preset : own.length ? own : all).map(bankSnapshot);
}
function toggleQuoteBank(index, on) {
  const t = ticket(modal); if (t?.status !== "evaluacion") return;
  const library = libraryBankAccounts(), chosen = library[index]; if (!chosen) return;
  const current = t.quote.bankAccounts || [], keys = new Set(current.map(bankKey));
  if (on) keys.add(bankKey(chosen)); else keys.delete(bankKey(chosen));
  if (keys.size > bankLimit) return toast("Máximo " + bankLimit + " cuentas por cotización.");
  const manual = current.filter(a => !library.some(b => bankKey(b) === bankKey(a)) && keys.has(bankKey(a)));
  t.quote.bankAccounts = [...library.filter(b => keys.has(bankKey(b))).map(bankSnapshot), ...manual];
  save(); renderTicketModal();
}
function prepareQuoteDefaults(t) {
  if (t.status !== "evaluacion") return;
  if (t.quote.bankAccounts === undefined && !t.quote.seller?.bank)
    t.quote.bankAccounts = defaultBankAccounts(quoteIssuer(t).id);
  const profile = quoteClientProfile(t);
  if (!t.quote.format && profile.format) t.quote.format = profile.format;
  if (!t.quote.presentation && profile.presentation) t.quote.presentation = profile.presentation;
  if (t.quote.format === "detailed" && t.quote.overheadPercent === undefined && Number.isFinite(profile.overheadPercent))
    t.quote.overheadPercent = profile.overheadPercent;
}
function quoteTemplateChoices() {
  const own = (db.quoteLibrary?.templates || []).filter(x => x.id !== "supermix");
  return { own, builtin: LexQuoteTemplates.templates };
}
function quoteProfileSummary(t) {
  const profile = quoteClientProfile(t), issuers = quoteIssuers(), parts = [];
  if (!t.clientId) return "";
  if (issuers.length > 1) parts.push("Emisor: " + quoteIssuer(t).name);
  parts.push(t.quote.format === "detailed" ? "Presupuesto detallado por costos" : "Cotización sencilla");
  parts.push(t.quote.presentation === "base" ? "Total sin IGV" : "Total con IGV");
  if (t.quote.conditions?.payment) parts.push("Pago: " + t.quote.conditions.payment);
  return `<p class="quote-profile" role="status"><b>${Object.keys(profile).length ? "Formato de este cliente" : "Formato general"}:</b> ${parts.map(esc).join(" · ")}</p>`;
}
const originalQuotePaperHeader = quotePaperHeader;
quotePaperHeader = function(t, editable) {
  prepareQuoteDefaults(t);
  const { own, builtin } = quoteTemplateChoices();
  const option = x => `<option value="${esc(x.id)}">${esc(x.label)}</option>`;
  const issuers = quoteIssuers(), issuer = quoteIssuer(t), printed = quoteIssuerPrint(t);
  const header = originalQuotePaperHeader(t, editable).replace("<b>LEXSAN RADIADORES S.A.C.</b>", `<b>${esc(printed.name)}</b>`);
  return header + (editable ? `<div class="quote-assistant">
    ${quoteProfileSummary(t)}
    <label>¿Qué servicio vas a cotizar?<select id="service-template"><option value="">Seleccionar una plantilla…</option>${own.length ? `<optgroup label="Catálogo de la empresa">${own.map(option).join("")}</optgroup><optgroup label="Plantillas LEXSAN">${builtin.map(option).join("")}</optgroup>` : builtin.map(option).join("")}</select></label>
    <button class="button outline" onclick="applyServiceTemplate()">Usar plantilla</button>
    <p class="small">La plantilla completa los ítems, el alcance y la prueba de presión. Solo falta el precio. Puedes usar varias en la misma cotización.</p>
    <details class="quote-extra"><summary>Ítems y notas frecuentes</summary>
    <p class="small">Un toque añade el ítem a la tabla.</p>
    <div class="quote-chips">${LexQuoteTemplates.items.map((x, i) => `<button class="button ghost sm" onclick="addFrequentItem(${i})">＋ ${esc(x)}</button>`).join("")}</div>
    <p class="small">Un toque añade la nota al anexo. Elige solo lo que se observó en este equipo.</p>
    <div class="quote-chips">${LexQuoteTemplates.notes.map((x, i) => `<button class="button ghost sm" onclick="addFrequentNote(${i})">＋ ${esc(x)}</button>`).join("")}</div>
    </details>
    <details class="quote-extra"><summary>Formato y numeración</summary>
    ${issuers.length > 1 ? `<label>Emisor<select id="quote-issuer" ${t.quote.number ? "disabled" : ""} onchange="changeQuoteIssuer(this.value)">${issuers.map(x => `<option value="${esc(x.id)}" ${x.id === issuer.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>` : ""}
    <div class="fields2"><label>Formato<select onchange="changeQuoteOption('format',this.value)"><option value="standard" ${t.quote.format !== "detailed" ? "selected" : ""}>Cotización sencilla</option><option value="detailed" ${t.quote.format === "detailed" ? "selected" : ""}>Presupuesto detallado por costos</option></select></label>
    <label>Presentación del PDF<select onchange="changeQuoteOption('presentation',this.value)"><option value="total" ${t.quote.presentation !== "base" ? "selected" : ""}>Base + IGV + total</option><option value="base" ${t.quote.presentation === "base" ? "selected" : ""}>Base sin IGV · indicar que se agrega</option></select></label></div>
    ${t.quote.number ? `<p>Número asignado: <b>${esc(t.quote.number)}</b>. Se conserva al volver a descargar.</p>` : `<label>Siguiente número de la serie<input id="quote-next-number" type="number" min="${quoteSeriesMinimum(t, false)}" max="999999" step="1" value="${quoteSeriesMinimum(t)}" onchange="setNextQuoteNumber(this)"></label><p class="small">Se reserva al descargar: número-año. La serie es una sola por emisor${issuers.length > 1 ? " (" + esc(issuer.name) + ")" : ""} y la comparten todos sus clientes; no se reinicia cada año. Si se emitieron cotizaciones fuera del portal, corrige aquí el número.</p>`}
    </details></div>` : "");
};
function changeQuoteIssuer(id) {
  const t = ticket(modal); if (!t || t.status !== "evaluacion" || t.quote.number) return;
  if (!quoteIssuers().some(x => x.id === id)) return;
  t.quote.issuerId = id; delete t.quote.nextNumber;
  if (!libraryBankAccounts().some(a => a.preselect)) {
    const accounts = defaultBankAccounts(id);
    if (accounts.length) t.quote.bankAccounts = accounts;
  }
  save(); renderTicketModal();
}
function addFrequentItem(index) {
  const t = ticket(modal), desc = LexQuoteTemplates.items[index];
  if (!t || t.status !== "evaluacion" || !desc) return;
  draftInput();
  const empty = t.quote.lines.find(l => !l.desc.trim() && !Number(l.price));
  if (empty) empty.desc = desc; else t.quote.lines.push({desc, qty: 1, price: 0});
  save(); renderTicketModal(); toast("Ítem añadido. Completa cantidad y precio.");
}
function addFrequentNote(index) {
  const t = ticket(modal), note = LexQuoteTemplates.notes[index];
  if (!t || t.status !== "evaluacion" || !note) return;
  draftInput();
  t.quote.annex ||= {};
  const current = (t.quote.annex.notes || "").split("\n").map(s => s.trim()).filter(Boolean);
  if (current.includes(note)) return toast("Esa nota ya está en el anexo.");
  t.quote.annex.notes = [...current, note].join("\n");
  save(); renderTicketModal(); toast("Nota añadida al anexo.");
}
function setNextQuoteNumber(field) {
  if (!field.checkValidity()) return;
  const t = ticket(modal); if (!t || t.quote.number) return;
  t.quote.nextNumber = Number(field.value); save();
}
function changeQuoteOption(key, value) {
  const t = ticket(modal); if (!t || t.status !== "evaluacion") return;
  if (!["format", "presentation"].includes(key)) return;
  t.quote[key] = value; save(); renderTicketModal();
}
function applyServiceTemplate() {
  const t = ticket(modal);
  const { own, builtin } = quoteTemplateChoices();
  const template = [...own, ...builtin].find(x => x.id === document.getElementById("service-template")?.value);
  if (!t || t.status !== "evaluacion" || !template) return toast("Selecciona un servicio.");
  if ((t.quote.templateIds || []).includes(template.id)) return toast("Esta plantilla ya se añadió; puedes editar el alcance.");
  draftInput();
  const title = template.label;
  const body = template.body || "";
  t.quote.annex ||= {};
  t.quote.annex.title ||= title;
  if (body) t.quote.annex.body = [t.quote.annex.body, (t.quote.annex.body ? title + "\n" : "") + body].filter(Boolean).join("\n\n");
  // Diagnostic observations from old equipment are never copied.
  const existing = (t.quote.annex.notes || "").split("\n").map(s => s.trim()).filter(Boolean);
  const notes = (template.notes || "").split("\n").map(s => s.trim()).filter(s => s && !s.includes("[") && !existing.includes(s));
  if (notes.length) t.quote.annex.notes = [...existing, ...notes].join("\n");
  t.quote.templateIds = [...(t.quote.templateIds || []), template.id];
  if (!t.equipment.trim()) t.equipment = title;
  // En presupuestos por costos las líneas son insumos, no servicios: no se añaden.
  const descriptions = t.quote.format === "detailed" ? [] : template.lines?.length ? template.lines : [title];
  for (const desc of descriptions) {
    if (t.quote.lines.some(l => l.desc.trim() === desc)) continue;
    const empty = t.quote.lines.find(l => !l.desc.trim() && !Number(l.price));
    if (empty) empty.desc = desc;
    else t.quote.lines.push({desc, qty: 1, price: 0});
  }
  if (template.warranty && t.quote.conditions) t.quote.conditions.warranty = template.warranty;
  if (template.sale && !(t.quote.terms || "").includes("NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES."))
    t.quote.terms = [t.quote.terms, "NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES."].filter(Boolean).join("\n");
  save(); renderTicketModal(); toast("Alcance preparado. Revisa detalles y precio.");
}
const selectQuoteCompanyOriginal = selectQuoteCompany;
selectQuoteCompany = function(id) {
  const t = ticket(modal);
  if (t?.quote.number && t.clientId !== id) {
    toast("Esta cotización ya tiene número. Crea otra para cambiar de cliente."); renderTicketModal(); return;
  }
  if (t && t.clientId !== id) {
    delete t.quote.nextNumber;
    applyClientProfile(t, db.quoteLibrary?.profiles?.[id] || {});
  }
  selectQuoteCompanyOriginal(id);
};
const renderQuoteEditorOriginal = renderQuoteEditor;
renderQuoteEditor = function(t) {
  let output = renderQuoteEditorOriginal(t);
  if (t.quote.format === "detailed") {
    t.quote.lines.forEach((l, i) => {
      const disabled = t.status === "evaluacion" ? "" : "disabled";
      output = output.replace(`<div class="quote-suggestions" id="quote-suggestions-${i}">`, `<div class="fields2"><label>Grupo<select ${disabled} onchange="setCostField(${i},'costGroup',this.value)">${quoteCostGroups.map(g=>`<option ${(l.costGroup || "Materiales") === g ? "selected" : ""}>${g}</option>`).join("")}</select></label><label>Unidad<input maxlength="20" value="${esc(l.unit || "und")}" ${disabled} oninput="setCostField(${i},'unit',this.value)" placeholder="und, hora, galón…"></label></div><div class="quote-suggestions" id="quote-suggestions-${i}">`);
    });
    if (t.status === "evaluacion") output = output.replace('<button class="button outline" onclick="addLine()"', `<label class="quote-cost-picker">Añadir concepto de costo<select onchange="addCostConcept(this.value);this.value=''"><option value="">Seleccionar material, equipo o mano de obra…</option>${quoteCostGroups.map(g => { const rows = quoteCostCatalog().map((c, i) => [c, i]).filter(([c]) => c.group === g); return rows.length ? `<optgroup label="${esc(g)}">${rows.map(([c, i]) => `<option value="${i}">${esc(c.desc)} · ${esc(c.unit)}${Number(c.price) ? " · " + fmt(c.price) : ""}</option>`).join("")}</optgroup>` : ""; }).join("")}</select></label><button class="button outline" onclick="addLine()"`);
    output = output.replace('</div><aside id="quote-summary"', `<label>Gastos generales y utilidad (%)<input type="number" min="0" max="100" step=".01" value="${t.quote.overheadPercent || 0}" ${t.status === "evaluacion" ? "" : "disabled"} oninput="setQuoteOverhead(this)"></label></div><aside id="quote-summary"`);
  }
  return output.replace('<p class="quote-footnote">', quoteBankEditor(t, t.status === "evaluacion") + '<p class="quote-footnote">');
};
/* Conceptos del presupuesto por costos. Las tarifas vienen del catálogo privado;
   sin él, se ofrecen los nombres habituales con precio en cero. */
function quoteCostCatalog() {
  const own = (db.quoteLibrary?.costCatalog || []).filter(c => c?.desc && quoteCostGroups.includes(c.group));
  return own.length ? own : LexQuoteTemplates.costs;
}
function addCostConcept(value) {
  const t = ticket(modal), concept = quoteCostCatalog()[Number(value)];
  if (!t || t.status !== "evaluacion" || value === "" || !concept) return;
  draftInput();
  const line = {desc: concept.desc, qty: 1, price: Number(concept.price) || 0, costGroup: concept.group, unit: concept.unit || "und"};
  const empty = t.quote.lines.findIndex(l => !l.desc.trim() && !Number(l.price));
  if (empty >= 0) t.quote.lines[empty] = line; else t.quote.lines.push(line);
  save(); renderTicketModal();
}
function setCostField(index, key, value) {
  const t = ticket(modal); if (t?.status !== "evaluacion" || !["costGroup", "unit"].includes(key)) return;
  t.quote.lines[index][key] = value; save();
}
function setQuoteOverhead(field) {
  if (!field.checkValidity()) return showQuoteError("Revisa el porcentaje de gastos generales y utilidad.");
  const t = ticket(modal); if (t?.status !== "evaluacion") return;
  t.quote.overheadPercent = Number(field.value); save(); refreshQuoteSummary();
}
quotationSummary = function(t) {
  const v = calc(t);
  return `<div class="totalrow"><span>Subtotal sin IGV</span><b>${fmt(v.sum)}</b></div>
    ${v.overhead ? `<div class="totalrow"><span>Gastos generales y utilidad (${t.quote.overheadPercent} %)</span><b>${fmt(v.overhead)}</b></div>` : ""}
    ${v.discount ? `<div class="totalrow"><span>Descuento sin IGV</span><b>− ${fmt(v.discount)}</b></div>` : ""}
    ${v.adjust ? `<div class="totalrow"><span>Ajuste histórico sin IGV</span><b>${fmt(v.adjust)}</b></div>` : ""}
    <div class="totalrow"><span>Base imponible sin IGV</span><b>${fmt(v.base)}</b></div>
    <div class="totalrow"><span>IGV · 18 %</span><b>${fmt(v.igv)}</b></div>
    <div class="totalrow quote-final"><span>Total con IGV</span><b>${fmt(v.gross)}</b></div>
    ${t.quote.presentation === "base" ? '<p class="small">El PDF mostrará la base sin IGV. El impuesto y el total se conservan aquí para el control de cobro.</p>' : ""}`;
};
const bankKeys = [["holder","Titular"],["bank","Banco"],["currency","Moneda"],["account","Número de cuenta"],["cci","CCI"]];
function quoteBankEditor(t, editable) {
  const accounts = t.quote.bankAccounts || [], disabled = editable ? "" : "disabled";
  const library = libraryBankAccounts(), selected = new Set(accounts.map(bankKey));
  return `<details class="quote-extra quote-bank" open><summary>Cuentas bancarias · al final del PDF (${accounts.length} marcada${accounts.length === 1 ? "" : "s"})</summary>
    ${library.length ? `<p class="small">Marca las cuentas que saldrán en esta cotización.</p><div class="quote-bank-options">${library.map((a, i) => `<label class="quote-bank-option"><input type="checkbox" ${selected.has(bankKey(a)) ? "checked" : ""} ${disabled} onchange="toggleQuoteBank(${i},this.checked)"><span><b>${esc(a.bank)}</b> · ${esc(a.holder)}<br><small>${esc(a.account)}${a.cci ? " · CCI " + esc(a.cci) : ""}</small></span></label>`).join("")}</div>` : ""}
    ${!accounts.length ? '<p class="small">Ninguna cuenta marcada: el PDF no indicará dónde abonar.</p>' : ""}
    <details class="quote-extra"><summary>Editar datos o añadir una cuenta manual</summary>
    ${accounts.map((a,i)=>`<div class="quote-bank-row"><div class="fields2">${bankKeys.map(([key,label])=>`<label>${label}<input maxlength="${key === "holder" ? 120 : 60}" value="${esc(a[key] || "")}" ${disabled} oninput="setQuoteBank(${i},'${key}',this.value)"></label>`).join("")}</div>${editable ? `<button class="button ghost sm" onclick="removeQuoteBank(${i})">Quitar cuenta</button>` : ""}</div>`).join("")}
    ${editable ? '<button class="button outline sm" onclick="addQuoteBank()">Añadir cuenta</button> <button class="button ghost sm" onclick="saveDefaultBanks()">Guardar como selección por defecto</button>' : ""}
    </details>
    <p id="bank-message" class="small" role="status"></p></details>`;
}
function addQuoteBank() {
  const t = ticket(modal); if (t?.status !== "evaluacion") return;
  t.quote.bankAccounts ||= []; if (t.quote.bankAccounts.length >= bankLimit) return toast("Máximo " + bankLimit + " cuentas por cotización.");
  t.quote.bankAccounts.push({holder:"",bank:"",currency:"Soles",account:"",cci:""});save();renderTicketModal();
}
function setQuoteBank(index,key,value) {
  const t=ticket(modal);if(t?.status!=="evaluacion"||!bankKeys.some(([k])=>k===key))return;
  t.quote.bankAccounts[index][key]=value;save();
}
function removeQuoteBank(index) {const t=ticket(modal);if(t?.status!=="evaluacion")return;t.quote.bankAccounts.splice(index,1);save();renderTicketModal();}
async function saveDefaultBanks() {
  const t=ticket(modal);if(t?.status!=="evaluacion")return;
  const accounts=t.quote.bankAccounts || [];
  if(accounts.some(a=>!a.holder.trim()||!a.bank.trim()||!a.account.trim()||!a.currency.trim()))return toast("Completa titular, banco, moneda y número de cuenta.");
  // Nunca se borran opciones: las nuevas se añaden y la selección actual queda como predeterminada.
  const library=libraryBankAccounts(),chosen=new Set(accounts.map(bankKey));
  const merged=[...library.map(a=>({...bankSnapshot(a),...(a.issuer?{issuer:a.issuer}:{}),preselect:chosen.has(bankKey(a))})),
    ...accounts.filter(a=>!library.some(b=>bankKey(b)===bankKey(a))).map(a=>({...bankSnapshot(a),preselect:true}))];
  if(merged.length>bankLimit)return toast("El catálogo admite hasta "+bankLimit+" cuentas.");
  try {
    if(LexStore.mode==="firebase") await LexStore.adapter.saveBankAccounts(merged);
    db.quoteLibrary ||= {};db.quoteLibrary.bankAccounts=merged;
    save();document.getElementById("bank-message").textContent="Selección guardada para las próximas cotizaciones. Las anteriores conservan sus datos.";
  } catch(e){toast("No se guardaron las cuentas: "+e.message);}
}
const quoteFieldErrorOriginal=quoteFieldError;
quoteFieldError=function() {
  const previous=quoteFieldErrorOriginal();if(previous)return previous;
  const t=ticket(modal);if(!t)return "";
  if((t.quote.bankAccounts||[]).some(a=>!a.holder?.trim()||!a.bank?.trim()||!a.currency?.trim()||!a.account?.trim()))
    return "Completa los datos de la cuenta bancaria o quita la fila vacía.";
  if(!t.quote.number && (!Number.isInteger(quoteSeriesMinimum(t)) || quoteSeriesMinimum(t)>999999))
    return "Revisa el siguiente número de cotización.";
  return "";
};
