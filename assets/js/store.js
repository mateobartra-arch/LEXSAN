/* Persistence boundary. The legacy UI remains synchronous; writes are coalesced and
   the session layer waits for flush before transitions, downloads and sign-out. */
window.LexStore = {
  mode: window.LEXSAN_CONFIG?.mode || "firebase",
  key: null,
  committed: null,
  adapter: null,
  failed: false,
  pending: false,
  timer: null,
  empty() {
    return {
      schemaVersion: 3,
      next: 1,
      clients: [],
      tickets: [],
      inventory: [],
    };
  },
  load(key, fresh) {
    if (window.LEXSAN_CONFIG?.demo) key += "_demo";
    this.key = key;
    if (this.mode !== "local") return this.empty();
    try {
      const raw = localStorage.getItem(key);
      const data = LexDomain.migrate(raw ? JSON.parse(raw) : fresh());
      this.committed = JSON.stringify(data);
      return data;
    } catch (e) {
      this.failed = true;
      this.loadError = e.message;
      return this.empty();
    }
  },
  nextId(data) {
    if (this.mode === "local") return data.next++;
    return (
      Date.now() * 1000 + (crypto.getRandomValues(new Uint16Array(1))[0] % 1000)
    );
  },
  status(message, error = false) {
    const el = document.getElementById("save-state");
    if (el) {
      el.textContent = message;
      el.classList.toggle("error", error);
    }
  },
  save(data) {
    if (this.failed) {
      this.status("Guardado bloqueado: revisa el error", true);
      return false;
    }
    if (this.mode === "local") {
      try {
        const json = JSON.stringify(data);
        localStorage.setItem(this.key, json);
        this.committed = json;
        this.status("Guardado en este navegador");
        return true;
      } catch (e) {
        this.failed = true;
        this.status("No guardado: almacenamiento lleno o bloqueado", true);
        toast("No se guardaron los cambios. Exporta una copia antes de salir.");
        return false;
      }
    }
    if (!this.adapter) {
      this.status("Inicia sesión para guardar", true);
      return false;
    }
    this.pending = true;
    this.status("Cambios pendientes…");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush().catch(() => {}), 600);
    return true;
  },
  async flush() {
    clearTimeout(this.timer);
    if (this.failed)
      throw Error("Hay cambios sin guardar. Exporta una copia y recarga.");
    if (this.flight) {
      await this.flight;
      return this.flush();
    }
    if (!this.pending) return;
    this.pending = false;
    const snapshot = JSON.parse(JSON.stringify(db));
    this.flight = this.adapter
      .commit(snapshot)
      .then(() => {
        this.committed = JSON.stringify(snapshot);
        this.status("Sincronizado");
      })
      .catch((e) => {
        this.failed = true;
        this.status("No sincronizado: " + e.message, true);
        toast("No se guardó en la nube: " + e.message);
        throw e;
      })
      .finally(() => {
        this.flight = null;
      });
    await this.flight;
    if (this.pending) return this.flush();
  },
  export() {
    const blob = new Blob([JSON.stringify(db, null, 2)], {
      type: "application/json",
    });
    pdfDownload(blob, "LEXSAN-respaldo-" + LexDomain.localDate() + ".json");
  },
};
window.addEventListener("beforeunload", (e) => {
  if (LexStore.failed || LexStore.pending || LexStore.flight) {
    e.preventDefault();
    e.returnValue = "";
  }
});
