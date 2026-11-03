// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Kerem Kilic (Ellic Studio)
// Run the actual installer UI script with a minimal DOM and controlled fetches.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const template = readFileSync(new URL("index_pkg.html", import.meta.url), "utf8");
class Element {
  constructor() { this.listeners = {}; this.options = []; this.value = ""; this.textContent = ""; this.checked = false; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  replaceChildren(...options) { this.options = options; this.value = options.find(o => o.selected)?.value || options[0]?.value || ""; }
}
const elements = Object.fromEntries([...template.matchAll(/id="([^"]+)"/g)].map(m => [m[1], new Element()]));
elements["build-dual"].checked = true;
elements.log.scrollHeight = 777;
const releases = [
  {version: "1.3.2", product: "new", pkg: {dual: "new-dual"}},
  {version: "1.2.1", product: "old", pkg: {dual: "old-dual"}},
];
const meta = {...releases[0], releases, rc: {version: "1.4.0-rc.1", product: "rc", pkg: {dual: "rc-dual"}}, nightly: null};
const pending = [];
const context = vm.createContext({
  document: {documentElement: {}, getElementById: id => elements[id], querySelectorAll: () => [], createElement: () => new Element()},
  navigator: {language: "en", requestMIDIAccess: () => {}},
  window: {addEventListener: () => {}},
  fetch: url => new Promise(resolve => pending.push({url, resolve})),
  logicalImage: bytes => bytes,
  productOf: bytes => ["new", "old", "rc"][bytes[0]],
  Uint8Array,
});
const script = template.match(/<script type="module">([\s\S]*?)<\/script>/)[1]
  .replace("/*LIB*/", "").replace("/*META*/{}", JSON.stringify(meta));
vm.runInContext(script, context);
const tick = () => new Promise(resolve => setImmediate(resolve));
async function finish(request, product, marker) {
  request.resolve({ok: true, arrayBuffer: async () => Uint8Array.of(product, marker).buffer});
  await tick();
}
function selectBuild(kind) {
  for (const id of Object.keys(elements).filter(id => id.startsWith("build-"))) elements[id].checked = id === "build-" + kind;
}

assert.equal(elements.release.options.length, 2);
assert.equal(elements.release.value, "1.3.2");
assert.equal(pending[0].url, "new-dual");
await finish(pending.shift(), 0, 10);
assert.equal(vm.runInContext("image[1]", context), 10);

elements.release.value = "1.2.1";
elements.release.listeners.change();
assert.equal(elements.go.disabled, true);
assert.equal(pending[0].url, "old-dual");
await finish(pending.shift(), 1, 20);
assert.equal(vm.runInContext("image[1]", context), 20);
assert.match(elements.status.textContent, /1\.2\.1/);

elements.lang.listeners.click();
assert.equal(elements.release.value, "1.2.1");
assert.match(elements.status.textContent, /1\.2\.1/);
elements.lang.listeners.click();

selectBuild("rc-dual"); elements["build-rc-dual"].listeners.change();
const rcRequest = pending.shift();
selectBuild("dual"); elements.release.value = "1.3.2"; elements.release.listeners.change();
await tick();
assert.equal(vm.runInContext("image[1]", context), 10); // cached current release, not cached historical dual
await finish(rcRequest, 2, 30);
assert.equal(vm.runInContext("image[1]", context), 10); // stale RC fetch cannot replace stable selection

vm.runInContext("lockInstaller(true)", context);
assert.equal(elements.release.disabled, true);
assert.equal(elements["build-rc-dual"].disabled, true);
elements.release.listeners.change();
assert.equal(pending.length, 0);
vm.runInContext('log("write 123")', context);
assert.equal(elements.log.scrollTop, 777);
assert.match(template, /max-height: 200px; overflow-y: auto/);
assert.doesNotMatch(template, /Melodee 1\.0/);
assert.doesNotMatch(template, /build-(?:rc-|nightly-)?single|singleWhy|fallback-options/);
console.log("installer: dual-core release/channel selection, cache separation, fetch races, language, write lock and scrolling passed");
