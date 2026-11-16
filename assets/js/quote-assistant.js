/* The catalogue and client history load from Firestore after sign-in.
   No customer, historical price or bank account is embedded in this file. */
const quoteCostGroups = ["Materiales", "Equipos utilizados", "Mano de obra", "Suministros"];
function quoteClientProfile(t) {
  return db.quoteLibrary?.profiles?.[t.clientId] || {};
}
function quoteSeriesMinimum(t, includeOverride = true) {
  const year = Number(iso().slice(0, 4)), profile = quoteClientProfile(t);
  const historical = Number(profile.series?.last || 0);
  const current = db.tickets.filter(x => x.clientId === t.clientId).map(x => {
    const match = /^(\d+)-(\d{2})$/.exec(x.quote?.number || "");
    return match ? Number(match[1]) : 0;
  });
  return Math.max(1, historical + 1, ...current.map(n => n + 1), includeOverride ? Number(t.quote.nextNumber || 1) : 1);
}
ensureQuoteNumber = async function(t) {
  if (t.quote.number) return t.quote.number;
  if (!db.clients.some(c => c.id === t.clientId)) throw Error("Selecciona el cliente.");
  if (!quoteReservations.has(t)) {
    const clientId = t.clientId, year = Number(iso().slice(0, 4)), minimum = quoteSeriesMinimum(t);
    quoteReservations.set(t, (async () => {
      const number = LexStore.mode === "firebase"
        ? await LexStore.adapter.reserveClientQuoteNumber(clientId, year, minimum) : minimum;
      if (clientId !== t.clientId) throw Error("Cambió el cliente; vuelve a descargar.");
      t.quote.number = String(number) + "-" + String(year).slice(-2);
      t.quote.numberClientId = clientId;
      return t.quote.number;
    })().finally(() => quoteReservations.delete(t)));
  }
  return quoteReservations.get(t);
};
function prepareQuoteDefaults(t) {
  if (t.status !== "evaluacion") return;
  if (t.quote.bankAccounts === undefined && !t.quote.seller?.bank)
    t.quote.bankAccounts = structuredClone(db.quoteLibrary?.bankAccounts || []);
  const profile = quoteClientProfile(t);
  if (!t.quote.format && profile.format) t.quote.format = profile.format;
  if (!t.quote.presentation && profile.presentation) t.quote.presentation = profile.presentation;
}
const originalQuotePaperHeader = quotePaperHeader;
quotePaperHeader = function(t, editable) {
  prepareQuoteDefaults(t);
  const choices = (db.quoteLibrary?.templates || []).filter(x => x.id !== "supermix");
  const profile = quoteClientProfile(t);
  return originalQuotePaperHeader(t, editable) + (editable ? `<div class="quote-assistant">
    <label>¿Qué servicio vas a cotizar?<select id="service-template"><option value="">Seleccionar una plantilla…</option>${choices.map(x => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join("")}</select></label>
    <button class="button outline" onclick="applyServiceTemplate()">Usar plantilla</button>
    ${!choices.length ? '<p class="small">Las plantillas privadas estarán disponibles al cargar el catálogo de la empresa.</p>' : '<p class="small">Completa el alcance y revisa el precio. Puedes añadir varios servicios sin volver a escribirlos.</p>'}
    <details class="quote-extra"><summary>Formato y numeración</summary>
    <div class="fields2"><label>Formato<select onchange="changeQuoteOption('format',this.value)"><option value="standard" ${t.quote.format !== "detailed" ? "selected" : ""}>Cotización sencilla</option><option value="detailed" ${t.quote.format === "detailed" ? "selected" : ""}>Presupuesto detallado por costos</option></select></label>
    <label>Presentación del PDF<select onchange="changeQuoteOption('presentation',this.value)"><option value="total" ${t.quote.presentation !== "base" ? "selected" : ""}>Base + IGV + total</option><option value="base" ${t.quote.presentation === "base" ? "selected" : ""}>Base sin IGV · indicar que se agrega</option></select></label></div>
    ${t.quote.number ? `<p>Número asignado: <b>${esc(t.quote.number)}</b>. Se conserva al volver a descargar.</p>` : `<label>Siguiente número para este cliente<input id="quote-next-number" type="number" min="${quoteSeriesMinimum(t, false)}" max="999999" step="1" value="${quoteSeriesMinimum(t)}" onchange="setNextQuoteNumber(this)"></label><p class="small">Se reserva al descargar: número-año. El contador es independiente por cliente; dos personas no recibirán el mismo número para ese cliente.</p>`}
    ${profile.series ? `<p class="small">Último antecedente documentado: ${esc(profile.series.last)}-${String(profile.series.year).slice(-2)}. Revisa si hubo cotizaciones posteriores fuera del sistema.</p>` : ""}
    </details></div>` : "");
};
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
  const template = db.quoteLibrary?.templates?.find(x => x.id === document.getElementById("service-template")?.value);
  if (!t || t.status !== "evaluacion" || !template) return toast("Selecciona un servicio.");
  if ((t.quote.templateIds || []).includes(template.id)) return toast("Esta plantilla ya se añadió; puedes editar el alcance.");
  draftInput();
  const title = template.label;
  const body = template.body;
  t.quote.annex ||= {};
  t.quote.annex.title ||= title;
  t.quote.annex.body = [t.quote.annex.body, (t.quote.annex.body ? title + "\n" : "") + body].filter(Boolean).join("\n\n");
  // Diagnostic observations from old equipment are never copied.
  const notes = template.notes.split("\n").filter(s => !s.includes("[")).join("\n");
  if (notes) t.quote.annex.notes = [t.quote.annex.notes, notes].filter(Boolean).join("\n");
  t.quote.templateIds = [...(t.quote.templateIds || []), template.id];
  if (!t.equipment.trim()) t.equipment = title;
  const empty = t.quote.lines.find(l => !l.desc.trim() && !Number(l.price));
  if (empty) empty.desc = title;
  else t.quote.lines.push({desc: title, qty: 1, price: 0});
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
    t.quote.format = db.quoteLibrary?.profiles?.[id]?.format || "standard";
    t.quote.presentation = db.quoteLibrary?.profiles?.[id]?.presentation || "total";
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
    output = output.replace('</div><aside id="quote-summary"', `<label>Gastos generales y utilidad (%)<input type="number" min="0" max="100" step=".01" value="${t.quote.overheadPercent || 0}" ${t.status === "evaluacion" ? "" : "disabled"} oninput="setQuoteOverhead(this)"></label></div><aside id="quote-summary"`);
  }
  return output.replace('<p class="quote-footnote">', quoteBankEditor(t, t.status === "evaluacion") + '<p class="quote-footnote">');
};
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
  return `<details class="quote-extra quote-bank" ${!accounts.length && !t.quote.seller?.bank ? "open" : ""}><summary>Cuentas bancarias · al final del PDF</summary>
    ${!accounts.length ? '<p class="small">Aún no hay cuentas confirmadas. Añade los datos vigentes para indicar dónde abonar.</p>' : ""}
    ${accounts.map((a,i)=>`<div class="quote-bank-row"><div class="fields2">${bankKeys.map(([key,label])=>`<label>${label}<input maxlength="${key === "holder" ? 120 : 60}" value="${esc(a[key] || "")}" ${disabled} oninput="setQuoteBank(${i},'${key}',this.value)"></label>`).join("")}</div>${editable ? `<button class="button ghost sm" onclick="removeQuoteBank(${i})">Quitar cuenta</button>` : ""}</div>`).join("")}
    ${editable ? '<button class="button outline sm" onclick="addQuoteBank()">Añadir cuenta</button> <button class="button ghost sm" onclick="saveDefaultBanks()">Guardar cuentas para próximas cotizaciones</button>' : ""}
    <p id="bank-message" class="small" role="status"></p></details>`;
}
function addQuoteBank() {
  const t = ticket(modal); if (t?.status !== "evaluacion") return;
  t.quote.bankAccounts ||= []; if (t.quote.bankAccounts.length >= 5) return toast("Máximo cinco cuentas.");
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
  try {
    if(LexStore.mode==="firebase") await LexStore.adapter.saveBankAccounts(accounts);
    db.quoteLibrary ||= {};db.quoteLibrary.bankAccounts=structuredClone(accounts);
    save();document.getElementById("bank-message").textContent="Cuentas guardadas para las próximas cotizaciones. Las anteriores conservan sus datos.";
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
