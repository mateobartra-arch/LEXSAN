(function (root) {
  const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  function localDate(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
  function quoteTotals(q) {
    const sum = money(q.lines.reduce((n, l) => n + money(l.qty * l.price), 0)),
      discount = money(q.discount || 0);
    let base = money(sum - discount),
      gross = money(base * 1.18);
    if (
      q.pricingMode !== "items" &&
      q.gross !== null &&
      q.gross !== "" &&
      q.gross !== undefined
    ) {
      gross = money(q.gross);
      base = money(gross / 1.18);
    }
    return {
      sum,
      discount,
      base,
      gross,
      igv: money(gross - base),
      adjust: money(base - (sum - discount)),
    };
  }
  function quoteError(q) {
    if (q.pricingReview)
      return "Revisa el total anterior: elige cálculo por ítems o confirma el total acordado.";
    if (
      q.pricingMode === "agreed" &&
      (q.gross === null ||
        q.gross === "" ||
        !Number.isFinite(Number(q.gross)) ||
        Number(q.gross) <= 0)
    )
      return "Ingresa un total acordado válido, incluido IGV.";
    if (!q.lines?.length) return "Agrega al menos un ítem.";
    if (
      q.lines.some(
        (l) =>
          !l.desc?.trim() ||
          !Number.isFinite(Number(l.qty)) ||
          Number(l.qty) <= 0 ||
          !Number.isFinite(Number(l.price)) ||
          Number(l.price) < 0,
      )
    )
      return "Revisa descripción, cantidad positiva y precio de cada ítem.";
    const s = quoteTotals({ ...q, gross: null });
    if (!Number.isFinite(s.discount) || s.discount < 0 || s.discount > s.sum)
      return "El descuento debe estar entre cero y el subtotal.";
    const v = quoteTotals(q);
    if (!Number.isFinite(v.gross) || v.gross <= 0)
      return "El total debe ser un importe positivo.";
    return "";
  }
  function useBasePrices(q) {
    if (q.pricingMode !== "items" && q.gross != null && q.gross !== "")
      q.previousAgreedGross ??= q.gross;
    q.pricingMode = "items";
    q.gross = null;
    q.pricingReview = false;
    return q;
  }
  function migrate(data) {
    if (!data || !Array.isArray(data.clients) || !Array.isArray(data.tickets))
      throw Error("Formato de datos no válido");
    data.inventory ||= [];
    data.schemaVersion = 5;
    data.next = Math.max(
      Number(data.next) || 1,
      ...data.tickets.map((t) => Number(t.id) + 1),
    );
    for (const t of data.tickets) {
      if (!t.quote.pricingMode) {
        const hasTotal =
          t.quote.gross !== null &&
          t.quote.gross !== "" &&
          t.quote.gross !== undefined;
        const calculated = quoteTotals({
          ...t.quote,
          pricingMode: "items",
        }).gross;
        t.quote.pricingMode = hasTotal ? "agreed" : "items";
        if (
          hasTotal &&
          t.status === "evaluacion" &&
          Math.abs(calculated - Number(t.quote.gross)) > 0.02
        )
          t.quote.pricingReview = true;
      }
      if (t.status === "evaluacion") useBasePrices(t.quote);
      t.events ||= [];
      t.payments ||= [];
      t.receipts ||= [];
      t.work.progress ||= [];
      t.eval.photos = (t.eval.photos || []).filter(
        (x) =>
          typeof x === "string" &&
          /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x),
      );
      t.receipts = t.receipts.filter((r) =>
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(r.src),
      );
    }
    return data;
  }
  function report(tickets) {
    const approved = tickets.filter((t) => t.approval),
      completed = tickets.filter((t) => t.work.finished),
      invoiced = tickets.filter((t) => t.doc.number);
    const cycles = tickets
      .filter((t) => t.completedAt && t.createdAt)
      .map(
        (t) => (Date.parse(t.completedAt) - Date.parse(t.createdAt)) / 86400000,
      )
      .filter((n) => Number.isFinite(n) && n >= 0);
    return {
      count: tickets.length,
      approved: approved.length,
      completed: completed.length,
      invoiced: money(
        invoiced.reduce((s, t) => s + quoteTotals(t.quote).gross, 0),
      ),
      received: money(tickets.reduce((s, t) => s + t.paid, 0)),
      pending: money(
        approved.reduce(
          (s, t) => s + Math.max(0, quoteTotals(t.quote).gross - t.paid),
          0,
        ),
      ),
      averageDays: cycles.length
        ? money(cycles.reduce((a, b) => a + b, 0) / cycles.length)
        : null,
    };
  }
  const api = {
    money,
    localDate,
    quoteTotals,
    quoteError,
    useBasePrices,
    migrate,
    report,
  };
  root.LexDomain = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
