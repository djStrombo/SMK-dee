// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Kerem Kilic (Ellic Studio)
// The actual installer script: leaving Melodee for Transit, before the next firmware.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {mockInstallSession,strip} from "./installer_test_helpers.mjs";
import {fetchTransitPackage, TRANSIT_RELEASE, logicalImage, productOf} from "./fm1pkg.js";
import {MELODEE_LOADER, STOCK_LOADER} from "./fm1ota.js";

await assert.rejects(fetchTransitPackage(async () => ({ok:false, status:404})), /HTTP 404/);
await assert.rejects(fetchTransitPackage(async () => ({ok:true, arrayBuffer:async () => new ArrayBuffer(1)})), /verified release/);
// A file with the right length and identity still fails the pinned SHA-256 check.
const bogus = new Uint8Array(TRANSIT_RELEASE.size).fill(0x7d);
for (let i = 0; i < TRANSIT_RELEASE.product.length; i++) bogus[i * 48 + 47] = TRANSIT_RELEASE.product.charCodeAt(i) + i + 1;
assert.equal(productOf(bogus), TRANSIT_RELEASE.product);
await assert.rejects(fetchTransitPackage(async () => ({ok:true, arrayBuffer:async () => bogus.buffer})), /verified release/);
if (process.argv[2]) {
  const bytes = new Uint8Array(readFileSync(process.argv[2]));
  const pkg = await fetchTransitPackage(async (url, options) => {
    assert.equal(url, TRANSIT_RELEASE.url); assert.equal(options.cache, "no-cache");
    return {ok:true, arrayBuffer:async () => bytes.buffer};
  });
  assert.equal(pkg.product, "FM-1_015");
  assert.deepEqual(pkg.image, logicalImage(bytes));
  const damaged = bytes.slice(); damaged[50000] ^= 1;
  await assert.rejects(fetchTransitPackage(async () => ({ok:true, arrayBuffer:async () => damaged.buffer})), /verified release/);
  console.log("TransitFM1: published package and damaged-copy rejection passed");
}

const template = readFileSync(new URL("index_pkg.html", import.meta.url), "utf8");
const script = strip(readFileSync(new URL("install/leave.js",import.meta.url),"utf8")) + `
setupLeaving({getLanguage:()=>"en",isBusy:()=>writing,setBusy:on=>{writing=on;for(const id of ["go","release","build-dual"])document.getElementById(id).disabled=on;},log:()=>{}});`;

