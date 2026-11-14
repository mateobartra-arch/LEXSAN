const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  D = require("../assets/js/domain.js");
const quote = {
  lines: [
    { desc: "Mano de obra", qty: 2, price: 100 },
    { desc: "Repuesto", qty: 1, price: 50 },
  ],
  discount: 25,
  gross: null,
};
test("subtotal, discount, IGV and negotiated gross", () => {
  assert.deepEqual(D.quoteTotals(quote), {
    sum: 250,
    discount: 25,
    base: 225,
    gross: 265.5,
    igv: 40.5,
    adjust: 0,
  });
  assert.equal(D.quoteTotals({ ...quote, gross: 236 }).base, 200);
});
test("reject negative, non-finite, empty and over-discounted quotes", () => {
  for (const q of [
    { ...quote, discount: 251 },
    { ...quote, discount: -1 },
    { ...quote, gross: 0 },
    { ...quote, lines: [] },
    { ...quote, lines: [{ desc: "X", qty: NaN, price: 10 }] },
    { ...quote, lines: [{ desc: "X", qty: 1, price: -1 }] },
  ])
    assert.ok(D.quoteError(q));
  assert.equal(D.quoteError(quote), "");
});
test("business date uses Lima even across UTC midnight", () =>
  assert.equal(D.localDate(new Date("2026-11-09T02:00:00Z")), "2026-11-08"));
test("empty valid local database remains empty", () => {
  const data = D.migrate({ clients: [], tickets: [], next: 1 });
  assert.equal(data.tickets.length, 0);
  assert.equal(data.schemaVersion, 5);
});
test("500 sin IGV siempre resulta 590 en modo automático, incluso con un total residual", () => {
  const q = {
    lines: [{ desc: "Servicio", qty: 1, price: 500 }],
    discount: 0,
    gross: 1000,
    pricingMode: "items",
  };
  assert.deepEqual(D.quoteTotals(q), {
    sum: 500,
    discount: 0,
    base: 500,
    gross: 590,
    igv: 90,
    adjust: 0,
  });
  const agreed = D.quoteTotals({ ...q, pricingMode: "agreed" });
  assert.equal(agreed.base, 847.46);
  assert.equal(agreed.igv, 152.54);
  assert.equal(agreed.adjust, 347.46);
  assert.equal(D.money(agreed.sum + agreed.adjust + agreed.igv), agreed.gross);
});
test("legacy draft overrides require review; approved historical totals remain unchanged", () => {
  const base = {
    id: 1,
    quote: {
      lines: [{ desc: "Servicio", qty: 1, price: 500 }],
      discount: 0,
      gross: 1000,
    },
    eval: { photos: [] },
    work: {},
  };
  const data = D.migrate({
    clients: [],
    tickets: [
      { ...structuredClone(base), status: "evaluacion" },
      { ...structuredClone(base), id: 2, status: "inicio" },
    ],
  });
  assert.equal(data.tickets[0].quote.pricingReview, false);
  assert.equal(D.quoteError(data.tickets[0].quote), "");
  assert.equal(D.quoteTotals(data.tickets[0].quote).gross, 590);
  assert.equal(data.tickets[1].quote.pricingReview, undefined);
  assert.equal(D.quoteTotals(data.tickets[1].quote).gross, 1000);
  assert.equal(D.migrate(data).tickets[0].quote.gross, null);
  assert.equal(data.tickets[0].quote.previousAgreedGross, 1000);
});
test("report uses actual approved/invoiced records", () => {
  const t = {
    quote,
    paid: 50,
    approval: { who: "Cliente" },
    work: { finished: "hoy" },
    doc: { number: "F001-1" },
    createdAt: "2026-11-01T12:00:00Z",
    completedAt: "2026-11-03T12:00:00Z",
  };
  assert.deepEqual(D.report([t]), {
    count: 1,
    approved: 1,
    completed: 1,
    invoiced: 265.5,
    received: 50,
    pending: 215.5,
    averageDays: 2,
  });
});
