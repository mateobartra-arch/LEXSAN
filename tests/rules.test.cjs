const { reserveWithRetry } = require("../assets/js/sequence-retry.mjs");
const { test, before, after } = require("node:test");
const fs = require("node:fs");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { doc, setDoc, getDoc, runTransaction, serverTimestamp } = require("firebase/firestore");
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-lexsan",
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/admin"), {
      organization: "lexsan",
      active: true,
      role: "gerencia",
    });
    await setDoc(doc(db, "users/tech"), {
      organization: "lexsan",
      active: true,
      role: "tecnico",
    });
    await setDoc(doc(db, "users/outsider"), {
      organization: "other",
      active: true,
      role: "gerencia",
    });
    await setDoc(doc(db, "organizations/lexsan/clients/12345678"), {
      payload: { id: "12345678", name: "Cliente" },
      revision: 1,
    });
  });
});
after(async () => env?.cleanup());
test("anonymous and other organization cannot read clients", async () => {
  for (const ctx of [
    env.unauthenticatedContext(),
    env.authenticatedContext("outsider"),
  ])
    await assertFails(
      getDoc(doc(ctx.firestore(), "organizations/lexsan/clients/12345678")),
    );
});
test("active office member can read; technician cannot change clients", async () => {
  await assertSucceeds(
    getDoc(
      doc(
        env.authenticatedContext("admin").firestore(),
        "organizations/lexsan/clients/12345678",
      ),
    ),
  );
  await assertFails(
    setDoc(
      doc(
        env.authenticatedContext("tech").firestore(),
        "organizations/lexsan/clients/12345678",
      ),
      {
        payload: { id: "12345678", name: "Changed" },
        revision: 2,
        updatedBy: "tech",
        updatedAt: serverTimestamp(),
      },
    ),
  );
});
test("a user cannot grant themselves management permissions", async () => {
  await assertFails(
    setDoc(doc(env.authenticatedContext("tech").firestore(), "users/tech"), {
      organization: "lexsan",
      active: true,
      role: "gerencia",
    }),
  );
});
test("two office sessions reserve different quote numbers", async () => {
  async function reserve(db) {
    const ref = doc(db, "organizations/lexsan/settings/quoteSequence");
    return runTransaction(db, async tx => {
      const snapshot = await tx.get(ref);
      const last = (snapshot.data()?.last || 0) + 1;
      tx.set(ref, { last });
      return last;
    });
  }
  const numbers = await Promise.all([
    reserve(env.authenticatedContext("admin").firestore()),
    reserve(env.authenticatedContext("admin").firestore()),
  ]);
  require("node:assert/strict").deepEqual(numbers.sort(), [1, 2]);
  await assertFails(reserve(env.authenticatedContext("tech").firestore()));
});
test("private quote catalogue and client sequences require office access", async () => {
  await env.withSecurityRulesDisabled(async ctx => {
    await setDoc(doc(ctx.firestore(),"organizations/lexsan/settings/quoteLibrary"),{templates:[{label:"Privado"}],bankAccounts:[]});
  });
  const path="organizations/lexsan/settings/quoteLibrary";
  for(const ctx of [env.unauthenticatedContext(),env.authenticatedContext("outsider"),env.authenticatedContext("tech")])
    await assertFails(getDoc(doc(ctx.firestore(),path)));
  const admin=env.authenticatedContext("admin").firestore();
  await assertSucceeds(getDoc(doc(admin,path)));
  await assertSucceeds(setDoc(doc(admin,path),{templates:[{label:"Privado"}],bankAccounts:[{bank:"Prueba"}]}));
  await assertFails(setDoc(doc(admin,path),{templates:[],bankAccounts:[]}));
  const sequence=doc(admin,"organizations/lexsan/quoteSequences/12345678-2026");
  await assertSucceeds(setDoc(sequence,{last:30}));
  await assertFails(setDoc(sequence,{last:29}));
  await Promise.all([1,2].map(()=>{ const session=env.authenticatedContext("admin").firestore(); const ref=doc(session,"organizations/lexsan/quoteSequences/12345678-2026"); return reserveWithRetry(()=>runTransaction(session,async tx=>{
    const d=await tx.get(ref);tx.set(ref,{last:d.data().last+1});
  }));}));
  if((await getDoc(sequence)).data().last!==32) throw Error("Sequence collision");
});
