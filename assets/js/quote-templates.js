/* Plantillas de servicio, notas e ítems frecuentes de LEXSAN.
   Solo contiene redacción técnica: ningún cliente, precio ni cuenta bancaria. */
const LexQuoteTemplates = (() => {
  const base = [
    "Desmontaje de accesorios ajenos al intercambiador de calor.",
    "Limpieza interior y exterior del componente.",
    "Desincrustación interior y exterior con aditivos químicos biodegradables.",
    "Neutralización interior y exterior con aditivos químicos biodegradables.",
  ];
  const finish = [
    "Rectificación de tomas del intercambiador de calor.",
    "Rectificación de roscas del intercambiador de calor.",
    "Alineamiento de aletas de transferencia térmica.",
  ];
  const variable = "Los costos calculados son variables y es de acuerdo a la evaluación de cada equipo.";
  const dismount = "Desmontaje y montaje de radiador de H2O, intercooler, pandero y tanque de H2O.";
  const coolant = "Utilizar el refrigerante recomendable por el fabricante del motor.";
  const test = {
    radiador: "Prueba hidrostática de 0 a 15 psi durante 1 h. - Radiador de H2O.",
    intercooler: "Prueba hidrostática de 0 a 25 psi durante 1 h. - Intercooler.",
    enfriador: "Prueba hidrostática de 0 a 120 psi durante 1 h. - Enfriador de aceite.",
    condensador: "Prueba hidrostática de 0 a 25 psi durante 1 h. - Condensador de aire acondicionado.",
  };
  const saleNotes = [
    "Usar refrigerante de composición anticongelante Prestone, Zerex Valvoline u otros (NO VISTONY). Usar gomas de soportes y pernos de seguridad operativos.",
    "GARANTÍA: 06 meses por defecto de fábrica. Si el componente presenta oxidación en su interior, abolladura o fisura en colector, no cubre garantía.",
    "Cambio de refrigerante: NO.",
  ];
  const service = (id, label, lines, steps) => ({ id: "lx-" + id, label, lines, body: steps.join("\n"), notes: variable });
  const templates = [
    service("radiador", "Reparación y mantenimiento de radiador",
      ["Mantenimiento, sondeo, reparación de radiador de H2O"],
      [...base, "Sondeo (limpieza tubo por tubo).", "Reforzamiento de placa porta-tubo (ambos extremos).", "Soldeo y/o reparación si es necesario.", ...finish, coolant, test.radiador]),
    service("intercooler", "Reparación y mantenimiento de intercooler",
      ["Mantenimiento, reparación de intercooler"],
      [...base, "Soldeo y/o reparación si es necesario.", "Aplicación de soldadura de Al. Norma ER 4047.", ...finish, test.intercooler]),
    service("radiador-intercooler", "Radiador + intercooler",
      ["Mantenimiento, sondeo, reparación de radiador de H2O", "Mantenimiento, reparación de intercooler"],
      [...base, "Sondeo (limpieza tubo por tubo). - Radiador de H2O.", "Reforzamiento de placa porta-tubo (ambos extremos). - Radiador de H2O.", "Soldeo y/o reparación si es necesario.", "Aplicación de soldadura de Al. Norma ER 4047. - Intercooler.", ...finish, coolant, test.radiador, test.intercooler]),
    service("radiador-intercooler-montaje", "Radiador + intercooler con desmontaje y montaje",
      ["Desmontaje y montaje de radiador completo", "Mantenimiento, sondeo, reparación de radiador de H2O", "Mantenimiento, reparación de intercooler"],
      [dismount, ...base, "Sondeo (limpieza tubo por tubo). - Radiador de H2O.", "Soldeo y/o reparación si es necesario.", "Aplicación de soldadura de Al. Norma ER 4047. - Intercooler.", ...finish, coolant, test.radiador, test.intercooler]),
    service("mantenimiento", "Solo mantenimiento (sin reparación)",
      ["Mantenimiento, presurizado de radiador de H2O", "Mantenimiento, presurizado de intercooler"],
      [...base, ...finish, coolant, test.radiador, test.intercooler]),
    service("descarte", "Radiador descartado + reparación de intercooler",
      ["Evaluación de radiador de H2O - DESCARTADO", "Mantenimiento, reparación de intercooler"],
      [...base, "Aplicación de soldadura de Al. Norma ER 4047. - Intercooler.", "Soldeo y/o reparación si es necesario.", ...finish, test.radiador, test.intercooler]),
    service("enfriador", "Enfriador de aceite",
      ["Mantenimiento, reparación de enfriador de aceite"],
      [...base, "Aplicación de soldadura Ag 60/40.", "Soldeo y/o reparación si es necesario.", ...finish, test.enfriador]),
    service("tanque-combustible", "Tanque de combustible",
      ["Mantenimiento, reparación de tanque de combustible"],
      ["Prueba hidrostática inicial de 0 a 20 psi.", "Limpieza química exterior e interior con aditivos químicos biodegradables.", "Desgasificación interior del tanque de combustible.", "Enderezado de tanque de combustible.", "Soldeo y/o reparación si es necesario (TIG).", "Aplicación de soldadura de Al. Norma ER 4047.", "Prueba hidrostática final a 20 psi."]),
    service("colector", "Cambio de colector o tanque superior",
      ["Cambio de colector, mantenimiento, sondeo de radiador de H2O"],
      [...base, "Destapar tanque superior y sellado del mismo.", "Sondeo (limpieza tubo por tubo).", "Soldeo y/o reparación si es necesario.", "Cambio de colector o tanque superior en material Al. (espesor 2 mm). Norma UNE-442-2. Para intercambiadores de calor según muestra y modelo.", ...finish, coolant, test.radiador]),
    service("condensador", "Radiador + condensador de aire acondicionado",
      ["Mantenimiento, presurizado, reparación de radiador de H2O", "Mantenimiento, presurizado de condensador de aire acondicionado"],
      [...base, "Reforzamiento de placa porta-tubo (ambos extremos).", "Soldeo y/o reparación si es necesario.", ...finish, test.condensador, test.radiador]),
    service("supermix", "Mantenimiento y reparación (redacción Supermix)",
      ["Mantenimiento y reparación de radiador de H2O"],
      ["Desmontaje de accesorios ajenos al intercambiador de calor.", "Limpieza interior y exterior del componente con agua presurizada.", "Limpieza exterior e interior del componente con aditivos químicos biodegradables.", "Neutralización exterior e interior con aditivos químicos.", "Aplicación de soldadura de Al. Norma ER 4047.", "Rectificación de tomas del intercambiador de calor.", "Rectificación de roscas del intercambiador de calor.", "Abrillantado y protección de las aletas de transferencia térmica y recuperación de las mismas.", "Pintado general de radiador y accesorios.", test.radiador]),
    { id: "lx-venta-radiador", label: "Venta de radiador importado", sale: true, lines: ["Radiador de H2O importado"], body: "", notes: saleNotes.join("\n"), warranty: "06 meses por defecto de fábrica" },
    { id: "lx-venta-panal", label: "Venta de panal de intercooler", sale: true, lines: ["Panal de intercooler importado (usando sus mismos tanques)"], body: "", notes: ["Usar gomas de soportes y pernos de seguridad operativos.", saleNotes[1]].join("\n"), warranty: "06 meses por defecto de fábrica" },
  ];
  const notes = [
    "Radiador de H2O presenta fugas entre panal y tanque superior e inferior (ambos extremos).",
    "Radiador presenta polución en interior y exterior del panal.",
    "Radiador presenta oxidación y borras en su interior.",
    "Radiador presenta desgaste de panal.",
    "Intercooler presenta fugas entre panal y tanque superior e inferior (ambos extremos).",
    "Intercooler presenta fugas en celdas del panal.",
    "Enfriador de aceite presenta fugas.",
    "Tanque de combustible presenta fugas.",
    "Última reparación; si sigue presentando el mismo problema se recomienda cambio por uno nuevo.",
    "Reparación sin garantía.",
    "Presenta fugas irreparables, no se puede reparar: DESCARTAR. Se recomienda cambiar por uno nuevo.",
    "Estos costos no incluyen reparación.",
    "No se realiza instalación de mangueras a motor.",
    "Usar sellador líquido Abro.",
  ];
  const items = [
    "Desmontaje y montaje de radiador completo",
    "Agua desmineralizada",
    "Sellador líquido Abro",
    "Refrigerante Zerex Extended Life 1 gl",
  ];
  const costs = [
    ["Materiales", "Aditivo desengrasante", "gl"], ["Materiales", "Aditivo desincrustante", "gl"],
    ["Materiales", "Soldadura de Al.", "varilla"], ["Materiales", "Soldadura de Sn.", "varilla"],
    ["Materiales", "Escobilla de acero", "und"], ["Materiales", "Pintura gloss automotriz 1/8 gl", "und"],
    ["Materiales", "Thinner", "gl"], ["Materiales", "Lija", "und"], ["Materiales", "Huaype", "kg"],
    ["Materiales", "Detergente", "kg"], ["Materiales", "Disco de corte", "und"],
    ["Materiales", "Plancha de aluminio", "m2"], ["Materiales", "Tubo de aluminio", "m"],
    ["Equipos utilizados", "Equipo de oxicorte", "hora"], ["Equipos utilizados", "Compresora", "hora"],
    ["Equipos utilizados", "Hidrolavadora", "hora"], ["Equipos utilizados", "Taladro de banco", "hora"],
    ["Mano de obra", "Técnico especializado primero", "hora"], ["Mano de obra", "Técnico especializado segundo", "hora"],
  ].map(([group, desc, unit]) => ({ group, desc, unit }));
  return { templates, notes, items, costs };
})();
if (typeof module !== "undefined") module.exports = LexQuoteTemplates;
