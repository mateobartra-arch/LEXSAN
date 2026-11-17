import { reserveWithRetry } from "./sequence-retry.mjs";
/* Entity revisions prevent silent last-writer-wins overwrites. */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export async function createFirebaseAdapter(config) {
  const app = initializeApp(config),
    auth = getAuth(app),
    firestore = getFirestore(app);
  await setPersistence(auth, browserSessionPersistence);
  const organization = "lexsan",
    prefix = "organizations/" + organization;
  let user = null,
    baseline = new Map(),
    revisions = new Map();
  function groups() {
    const shared = ["clients", "tickets", "inventory"];
    return user.role === "tecnico" ? shared : [...shared, "expenses"];
  }
  function sourceFor(group) {
    const source = collection(firestore, prefix + "/" + group);
    return group === "tickets" && user.role === "tecnico"
      ? query(source, where("payload.work.assignedUid", "==", user.uid))
      : source;
  }
  const path = (group, id) =>
    prefix + "/" + group + "/" + encodeURIComponent(String(id));
  const key = (group, item) =>
    path(
      group,
      group === "clients"
        ? item.id
        : group === "inventory"
          ? item.code
          : item.id,
    );
  const items = (data) =>
    groups().flatMap((group) =>
      (data[group] || []).map((item) => ({
        group,
        item,
        path: key(group, item),
      })),
    );
  async function encode(item, group) {
    const copy = structuredClone(item);
    if (group === "tickets") {
      copy.eval.photos = [];
      copy.receipts = [];
    }
    return copy;
  }
  async function decode(item, group) {
    return encode(item, group);
  }
  async function load() {
    baseline = new Map();
    revisions = new Map();
    const result = {
      schemaVersion: 3,
      next: 1,
      clients: [],
      tickets: [],
      inventory: [],
      expenses: [],
      users: [],
    };
    for (const group of groups()) {
      const snapshots = await getDocs(sourceFor(group));
      for (const snap of snapshots.docs) {
        const record = snap.data(),
          item = await decode(record.payload, group);
        result[group].push(item);
        baseline.set(snap.ref.path, JSON.stringify(item));
        revisions.set(snap.ref.path, record.revision);
      }
    }
    const members = await getDocs(
      query(
        collection(firestore, "users"),
        where("organization", "==", organization),
      ),
    );
    result.users = members.docs.map((d) => ({ uid: d.id, ...d.data() }));
    if (user.role !== "tecnico") {
      const library = await getDoc(doc(firestore, prefix + "/settings/quoteLibrary"));
      result.quoteLibrary = library.exists() ? library.data() : {};
    }
    return result;
  }
  async function openSession(account) {
    try {
      const profile = await getDoc(doc(firestore, "users", account.uid));
      if (!profile.exists() || !profile.data().active ||
          profile.data().organization !== organization ||
          !["gerencia", "administracion", "tecnico"].includes(profile.data().role)) {
        throw Error("Sin acceso");
      }
      user = { ...profile.data(), uid: account.uid };
      return { user, data: await load() };
    } catch (e) {
      user = null;
      await signOut(auth);
      throw e;
    }
  }
  return {
    async login(email, password) {
      const { user: account } = await signInWithEmailAndPassword(auth, email, password);
      return openSession(account);
    },
    async restoreSession() {
      await auth.authStateReady();
      return auth.currentUser ? openSession(auth.currentUser) : null;
    },
    logout: () => signOut(auth),
    resetPassword: email => sendPasswordResetEmail(auth, email),
    reload: load,
    async reserveQuoteNumber(minimum) {
      const ref = doc(firestore, prefix + "/settings/quoteSequence");
      return runTransaction(firestore, async tx => {
        const snapshot = await tx.get(ref);
        const next = Math.max(minimum, (snapshot.data()?.last || 0) + 1);
        tx.set(ref, { last: next });
        return next;
      });
    },
    async reserveClientQuoteNumber(clientId, year, minimum) {
      if (!/^\d{8,11}$/.test(clientId) || !/^20\d{2}$/.test(String(year)) || !Number.isInteger(minimum) || minimum < 1 || minimum > 999999)
        throw Error("Revisa el cliente y la numeración.");
      const ref = doc(firestore, prefix + "/quoteSequences/" + clientId + "-" + year);
      return reserveWithRetry(() => runTransaction(firestore, async tx => {
        const snapshot = await tx.get(ref);
        const next = Math.max(minimum, (snapshot.data()?.last || 0) + 1);
        if (next > 999999) throw Error("La numeración excede el límite.");
        tx.set(ref, { last: next });
        return next;
      }));
    },
    // Una serie por emisor, compartida por todos sus clientes y sin reinicio anual.
    async reserveIssuerQuoteNumber(issuerId, minimum) {
      if (!/^[a-z0-9]{2,20}$/.test(issuerId) || !Number.isInteger(minimum) || minimum < 1 || minimum > 999999)
        throw Error("Revisa el emisor y la numeración.");
      const ref = doc(firestore, prefix + "/quoteSequences/emisor-" + issuerId);
      return reserveWithRetry(() => runTransaction(firestore, async tx => {
        const snapshot = await tx.get(ref);
        const next = Math.max(minimum, (snapshot.data()?.last || 0) + 1);
        if (next > 999999) throw Error("La numeración excede el límite.");
        tx.set(ref, { last: next });
        return next;
      }));
    },
    async saveBankAccounts(bankAccounts) {
      const ref = doc(firestore, prefix + "/settings/quoteLibrary");
      await runTransaction(firestore, async tx => {
        const current = await tx.get(ref);
        tx.set(ref, { ...(current.data() || {}), bankAccounts });
      });
    },
    watch(receive, onError) {
      const stop = groups().map(group =>
        onSnapshot(sourceFor(group), { includeMetadataChanges: true }, snapshot => {
          if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
          receive(group, snapshot.docs.map(snap => ({ path: snap.ref.path, ...snap.data() })));
        }, onError));
      if (user.role !== "tecnico") stop.push(onSnapshot(doc(firestore, prefix + "/settings/quoteLibrary"), snapshot => {
        if (!snapshot.metadata.fromCache) receive("quoteLibrary", snapshot.data() || {});
      }, onError));
      return () => stop.forEach(unsubscribe => unsubscribe());
    },
    mergeRemote(data, group, records) {
      if (group === "quoteLibrary") {
        const changed = JSON.stringify(data.quoteLibrary || {}) !== JSON.stringify(records);
        data.quoteLibrary = records;
        return changed;
      }
      let changed = false;
      const merged = new Map(data[group].map(item => [key(group, item), item]));
      const visible = new Set();
      for (const record of records) {
        visible.add(record.path);
        if (record.revision <= (revisions.get(record.path) || 0)) continue;
        const item = record.payload;
        merged.set(record.path, item);
        baseline.set(record.path, JSON.stringify(item));
        revisions.set(record.path, record.revision);
        changed = true;
      }
      if (group === "tickets" && user.role === "tecnico") {
        for (const path of merged.keys()) {
          if (visible.has(path)) continue;
          merged.delete(path);
          baseline.delete(path);
          revisions.delete(path);
          changed = true;
        }
      }
      if (changed) data[group] = [...merged.values()];
      return changed;
    },
    async commit(data) {
      if (!user) throw Error("Sesión requerida");
      const changed = items(data).filter(
        (x) => baseline.get(x.path) !== JSON.stringify(x.item),
      );
      if (!changed.length) return;
      if (changed.length > 100)
        throw Error("Divide la operación en lotes más pequeños.");
      for (const x of changed) x.payload = await encode(x.item, x.group);
      const versions = await runTransaction(firestore, async (tx) => {
        const current = await Promise.all(
          changed.map((x) => tx.get(doc(firestore, x.path))),
        );
        const claims = [];
        for (let i = 0; i < changed.length; i++) {
          const x = changed[i],
            s = current[i],
            version = s.exists() ? s.data().revision : 0;
          if (version !== (revisions.get(x.path) || 0))
            throw Error(
              "Otro usuario modificó el registro. Recarga después de exportar tus cambios.",
            );
          if (x.group === "tickets" && x.payload.doc.number) {
            const claimRef = doc(
                firestore,
                prefix + "/invoices/" + x.payload.doc.number,
              ),
              claim = await tx.get(claimRef);
            if (claim.exists() && claim.data().ticketId !== x.payload.id)
              throw Error("El comprobante ya está asociado a otro trabajo.");
            claims.push({ ref: claimRef, ticketId: x.payload.id });
          }
        }
        for (const claim of claims)
          tx.set(claim.ref, { ticketId: claim.ticketId });
        const next = [];
        for (let i = 0; i < changed.length; i++) {
          const x = changed[i],
            revision = (revisions.get(x.path) || 0) + 1;
          tx.set(doc(firestore, x.path), {
            payload: x.payload,
            revision,
            updatedBy: auth.currentUser.uid,
            updatedAt: serverTimestamp(),
          });
          next.push(revision);
        }
        return next;
      });
      changed.forEach((x, i) => {
        baseline.set(x.path, JSON.stringify(x.item));
        revisions.set(x.path, versions[i]);
      });
    },
  };
}
