const {chromium}=require("playwright"),assert=require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({channel:"msedge",headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4173");
 const yy=await page.evaluate(()=>iso().slice(2,4));
 // Datos ficticios: dos emisores, cada uno con su serie, y tres clientes.
 await page.evaluate(()=>{
   const a={id:"12345678",type:"dni",name:"CLIENTE FICTICIO A"},b={id:"20999999991",type:"ruc",name:"CLIENTE FICTICIO B"},c={id:"87654321",type:"dni",name:"CLIENTE FICTICIO C"};
   db.clients.unshift(a,b,c);
   db.quoteLibrary={templates:[{id:"test",label:"Mantenimiento de radiador",body:"Limpieza interior y exterior.\nPrueba según evaluación.",notes:"El alcance depende de la evaluación.",sources:[]}],
    issuers:[{id:"sac",name:"EMISOR UNO DE PRUEBA",ruc:"20000000001",lastNumber:800},{id:"pn",name:"EMISOR DOS DE PRUEBA",ruc:"10000000001",lastNumber:5000}],
    profiles:{[a.id]:{format:"detailed",presentation:"base",overheadPercent:16,series:{last:7,year:2025}},[b.id]:{issuer:"pn",presentation:"base",paymentDays:30}},
    costCatalog:[{group:"Mano de obra",desc:"Técnico de prueba",unit:"hora",price:10}],
    bankAccounts:[{holder:"TITULAR DE PRUEBA SIN VALIDEZ",bank:"BANCO TEST",currency:"Soles",account:"00000000000000",cci:"000 00000000000000000"}]};
   newQuote();selectQuoteCompany(a.id);
 });
 // La serie es del emisor (800 → 801); el antecedente por cliente ya no cuenta.
 assert.equal(await page.locator("#quote-next-number").inputValue(),"801");
 assert.equal(await page.evaluate(()=>ticket(modal).quote.overheadPercent),16);
 await page.selectOption("#service-template","test");
 await page.getByRole("button",{name:"Usar plantilla",exact:true}).click();
 // Presupuesto por costos: la plantilla no añade líneas de servicio; los conceptos salen del catálogo.
 assert.equal(await page.evaluate(()=>ticket(modal).quote.lines.filter(l=>l.desc).length),0);
 await page.selectOption(".quote-cost-picker select",{index:1});
 assert.deepEqual(await page.evaluate(()=>{const l=ticket(modal).quote.lines[0];return [l.desc,l.costGroup,l.unit,l.price];}),["Técnico de prueba","Mano de obra","hora",10]);
 await page.fill("#lq0","50");await page.locator("#lq0").blur();
 assert.equal(await page.evaluate(()=>calc(ticket(modal)).gross),684.4);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Descargar cotización PDF"}).click()]);
 await download.saveAs("test-results/quote-assistant-base.pdf");
 assert.match(download.suggestedFilename(),new RegExp("^801-"+yy));
 const first=await page.evaluate(()=>modal);
 assert.deepEqual(await page.evaluate(()=>{const q=ticket(modal).quote;return [q.number.split("-")[0],q.issuerId,q.issuerName];}),["801","sac","EMISOR UNO DE PRUEBA"]);
 // Otro cliente del mismo emisor continúa la misma serie.
 await page.evaluate(()=>{newQuote();selectQuoteCompany("87654321");});
 assert.equal(await page.locator("#quote-next-number").inputValue(),"802");
 // Plantilla incorporada: dos ítems, alcance con pruebas de presión y nota general.
 await page.selectOption("#service-template","lx-radiador-intercooler");
 await page.getByRole("button",{name:"Usar plantilla",exact:true}).click();
 const built=await page.evaluate(()=>{const q=ticket(modal).quote;return {lines:q.lines.map(l=>l.desc),body:q.annex.body,notes:q.annex.notes};});
 assert.equal(built.lines.length,2);
 assert.match(built.body,/15 psi[\s\S]*25 psi/);
 assert.match(built.notes,/costos calculados son variables/);
 await page.evaluate(()=>{addFrequentNote(0);addFrequentNote(0);addFrequentItem(1);});
 assert.equal(await page.evaluate(()=>ticket(modal).quote.annex.notes.split("\n").length),2);
 assert.equal(await page.evaluate(()=>ticket(modal).quote.lines.length),3);
 // Cliente del segundo emisor: otra serie, sin IGV, crédito a 30 días y su razón social en el PDF.
 await page.evaluate(()=>{newQuote();selectQuoteCompany("20999999991");});
 assert.equal(await page.locator("#quote-next-number").inputValue(),"5001");
 assert.deepEqual(await page.evaluate(()=>{const t=ticket(modal);return [t.quote.presentation,quoteIssuerPrint(t).name,/30/.test(t.quote.conditions.payment)];}),["base","EMISOR DOS DE PRUEBA",true]);
 await page.evaluate(()=>{const t=ticket(modal);t.quote.lines[0]={desc:"Servicio de prueba",qty:1,price:100};save();renderTicketModal();});
 const [second]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Descargar cotización PDF"}).click()]);
 await second.saveAs("test-results/quote-assistant-emisor2.pdf");
 assert.match(second.suggestedFilename(),new RegExp("^5001-"+yy));
 // El número ya asignado se conserva y fija al emisor.
 await page.evaluate(id=>{openTicket(id,"evaluacion");changeQuoteOption("presentation","total");},first);
 const [total]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Descargar cotización PDF"}).click()]);
 await total.saveAs("test-results/quote-assistant-total.pdf");
 assert.match(total.suggestedFilename(),new RegExp("^801-"+yy));
 // Número escrito a mano en la cabecera: mayor → la serie sigue desde él; menor → se usa sin mover la serie.
 const manual=await page.evaluate(async()=>{
   const run=async n=>{newQuote();selectQuoteCompany("87654321");const f=document.getElementById("quote-next-number");f.value=String(n);setNextQuoteNumber(f);const t=ticket(modal);await ensureQuoteNumber(t);return t.quote.number.split("-")[0];};
   const high=await run(850);newQuote();selectQuoteCompany("87654321");const after=document.getElementById("quote-next-number").value;
   const low=await run(700);newQuote();selectQuoteCompany("87654321");const afterLow=document.getElementById("quote-next-number").value;
   return {high,after,low,afterLow};
 });
 assert.deepEqual(manual,{high:"850",after:"851",low:"700",afterLow:"851"});
 // Cuentas: todas son opciones; se imprimen solo las marcadas, en el orden del catálogo.
 const banks=await page.evaluate(()=>{
   db.quoteLibrary.bankAccounts=[{holder:"TITULAR A",bank:"BANCO A",currency:"Soles",account:"111",cci:"",issuer:"sac"},{holder:"TITULAR B",bank:"BANCO B",currency:"Soles",account:"222",cci:""},{holder:"TITULAR C",bank:"BILLETERA",currency:"Soles",account:"333",cci:"",preselect:true}];
   newQuote();selectQuoteCompany("87654321");
   const marked=()=>ticket(modal).quote.bankAccounts.map(a=>a.account).join(",");
   const start=marked(),boxes=document.querySelectorAll(".quote-bank-option input").length;
   toggleQuoteBank(0,true);const two=marked();
   toggleQuoteBank(2,false);const one=marked();
   return {start,boxes,two,one};
 });
 assert.deepEqual(banks,{start:"333",boxes:3,two:"111,333",one:"111"});
 await page.screenshot({path:"test-results/quote-assistant-mobile.png",fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log("PASS: issuer series shared across clients, client profiles, built-in templates, notes, cost catalogue, PDFs, mobile.");
})().catch(e=>{console.error(e);process.exit(1)});
