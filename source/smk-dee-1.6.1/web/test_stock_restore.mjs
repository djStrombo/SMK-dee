// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Kerem Kilic (Ellic Studio)
// Return to official V15 sends the user's original vendor file unchanged (optional checks
// against that file, never redistributed): no application-only restore package.
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import * as fm1pkg from "./fm1pkg.js";

const {Package, logicalImage, validateStockPackage} = fm1pkg;
assert.equal(fm1pkg.buildStockRestorePackage, undefined);
const stockPath = new URL("../FM-1_v15.fwsc", import.meta.url);
if (!existsSync(stockPath)) {
  console.log("stock restore package: no restore builder; file checks skipped (needs FM-1_v15.fwsc)");
} else {
  const stock = new Uint8Array(readFileSync(stockPath)), pkg = new Package(stock);
  const verified = await validateStockPackage(stock);
  assert.equal(verified.product, "FM-1_015");
  assert.deepEqual(verified.image, logicalImage(stock));
  // the range Melodee compares with the device's boot data before it starts the official loader
  assert.equal(verified.head.to - verified.head.from, 0x4000);
  assert.deepEqual(verified.image.subarray(verified.head.from, verified.head.to), pkg.flash.subarray(0, 0x4000));
  // what the official loader installs besides flash.bin: USR, isd_config.ini, and the loader itself
  assert.equal(pkg.entries.find(e => e.type === 50)?.size, 73226);
  assert.ok(pkg.entries.some(e => e.type === 52));
  assert.ok(pkg.entries.some(e => e.type === 100 && e.name === "ota.bin"));
  const modified = stock.slice(); modified[50000] ^= 1;
  await assert.rejects(validateStockPackage(modified), /unmodified official/);
  console.log("stock restore package: unmodified V15 image, CHECK HEAD range, USR/isd_config/loader entries passed");
}
