/* Local PDF reading: no file upload and no business record until confirmation. */
let invoicePreview = null;
let invoiceReadSequence = 0;
function parseInvoiceText(text) {
  const s = text.replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const capture = (re) => s.match(re)?.[1]?.trim() || "";
  const amount = (label) => {
    const value = capture(new RegExp("(?:^|\\n)" + label + "\\s*:\\s*S/\\s*([\\d,]+\\.\\d+)"));
    return value ? Number(value.replace(/,/g, "")) : null;
  };
  const rucs = [...s.matchAll(/(?:^|\n)RUC\s*:\s*(\d{11})/g)].map(m => m[1]);
  const date = capture(/Fecha de Emisi[oó]n\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
  const table = s.split(/ICBPER\s*\n/)[1]?.split(/Valor de Venta de Operaciones Gratuitas|Sub Total Ventas|SON:/)[0] || "";
  const lines = [...table.matchAll(/(?:^|\n)([\d,]+\.\d+)\s*\n([^\n]+)\n([\s\S]+?)\n([\d,]+\.\d+)\s*\n([\d,]+\.\d+)(?=\s*\n|$)/g)].map(m => ({
    qty: Number(m[1].replace(/,/g, "")), unit: m[2].trim(),
    desc: m[3].trim().replace(/\n/g, " "), price: Number(m[4].replace(/,/g, "")), icbper: Number(m[5]),
  }));
  return {
    issuer: s.split(/FACTURA ELECTR[OÓ]NICA/)[0].split("\n").find(v => v.trim()) || "",
    issuerRuc: rucs[0] || "", buyerRuc: rucs[1] || "",
    buyer: capture(/Señor\(es\)\s*:\s*([\s\S]*?)\nRUC/).replace(/\n/g, " "),
    number: capture(/\b((?:E001|F[A-Z0-9]{3})-\d{1,8})\b/),
    date: date ? date.split("/").reverse().join("-") : "",
    currency: capture(/Tipo de Moneda\s*:\s*([^\n]+)/),
    payment: capture(/Forma de pago\s*:\s*([^\n]+)/),
    lines, base: amount("Valor Venta"), igv: amount("IGV"), total: amount("Importe Total"),
    adjustments: ["Anticipos", "Descuentos", "ISC", "ICBPER", "Otros Cargos", "Otros Tributos", "Monto de redondeo"].map(amount),
  };
}
function invoiceImportProblems(d) {
  const problems = [];
  if (d.issuerRuc !== "20614867443") problems.push("El emisor no es LEXSAN. Puedes revisar este ejemplo, pero no registrarlo como una venta de LEXSAN.");
  if (!d.number || !d.date || !d.buyer || !/^\d{11}$/.test(d.buyerRuc) || !d.lines.length || d.currency !== "SOLES") problems.push("Faltan datos o el formato requiere revisión manual.");
  if (d.adjustments.some(v => v === null || v !== 0) || d.lines.some(l => l.icbper !== 0)) problems.push("El comprobante tiene ajustes o tributos que requieren registro manual.");
  const v = LexDomain.quoteTotals({ lines: d.lines, discount: 0, pricingMode: "items" });
  if ([d.base, d.igv, d.total].some(v => v === null) || Math.abs(v.base-d.base) > .001 || Math.abs(v.igv-d.igv) > .001 || Math.abs(v.gross-d.total) > .001) problems.push("Los ítems no coinciden exactamente con los totales. Revisa el comprobante antes de registrarlo.");
  if (db.tickets.some(t => t.doc.number === d.number)) problems.push("Esta factura ya está registrada.");
  return problems;
}
async function readInvoicePDF(file) {
  if (!file) return;
  const sequence = ++invoiceReadSequence;
  invoicePreview = null;
  const status = document.getElementById("invoice-read-status");
  document.getElementById("invoice-read-result").innerHTML = "";
  if (file.size > 15 * 1024 * 1024) { status.textContent = "El PDF debe pesar menos de 15 MB."; return; }
  status.textContent = "Leyendo el PDF en este dispositivo…";
  let pdf, loading;
  try {
    const lib = await import("../vendor/pdfjs/pdf.mjs");
    lib.GlobalWorkerOptions.workerSrc = "assets/vendor/pdfjs/pdf.worker.mjs";
    loading = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
    pdf = await loading.promise;
    if (pdf.numPages !== 1) throw Error("Por ahora se reconoce este formato de una página. Registra los otros comprobantes manualmente.");
    const page = await pdf.getPage(1);
    const text = (await page.getTextContent()).items.map(i => i.str).filter(s => s?.trim()).join("\n");
    if (text.trim().length < 40) throw Error("Este PDF es una imagen escaneada. La lectura de fotos aún no está disponible.");
    if (modal !== "invoice-picker" || sequence !== invoiceReadSequence || !status.isConnected) return;
    invoicePreview = parseInvoiceText(text);
    const d = invoicePreview, problems = invoiceImportProblems(d);
    document.getElementById("invoice-read-result").innerHTML = `<div class="card"><h3>${esc(d.number || "Comprobante por revisar")}</h3><p>Emisor: ${esc(d.issuer)} · ${esc(d.issuerRuc)}</p><p><b>${esc(d.buyer)}</b><br>RUC: ${esc(d.buyerRuc)} · Fecha: ${esc(d.date)}</p>${d.lines.map(l => `<p>${esc(l.qty)} ${esc(l.unit)} · ${esc(l.desc)}<br>Precio unitario sin IGV: ${esc(l.price)}</p>`).join("")}<p>Base: ${d.base === null ? "Sin leer" : fmt(d.base)} · IGV: ${d.igv === null ? "Sin leer" : fmt(d.igv)}<br><b>Total: ${d.total === null ? "Sin leer" : fmt(d.total)}</b></p><p>Forma de pago del documento: ${esc(d.payment)}. Esto no confirma que se haya cobrado.</p>${problems.map(p => `<p role="alert">${esc(p)}</p>`).join("")}${!problems.length ? '<button class="button" onclick="prepareInvoiceSale()">Revisar venta y cobro</button>' : ""}</div>`;
    status.textContent = "Lectura terminada. No se guardó ningún registro ni el archivo PDF.";
  } catch (e) {
    if (modal === "invoice-picker" && sequence === invoiceReadSequence && status.isConnected) status.textContent = "No se pudo completar la lectura. " + e.message;
  } finally { await loading?.destroy(); }
}
function prepareInvoiceSale() {
  const d = invoicePreview;
  if (!d || invoiceImportProblems(d).length) return;
  quickDraft = d.lines.map(({desc, qty, price}) => ({desc, qty, price}));
  quickSale();
  const set = (key, v) => document.getElementById("quick-" + key).value = v;
  set("id", d.buyerRuc); set("name", d.buyer); set("type", "FACTURA"); set("number", d.number); set("date", d.date);
  document.querySelector("#quick-form details").open = true;
  suggestQuickPayment();
  document.getElementById("quick-full").checked = false;
  set("paid", "0"); quickTotals();
  document.getElementById("quick-error").textContent = "Revisa los datos leídos. Registra el importe cobrado solo si confirmas el pago. Guarda únicamente si es una operación nueva; si ya existe, vincula el comprobante al expediente.";
}
