function openClientImport() {
  modal = "client-import";
  modalShow(`<div class="modal-head"><h2>Importar clientes</h2><button class="xbtn" aria-label="Cerrar" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label for="client-import-files">Archivos Excel (.xlsx) o CSV</label>
        <input id="client-import-files" type="file" accept=".xlsx,.csv" multiple>
      </div>
      <p class="small">Incluye columnas de nombre o razón social y RUC o DNI. Puedes seleccionar ambos archivos juntos.</p>
      <div id="client-import-preview" aria-live="polite"></div>
    </div>`);
  const input = document.getElementById("client-import-files");
  const preview = document.getElementById("client-import-preview");
  let selection = 0;
  input.addEventListener("change", async () => {
    const current = ++selection;
    const files = Array.from(input.files);
    preview.textContent = files.length ? "Leyendo archivos…" : "";
    if (!files.length) return;
    try {
      const { readClientFiles } = await import("./client-file-reader.js");
      const result = await readClientFiles(files);
      if (!preview.isConnected || current !== selection) return;
      showClientImportPreview(preview, input, result);
    } catch {
      if (current === selection) preview.textContent = "No se pudieron leer los archivos.";
    }
  });
}

function showClientImportPreview(preview, input, result) {
  const seen = new Set(db.clients.map(c => c.id));
  const fresh = result.clients.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  const updates = clientImportUpdates(result);
  preview.innerHTML = `<p><b>${fresh.length} clientes nuevos</b> · ${result.clients.length - fresh.length} repetidos · ${result.rejected.length} filas incompletas o inválidas</p>
    <p>${updates.services} servicios nuevos en el historial</p>
    ${result.unsupported.map(message => `<p>${esc(message)}</p>`).join("")}
    ${result.rejected.length ? `<details><summary>Ver filas omitidas</summary><ul>${result.rejected.map(row => `<li>${esc(row)}</li>`).join("")}</ul></details>` : ""}
    ${updates.clients.length ? `<button class="button" type="button">Guardar importación</button>` : ""}`;
  const button = preview.querySelector("button");
  if (!button) return;
  button.addEventListener("click", async () => {
    if (!canCommand("addClient") || LexStore.failed) return;
    button.disabled = input.disabled = true;
    let imported = 0;
    try {
      await LexStore.flush();
      const { clients } = clientImportUpdates(result);
      const batchSize = LexStore.mode === "local" ? Math.max(1, clients.length) : 80;
      for (let i = 0; i < clients.length; i += batchSize) {
        saveClientImportBatch(clients.slice(i, i + batchSize));
        await LexStore.flush();
        imported += Math.min(batchSize, clients.length - i);
      }
      if (preview.isConnected) closeModal();
      toast(`${imported} clientes importados`);
    } catch (error) {
      preview.textContent = `Se guardaron ${imported} clientes. ${error.message}`;
      input.disabled = false;
    }
  });
}

function clientImportUpdates(result) {
  const current = new Map(db.clients.map(c => [c.id, c]));
  const updates = new Map();
  for (const c of result.clients) {
    if (!current.has(c.id) && !updates.has(c.id)) updates.set(c.id, c);
  }
  let services = 0;
  const occurrences = new Map();
  for (const entry of result.services) {
    const { clientId, ...service } = entry;
    const c = updates.get(clientId) || current.get(clientId);
    const history = c.serviceHistory || [];
    const key = JSON.stringify(service);
    const scopedKey = clientId + ":" + key;
    const occurrence = (occurrences.get(scopedKey) || 0) + 1;
    occurrences.set(scopedKey, occurrence);
    if (history.filter(row => JSON.stringify(row) === key).length >= occurrence) continue;
    updates.set(clientId, { ...c, serviceHistory: [...history, service] });
    services++;
  }
  return { clients: [...updates.values()], services };
}

function saveClientImportBatch(batch) {
  const previous = db.clients;
  const merged = new Map(previous.map(c => [c.id, c]));
  for (const c of batch) merged.set(c.id, c);
  db.clients = [...merged.values()];
  if (save()) return;
  db.clients = previous;
  throw Error("El portal no pudo guardar los clientes.");
}

function importedServiceHistory(c) {
  const entries = c.serviceHistory || [];
  const dateKey = date => date.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (_, d, m, y) =>
    `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
  if (!entries.length) return "";
  const money = value => value ? "S/ " + value.replace(/^S\/\s*/i, "") : "—";
  return `<h3>Servicios del registro de ingresos</h3><div class="tablebox"><table>
    <thead><tr><th>Fecha</th><th>Servicio</th><th>Placa</th><th>Precio unitario</th><th>Monto del registro</th><th>Factura</th><th>Estado</th></tr></thead>
    <tbody>${[...entries].sort((a,b) => dateKey(b.date).localeCompare(dateKey(a.date))).map(row =>
      `<tr><td>${esc(row.date || "—")}</td><td>${esc(row.description)}</td><td>${esc(row.plate || "—")}</td>
      <td>${esc(money(row.unitPrice))}</td><td>${esc(money(row.total))}</td><td>${esc(row.invoice || "—")}</td><td>${esc(row.status || "—")}</td></tr>`).join("")}</tbody></table></div>`;
}
