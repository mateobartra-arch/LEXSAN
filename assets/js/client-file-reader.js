import readExcel from "read-excel-file/browser";
import Papa from "papaparse";

const aliases = {
  name: /^(razon social|nombre|nombres|nombre completo|cliente|empresa|nombre o razon social)$/,
  id: /^(ruc|dni|ruc o dni|ruc dni|documento|numero de documento|nro documento|nro de documento)$/,
  phone: /^(celular|telefono|telefono celular|movil|whatsapp)$/,
  email: /^(email|e mail|correo|correo electronico)$/,
  contact: /^(contacto|persona de contacto|nombre de contacto)$/,
  date: /^(fecha|fecha de ingreso)$/,
  description: /^(descripcion|descripcion del servicio|servicio)$/,
  unitPrice: /^(p unitario|precio unitario)$/,
  total: /^(monto igv 18|monto con igv|total con igv|importe total)$/,
  invoice: /^(factura|comprobante)$/,
  plate: /^placa$/,
  status: /^estado$/,
};
const cell = value => String(value ?? "").trim();
const header = value => cell(value).normalize("NFD").replace(/\p{M}/gu, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export async function readClientFiles(files) {
  const clients = [];
  const services = [];
  const rejected = [];
  const unsupported = [];
  for (const file of files) {
    try {
      let sheets;
      if (/\.xlsx$/i.test(file.name)) {
        sheets = await readExcel(file);
      } else if (/\.csv$/i.test(file.name)) {
        const bytes = await file.arrayBuffer();
        let content;
        try { content = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
        catch { content = new TextDecoder("windows-1252").decode(bytes); }
        sheets = [{ name: "", data: Papa.parse(content, {
          delimiter: content.split(/\r?\n/).find(line => /\bruc\b|\bdni\b/i.test(line))?.includes(";") ? ";" : "",
          skipEmptyLines: "greedy",
        }).data }];
      } else {
        throw Error("Usa un archivo .xlsx o .csv.");
      }
      let recognized = false;
      for (const sheet of sheets) {
        const rows = sheet.data;
        const columnsFor = row => Object.fromEntries(Object.entries(aliases)
          .map(([key, pattern]) => [key, row.findIndex(value => pattern.test(header(value)))]));
        const start = rows.findIndex(row => {
          const c = columnsFor(row);
          return c.name >= 0 && c.id >= 0;
        });
        if (start < 0) continue;
        recognized = true;
        const columns = columnsFor(rows[start]);
        rows.slice(start + 1).forEach((row, offset) => {
          const get = key => cell(row[columns[key]]);
          const name = get("name");
          const id = get("id").replace(/[\s-]/g, "");
          if (!name && !id) return;
          if (name.length < 3 || !/^(\d{8}|\d{11})$/.test(id)) {
            rejected.push(`${file.name}${sheet.name ? " / " + sheet.name : ""} · fila ${start + offset + 2}`);
            return;
          }
          clients.push({ id, name, type: id.length === 11 ? "ruc" : "dni",
            phone: get("phone"), email: get("email"), contact: get("contact") });
          const description = get("description");
          if (description && columns.date >= 0) {
            const rawDate = row[columns.date];
            const date = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : get("date");
            services.push({
              clientId: id, date, description, unitPrice: get("unitPrice"),
              total: get("total"), invoice: get("invoice"), plate: get("plate"), status: get("status"),
            });
          }
        });
      }
      if (!recognized) unsupported.push(file.name + " · faltan columnas de nombre y RUC/DNI.");
    } catch (error) {
      unsupported.push(file.name + " · " + error.message);
    }
  }
  return { clients, services, rejected, unsupported };
}
