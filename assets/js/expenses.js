/* Purchase documents are read on the device. Only reviewed fields are saved. */
let expenseDraft = null;
let expenseReading = false;
let expenseOCRLoader;

function expenseField(name, label, type = "text", extra = "") {
  return `<label>${label}<input name="${name}" type="${type}" value="${esc(expenseDraft[name] ?? "")}" ${extra}></label>`;
}
function openExpense(id) {
  if (LexSession.user?.role === "tecnico") return;
  const current = db.expenses?.find(e => e.id === id);
  expenseDraft = current ? structuredClone(current) : {date: iso(), description: "", amount: "", documentType: "", paid: 0};
  modal = "expense";
  modalShow(`<div class="modal-head"><h2>${current ? "Editar gasto" : "Nuevo gasto"}</h2><button class="xbtn" aria-label="Cerrar gasto" onclick="closeModal()">×</button></div>
  <div class="modal-body">
    <div class="fields2"><label>Leer factura, boleta o voucher<input type="file" accept="application/pdf,image/*" onchange="readExpenseFile(this.files[0])"></label>
    <label>Tomar foto<input type="file" accept="image/*" capture="environment" onchange="readExpenseFile(this.files[0])"></label></div>
    <p class="small">Lee PDF o foto y revisa los campos. El OCR descarga su motor con internet y procesa la imagen en este dispositivo. El archivo se usa solo durante la lectura.</p>
    <p id="expense-read-status" role="status"></p>
    <details id="expense-text-panel" hidden><summary>Texto leído del documento</summary><pre id="expense-text" style="white-space:pre-wrap;max-height:220px;overflow:auto"></pre></details>
    <form id="expense-form" onsubmit="event.preventDefault();confirmExpense(this)">
      <div class="fields2">
      ${expenseField("date","Fecha de compra / emisión","date","required")}
      <label>Comprobante<select name="documentType" required>${["","FACTURA","BOLETA","PENDIENTE"].map(v=>`<option value="${v}" ${v === expenseDraft.documentType ? "selected" : ""}>${v === "" ? "Seleccionar" : v === "PENDIENTE" ? "Pendiente de factura / boleta" : v}</option>`).join("")}</select></label>
      ${expenseField("number","Serie y número","text",'maxlength="30" placeholder="F001-123"')}
      ${expenseField("supplier","Proveedor / razón social","text",'maxlength="180" required')}
      ${expenseField("ruc","RUC del proveedor","text",'inputmode="numeric" pattern="[0-9]{11}" maxlength="11"')}
      ${expenseField("amount","Monto total (S/ incluido IGV)","number",'min="0.01" max="1000000" step=".01" required')}
      </div>
      <label>Descripción de la compra<textarea name="description" maxlength="4000" required>${esc(expenseDraft.description)}</textarea></label>
      <details class="quote-extra"><summary>Detalle, referencias y observaciones</summary><div class="fields2">
      ${expenseField("quantity","Cantidad","number",'min=".00001" step="any"')}
      ${expenseField("unitPrice","Precio unitario","number",'min="0" step="any"')}
      ${expenseField("base","Base imponible (S/)","number",'min="0" step=".01"')}
      ${expenseField("igv","IGV (S/)","number",'min="0" step=".01"')}
      ${expenseField("discount","Descuento (S/)","number",'min="0" step=".01"')}
      ${expenseField("order","Orden de compra","text",'maxlength="60"')}
      ${expenseField("guide","Guía de remisión","text",'maxlength="60"')}
      ${expenseField("phone","Celular del proveedor","tel",'maxlength="30"')}
      </div><label>Observaciones<textarea name="notes" maxlength="2000">${esc(expenseDraft.notes || "")}</textarea></label></details>
      <h3>Pago de esta compra</h3><div class="fields2">
      ${expenseField("paid","Importe pagado acumulado (S/)","number",'min="0" step=".01" required')}
      ${expenseField("paymentDate","Fecha del pago","date")}
      ${expenseField("paymentMethod","Medio de pago","text",'maxlength="60" placeholder="Efectivo, transferencia, Yape…"')}
      ${expenseField("operation","Número de operación / voucher","text",'maxlength="80"')}
      </div><p class="small">Si cargas un voucher, confirma el importe pagado. Para vincularlo a una compra existente, abre «Editar / adjuntar voucher» en esa compra.</p>
      <p id="expense-error" role="alert"></p>
      <button class="button" id="expense-save">Guardar gasto revisado</button>
    </form></div>`);
}
editExpense = openExpense;
renderExpenses = function () {
  const entries = [...(db.expenses || [])].sort((a,b)=>b.date.localeCompare(a.date));
  const month = iso().slice(0,7);
  const total = entries.filter(e=>e.date.startsWith(month)).reduce((s,e)=>s+e.amount,0);
  document.getElementById("page-top").textContent = "Compras y gastos";
  document.getElementById("page").innerHTML = `<section class="home-start"><div class="section-head"><h1>Compras y gastos</h1><button class="button" onclick="openExpense()">＋ Nuevo gasto</button></div>
    <p>Total del mes · <b>${fmt(total)}</b></p><div class="daily-pending">${entries.map(e=>{
      const paid=Number(e.paid)||0, balance=Math.max(0,round(e.amount-paid));
      return `<article class="card"><b>${esc(e.description)}</b><p>${esc(e.supplier || "Proveedor pendiente")} · ${esc(e.date)}</p>
      <p>${esc(e.number || "Comprobante pendiente")} · Total ${fmt(e.amount)}</p>
      <p>${balance ? "Por pagar " + fmt(balance) : "Pagado"}${!e.number ? " · Falta factura / boleta" : ""}</p>
      <button class="button outline sm" onclick="openExpense('${esc(e.id)}')">Editar / adjuntar voucher</button></article>`;
    }).join("") || "<p>Aún no hay gastos registrados.</p>"}</div></section>`;
};

