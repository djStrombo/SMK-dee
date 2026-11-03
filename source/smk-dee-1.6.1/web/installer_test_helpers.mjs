// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Kerem Kilic (Ellic Studio)
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
export const template=readFileSync(new URL('index_pkg.html',import.meta.url),'utf8');
export const strip=source=>source.replace(/^import .*?;\s*$/gm,'').replace(/^export /gm,'');
export const controllerSource=strip(readFileSync(new URL('install/installer.js',import.meta.url),'utf8'));
export function pageDOM(){
 const page=new JSDOM(template.replace(/<script type="module">[\s\S]*?<\/script>/,''),{url:'https://example.test/webapp/installer/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=page.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 w.TextEncoder=TextEncoder;
 return page;
}
export function mockInstallSession(context) {
 context.SteadyUpdater=context.Updater;
 context.createInstallSession=()=>({begin:async()=>true,step(){},message(){},finish(){},resume(){},probe:fn=>fn(),busy:async()=>false});
}