async function run({skip=false, loader=null, recovery=false, supported=true, confirm=true, backupError=false,
                    packageError=false, midiError=false, installError=null, resumed=true, beforeComplete=null} = {}) {
  const calls = [], writes = [], elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {checked:id === "build-dual", disabled:false, textContent:"", options:[], listeners:{},
      replaceChildren(...options) { this.options = options; this.value = options[0]?.value; },
      addEventListener(k, fn) { this.listeners[k] = fn; }, head:{from:0,to:0}});
    return elements.get(id);
  };
  const context = vm.createContext({
    Uint8Array, Blob, writing:false, setTimeout:() => 0,
    navigator:{language:"en", requestMIDIAccess:async () => { if (midiError) throw Error("denied"); return {}; }},
    document:{documentElement:{}, querySelectorAll:() => [], getElementById:element,
      body:{append() {}}, createElement:() => ({click() { calls.push("save"); }, remove() {}})},
    window:{addEventListener() {}},
    URL:{createObjectURL:() => "blob:test", revokeObjectURL() {}},
    fetch:async () => ({ok:true, arrayBuffer:async () => Uint8Array.of(2).buffer}),
    productOf:() => "FM-1_91041", logicalImage:bytes => bytes, MELODEE_LOADER, STOCK_LOADER,
    fetchTransitPackage:async () => {
      calls.push("verify-package"); if (packageError) throw Error("TransitFM1: invalid package");
      return {product:"FM-1_015", image:Uint8Array.of(3)};
    },
    confirm:message => { calls.push("confirm", message); return confirm; },
    sha256hex:async()=>"", validateStockPackage:async()=>{}, STOCK_V15_SIZE:0,
    BackupConnection:class {
      constructor() { calls.push("backup-open"); }
      async request() {
        return [...Buffer.from("MELODEE v1.4.1"),0,0,92,0,64,84,4,
          ...(supported ? [16,0x55,1,0,0x4d,2,64,1,0x42,1,1] : [])];
      }
      close() { calls.push("backup-close"); }
    },
    captureBackup:async () => { calls.push("backup"); if (backupError) throw Error("Backup failed"); return {}; },
    Updater:class {
      constructor() { calls.push("updater"); }
      async find(filter) {
        const id = loader ? {model:"ota-FM-1", text:loader} : {model:"FM-1", text:"FM-1_91041"};
        return filter(id) ? {id, link:{input:{}, output:{}, close() {}}} : null;
      }
      async install(image, product, step, own) {
        calls.push("install"); writes.push([image[0], product, own]);
        if (beforeComplete) await beforeComplete({element, context, calls});
        if (installError) throw installError;
        step("done");
      }
      async resume(image, step, product, own) { calls.push("resume"); writes.push([image[0], product, own]); return resumed; }
    },
  });
  mockInstallSession(context);
  vm.runInContext(script, context);
  await new Promise(resolve => setImmediate(resolve));
  element("transit-skip-backup").checked = skip;
  element("transit-recovery").checked = recovery;
  element("transit-skip-backup").listeners.change();
  const label = element("transit-go").textContent;
  await element("transit-go").listeners.click();
  assert.equal(element("transit-go").disabled, false);
  assert.equal(element("transit-skip-backup").disabled, false);
  return {calls, writes, label, status:element("status").textContent, element};
}
const expected = [[3, "FM-1_015", MELODEE_LOADER]];
let r = await run();
assert.deepEqual(r.writes, expected);
assert.ok(r.calls.indexOf("verify-package") < r.calls.indexOf("backup"));
assert.ok(r.calls.indexOf("backup") < r.calls.indexOf("save"));
assert.ok(r.calls.indexOf("save") < r.calls.indexOf("confirm"));
assert.ok(r.calls.indexOf("confirm") < r.calls.indexOf("install"));
assert.match(r.status, /TransitFM1 installed.*next firmware/);
assert.match(r.label, /Back up/);
r = await run({skip:true});
assert.deepEqual(r.writes, expected);
assert.ok(!r.calls.includes("backup-open"));
assert.ok(r.calls.some(s => s.includes("without creating a backup")));
assert.match(r.label, /without backup/);
for (const opts of [{supported:false}, {backupError:true}, {confirm:false}, {packageError:true}, {midiError:true}]) {
  r = await run(opts);
  assert.deepEqual(r.writes, []);
  if (opts.packageError) assert.ok(!r.calls.includes("updater"));
  if (opts.backupError || opts.supported === false) assert.ok(r.calls.includes("backup-close"));
}
for (const opts of [{loader:MELODEE_LOADER, skip:true}, {loader:MELODEE_LOADER, recovery:true}]) {
  r = await run(opts);
  assert.deepEqual(r.writes, expected); assert.ok(r.calls.includes("resume"));
  assert.match(r.status, /TransitFM1 installed/);
}
for (const loader of [STOCK_LOADER, "ota-FM-1_123"]) {
  r = await run({loader, skip:true, recovery:true});
  assert.deepEqual(r.writes, []); assert.ok(!r.calls.includes("confirm"));
}
r = await run({loader:MELODEE_LOADER});
assert.deepEqual(r.writes, []); assert.match(r.status, /Skip backup/);
r = await run({loader:MELODEE_LOADER, skip:true, resumed:false});
assert.match(r.status, /Stopped/);
r = await run({skip:true, installError:Object.assign(Error("lost"), {code:"lost"})});
assert.match(r.status, /connection was lost/);
await run({skip:true, beforeComplete:async ({element, context, calls}) => {
  for (const id of ["go", "stock-go", "stock-file", "transit-go", "transit-skip-backup", "transit-recovery", "release", "build-dual"])
    assert.equal(element(id).disabled, true, `${id} locked during Transit install`);
  await element("go").listeners.click();
  await element("stock-go").listeners.click();
  await element("transit-go").listeners.click();
  assert.equal(calls.filter(c => c === "install").length, 1);
  assert.equal(vm.runInContext("writing", context), true);
}});
console.log("TransitFM1: backup ordering, opt-out, cancellation, validation failure, loader isolation, resume, errors and write lock passed");