function expenseNumber(value) {
  const s=String(value || "").replace(/[^0-9.,-]/g,"");
  if (!s) return "";
  const comma=s.lastIndexOf(","), dot=s.lastIndexOf(".");
  const decimal=Math.max(comma,dot);
  const result=decimal>=0 && s.length-decimal-1===2
    ? s.slice(0,decimal).replace(/[.,]/g,"")+"."+s.slice(decimal+1)
    : s.replace(/[.,]/g,"");
  return Number.isFinite(Number(result)) ? Number(result) : "";
}
function parseExpenseText(raw) {
  const text=raw.replace(/\r/g,"");
  const normalized=text.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const cap=re=>normalized.match(re)?.[1]?.trim() || "";
  const number=cap(/\b([FBET][A-Z0-9]{3}\s*-\s*\d{1,8})\b/i).replace(/\s/g,"").toUpperCase();
  const type=/BOLETA/i.test(normalized)?"BOLETA":/FACTURA/i.test(normalized)?"FACTURA":"";
  const voucher=!type && /operacion|transferencia|yape|plin|voucher|deposito/i.test(normalized);
  const date=cap(/(?:fecha(?: de emision| de operacion)?\s*[:.]?\s*)(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i);
  const isoDate=date ? date.split(/[\/-]/).reverse().map((n,i)=>i ? n.padStart(2,"0"):n).join("-"):"";
  const amount=label=>{
    const value=cap(new RegExp("(?:^|\\n)\\s*(?:"+label+")\\s*[:=]?\\s*(?:S\\s*\\/\\.?|PEN|Soles)?\\s*([0-9][0-9.,]*)","i"));
    return expenseNumber(value);
  };
  const ruc=cap(/\bR\.?U\.?C\.?\s*[:#-]?\s*(\d{11})/i);
  const supplier=cap(/(?:razon social|proveedor|emisor)\s*[:]\s*([^\n]+)/i);
  const lines=text.split("\n").map(s=>s.trim()).filter(Boolean);
  const candidate=lines.find(line=>!/factura|boleta|ruc|electronica|voucher|transferencia/i.test(line.normalize("NFD").replace(/[\u0300-\u036f]/g,"")) && /[A-Za-zÁÉÍÓÚñ]/.test(line));
  const total=amount("importe total|total a pagar|monto total|monto transferido|importe|monto|total");
  const operation=cap(/(?:n[°ºo.]?\s*(?:de\s*)?)?operacion\s*[:#-]?\s*([A-Z0-9-]{4,80})/i);
  const description=cap(/(?:concepto|descripcion|detalle)\s*:\s*([^\n]+)/i);
  return {voucher, foreign:/\bUSD\b|DOLARES|US\$/i.test(normalized), values:voucher
    ? {paymentDate:isoDate,operation,paymentMethod:/yape/i.test(text)?"Yape":/plin/i.test(text)?"Plin":"Transferencia"}
    : {documentType:type,number,date:isoDate,ruc,supplier:supplier||candidate||"",amount:total,base:amount("base imponible|valor venta|op\\. gravadas|operaciones gravadas"),igv:amount("igv(?:\\s*18\\s*%)?"),description}, total};
}
function loadExpenseOCR() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (!expenseOCRLoader) expenseOCRLoader=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";
    script.onload=()=>resolve(window.Tesseract);
    script.onerror=()=>{script.remove();expenseOCRLoader=null;reject(Error("No se pudo descargar el motor OCR. Revisa la conexión."));};
    document.head.append(script);
  });
  return expenseOCRLoader;
}
async function readExpenseFile(file) {
  if (!file || expenseReading || modal!=="expense") return;
  const form=document.getElementById("expense-form"), status=document.getElementById("expense-read-status");
  const draft=expenseDraft;
  if (file.size>15*1024*1024) {status.textContent="El archivo debe pesar hasta 15 MB.";return;}
  if (!file.type.startsWith("image/") && !/\.pdf$/i.test(file.name)) {status.textContent="Selecciona un PDF o una imagen.";return;}
  expenseReading=true;
  const controls=[...form.querySelectorAll("input,select,textarea,button")];
  controls.forEach(e=>e.disabled=true);
  let worker, loading, text="";
  const active=()=>form.isConnected && expenseDraft===draft && modal==="expense";
  const recognize=async image=>{
    if (!worker) {
      const engine=await loadExpenseOCR();
      worker=await engine.createWorker("spa",1,{logger:m=>{
        if(active())status.textContent=m.status==="recognizing text" ? "Leyendo imagen… "+Math.round(m.progress*100)+" %" : "Preparando OCR…";
      }});
    }
    return (await worker.recognize(image)).data.text;
  };
  status.textContent="Leyendo documento…";
  try {
    if (/\.pdf$/i.test(file.name)) {
      const lib=await import("../vendor/pdfjs/pdf.mjs");
      lib.GlobalWorkerOptions.workerSrc="assets/vendor/pdfjs/pdf.worker.mjs";
      loading=lib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
      const pdf=await loading.promise;
      if(pdf.numPages>5)throw Error("Elige un comprobante de hasta 5 páginas.");
      for(let n=1;n<=pdf.numPages;n++){
        if(!active())return;
        const page=await pdf.getPage(n), items=(await page.getTextContent()).items;
        let pageText=items.map(i=>i.str+(i.hasEOL?"\n":" ")).join("");
        if(pageText.trim().length<50){
          const natural=page.getViewport({scale:1}), scale=Math.min(2,1800/Math.max(natural.width,natural.height));
          const viewport=page.getViewport({scale}),canvas=document.createElement("canvas");
          canvas.width=viewport.width;canvas.height=viewport.height;
          await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
          pageText=await recognize(canvas);
        }
        text+=pageText+"\n";
      }
    } else {
      const bitmap=await createImageBitmap(file);
      try{
        const scale=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        const context=canvas.getContext("2d");
        context.fillStyle="white";context.fillRect(0,0,canvas.width,canvas.height);
        context.drawImage(bitmap,0,0,canvas.width,canvas.height);
        text=await recognize(canvas);
      }finally{bitmap.close();}
    }
    if(!active())return;
    document.getElementById("expense-text-panel").hidden=false;
    document.getElementById("expense-text").textContent=text;
    const result=parseExpenseText(text);
    if(result.foreign)throw Error("El documento parece estar en otra moneda. Registra y revisa manualmente su equivalente en soles.");
    for(const [key,value] of Object.entries(result.values)){
      const field=form.elements.namedItem(key);
      if(field && value!=="" && !field.value)field.value=value;
    }
    if(result.voucher){
      if(!draft.id && form.elements.amount.value==="")form.elements.amount.value=result.total;
      if(!form.elements.documentType.value)form.elements.documentType.value="PENDIENTE";
      status.textContent="Voucher leído. Importe detectado: "+(result.total===""?"sin identificar":fmt(result.total))+". Confirma el importe pagado y completa el proveedor y el comprobante.";
    }else status.textContent="Lectura terminada. Revisa proveedor, RUC, fecha, importes y descripción. Completa los campos que quedaron vacíos.";
    if(text.trim().length<15)status.textContent="No se pudo leer texto suficiente. Usa una foto más nítida o completa los campos.";
    form.querySelector('[name="date"]').value=result.values.date || form.querySelector('[name="date"]').value;
  }catch(error){if(active())status.textContent=error.message;}
  finally{
    await Promise.allSettled([worker?.terminate(), loading?.destroy()]);
    expenseReading=false;
    if(active())controls.forEach(e=>e.disabled=false);
  }
}
async function confirmExpense(form) {
  if (expenseReading || LexStore.failed || LexSession.user?.role==="tecnico" || !form.reportValidity()) return;
  const values=Object.fromEntries(new FormData(form).entries());
  const fail=message=>document.getElementById("expense-error").textContent=message;
  for(const key of Object.keys(values))values[key]=values[key].trim();
  values.number=values.number.toUpperCase().replace(/\s/g,"");
  if(!values.description || !values.supplier)return fail("Completa descripción y proveedor.");
  if(values.documentType!=="PENDIENTE" && !/^[A-Z0-9]{4}-\d{1,8}$/.test(values.number))return fail("Revisa la serie y número del comprobante.");
  if(values.documentType==="FACTURA" && !/^\d{11}$/.test(values.ruc))return fail("La factura necesita el RUC del proveedor.");
  for(const key of ["amount","paid","quantity","unitPrice","base","igv","discount"]){
    if(values[key]===""){delete values[key];continue;}
    values[key]=Number(values[key]);
    if(!Number.isFinite(values[key]) || values[key]<0)return fail("Revisa los importes.");
  }
  if(values.paid>values.amount)return fail("El importe pagado supera el total de la compra.");
  if(values.paid>0 && !values.paymentDate)return fail("Indica la fecha del pago.");
  if(values.base!==undefined && values.igv!==undefined && Math.abs(round(values.base+values.igv)-values.amount)>.02)
    return fail("La base más el IGV no coincide con el total. Revisa el comprobante o deja el desglose vacío si incluye otros conceptos.");
  const list=db.expenses ||= [], id=expenseDraft.id || crypto.randomUUID();
  const duplicate=list.find(e=>e.id!==id && (
    values.number && values.ruc && e.ruc===values.ruc && e.number===values.number ||
    values.operation && e.operation===values.operation && e.paymentDate===values.paymentDate && e.paymentMethod===values.paymentMethod
  ));
  if(duplicate)return fail("Este comprobante o voucher ya figura en otro gasto. Abre ese gasto para revisarlo.");
  const entry={...values,id}, index=list.findIndex(e=>e.id===id);
  expenseDraft.id=id;
  if(index>=0)list[index]=entry;else list.push(entry);
  document.getElementById("expense-save").disabled=true;
  try {
    if(!save())throw Error("No se pudo guardar. Revisa el estado del almacenamiento.");
    await LexStore.flush();
    if(modal==="expense"){closeModal();go("gastos");}
    toast("Gasto guardado");
  }catch(error){if(form.isConnected)fail(error.message);}
}
