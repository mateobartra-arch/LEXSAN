const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs");
(async()=>{
 const browser=await chromium.launch({channel:"msedge",headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4173");
 await page.evaluate(()=>{
   const c={id:"12345678",type:"dni",name:"CLIENTE FICTICIO PARA PRUEBAS"}; db.clients.unshift(c);
   db.quoteLibrary={templates:[{id:"test",label:"Mantenimiento de radiador",body:"Limpieza interior y exterior.\nPrueba según evaluación.",notes:"El alcance depende de la evaluación.",sources:[]}],
    profiles:{[c.id]:{format:"detailed",presentation:"base",series:{last:80,year:2025}}},
    bankAccounts:[{holder:"TITULAR DE PRUEBA SIN VALIDEZ",bank:"BANCO TEST",currency:"Soles",account:"00000000000000",cci:"000 00000000000000000"}]};
   newQuote();selectQuoteCompany(c.id);
 });
 assert.equal(await page.locator("#quote-next-number").inputValue(),"81");
 await page.selectOption("#service-template","test");
 await page.getByRole("button",{name:"Usar plantilla",exact:true}).click();
 await page.fill("#lp0","500");await page.locator("#lp0").blur();
 assert.equal(await page.evaluate(()=>calc(ticket(modal)).gross),590);
 await page.evaluate(()=>{ticket(modal).quote.overheadPercent=16;renderTicketModal();});
 assert.equal(await page.evaluate(()=>calc(ticket(modal)).gross),684.4);
 await page.getByRole("button",{name:"Usar plantilla",exact:true}).click();
 assert.equal(await page.evaluate(()=>ticket(modal).quote.lines.length),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Descargar cotización PDF"}).click()]);
 await download.saveAs("test-results/quote-assistant-base.pdf");
 assert.match(download.suggestedFilename(),/^81-26/);
 const current=await page.evaluate(()=>modal);
 await page.evaluate(async()=>{const t=ticket(modal);await ensureQuoteNumber(t);});
 assert.equal(await page.evaluate(()=>ticket(modal).quote.number),"81-26");
 await page.evaluate(()=>{newQuote();selectQuoteCompany(db.clients[0].id);});
 assert.equal(await page.locator("#quote-next-number").inputValue(),"82");
 await page.evaluate(id=>{openTicket(id,"evaluacion");changeQuoteOption("presentation","total");},current);
 const [total]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Descargar cotización PDF"}).click()]);
 await total.saveAs("test-results/quote-assistant-total.pdf");
 await page.screenshot({path:"test-results/quote-assistant-mobile.png",fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log("PASS: private templates, client sequence, two PDF presentations, bank snapshot, mobile.");
})().catch(e=>{console.error(e);process.exit(1)});

