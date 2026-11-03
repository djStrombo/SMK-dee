// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Kerem Kilic (Ellic Studio)
// Melodee's installer session. Adapts Saadet's preflight, progress and recovery
// interaction to Melodee's loader identities, release channels and backup paths.
import { hold, busyElsewhere } from './keepalive.js';
import { progressModel, remaining, afterFailure } from './progress.js';

export function createInstallSession({ t }) {
  const $ = id => document.getElementById(id);
  const MARK = 'melodee-install-pending';
  let active = null, preparing = false;
  const read = () => { try { return JSON.parse(localStorage.getItem(MARK)); } catch { return null; } };
  const save = value => { try { value ? localStorage.setItem(MARK, JSON.stringify(value)) : localStorage.removeItem(MARK); } catch { /* device remains authoritative */ } };
  const banner = () => {
    const pending = read();
    $('resumebanner').hidden = !pending;
    $('resumetext').textContent = pending ? t('pendingInstall') + ' ' + pending.label : '';
  };
  const close = () => { if (!active) { $('run').close(); document.title = baseTitle; } };
  const baseTitle = document.title;
  $('run').addEventListener('cancel', e => { if (active) e.preventDefault(); });
  $('run-close').addEventListener('click', close);
  $('pfok').addEventListener('change', () => { $('pfgo').disabled = !$('pfok').checked; });
  banner();

  function preflight(backup) {
    const dialog = $('preflight'), form = dialog.querySelector('form');
    $('pfcheck').hidden = !backup;
    $('pfok').checked = false;
    $('pfgo').disabled = backup;
    dialog.showModal();
    (backup ? $('pfok') : $('pfgo')).focus();
    return new Promise(resolve => {
      const done = go => {
        form.removeEventListener('submit', submit);dialog.removeEventListener('cancel', cancel);
        dialog.close();resolve(go);
      };
      const submit = e => { e.preventDefault();if (e.submitter?.value !== 'go' || !backup || $('pfok').checked) done(e.submitter?.value === 'go'); };
      const cancel = e => { e.preventDefault();done(false); };
      form.addEventListener('submit', submit);dialog.addEventListener('cancel', cancel);
    });
  }
  function pct(value) {
    if (!active) return;
    active.pct = Math.max(active.pct, Math.min(100, Math.floor(value)));
    $('pct').textContent = active.pct;
    $('barfill').style.width = active.pct + '%';
    $('bar').setAttribute('aria-valuenow', active.pct);
    document.title = `${active.pct}% · ${t(document.visibilityState === 'hidden' ? 'comeBack' : 'installingTitle')}`;
  }
  function message(text) { if (active) $('runstep').textContent = text; }
  function phase(name) {
    if (!active) return;
    active.phase = name;
    const stages = ['prepare','write','restart'];
    document.querySelectorAll('#phases li').forEach(li => {
      const pos = stages.indexOf(li.dataset.ph), now = stages.indexOf(name);
      li.className = pos < now ? 'past' : pos === now ? 'now' : '';
    });
  }
  function step(k, n, bytes) {
    if (!active) return;
    active.lastAt = Date.now();$('stall').hidden = true;
    if (k === 'start') { phase('prepare');message(t('start')); }
    if (k === 'verify') { message(t('verify'));pct(active.pm.verify(bytes ?? n * 512)); }
    if (k === 'loader') {
      active.staged = true;save({ key: active.key, label: active.label });
      message(t('loader'));
    }
    if (k === 'write') {
      active.staged = true;save({ key: active.key, label: active.label });
      phase('write');message(t('write'));pct(active.pm.writing(bytes ?? n * 512));
      if (!active.writeAt) active.writeAt = Date.now();
      const seconds = remaining(bytes ?? n * 512, active.pm.write, Date.now() - active.writeAt);
      $('eta').textContent = seconds == null ? '' : seconds < 60 ? t('etaSoon') : `${Math.ceil(seconds / 60)} ${t('etaMinutes')}`;
    }
    if (k === 'reboot') { phase('restart');message(t('reboot'));pct(99);$('eta').textContent = ''; }
  }
  async function begin({ key, label, image, resume = false, backup = false, onResume }) {
    if (active || preparing) return false;
    preparing = true;
    let release;
    try {
      const pending = read();
      if (resume && pending?.key && pending.key !== key) {
        throw Object.assign(new Error(t('differentPending') + ' ' + pending.label), { code: 'pending' });
      }
      release = await hold({leaveText:t('leave'),
        onHidden:() => { if (active) { active.hiddenPct = active.pct;pct(active.pct); } },
        onVisible:ms => {
          if (!active) return;
          pct(active.pct);
          if (ms >= 1500) {
            $('backtext').textContent = t(active.pct > active.hiddenPct ? 'backgroundKept' : 'backgroundSlow');
            $('backnote').hidden = false;
          }
        }});
      if (!release) throw Object.assign(new Error(t('busy')), { code:'busy' });
      if (!await preflight(backup)) { release();return false; }
      active = {key,label,image,release,onResume,pct:0,phase:'prepare',pm:progressModel(image,resume),staged:resume,lastAt:Date.now()};
      if (resume) save({key,label});
      $('run').dataset.state = 'running';$('end').hidden = true;
      $('legacy-actions').hidden = false;$('endactions').replaceChildren();
      document.querySelectorAll('#phases li').forEach(li => { li.hidden = li.dataset.ph === 'boot'; });
      $('backnote').hidden = $('stall').hidden = true;$('eta').textContent = '';
      $('log').textContent = '';$('runtitle').textContent = label;
      $('run-close').hidden = true;$('run-resume').hidden = true;
      $('run').showModal();phase('prepare');pct(0);message(t('start'));
      active.timer = setInterval(() => { if (active) $('stall').hidden = Date.now() - active.lastAt < 12000; }, 1000);
      return true;
    } catch (error) { if (release) release();throw error; }
    finally { preparing = false; }
  }
  function finish(ok, error) {
    if (!active) return;
    const run = active;
    let state = ok ? 'done' : afterFailure(error?.code, run.staged ? 'staged' : 'start');
    if (!ok && run.phase === 'restart') state = 'restart';
    if (ok) { pct(100);save(null); }
    $('run').dataset.state = state;$('end').hidden = false;
    $('endicon').setAttribute('href', ok ? '#i-check' : state === 'safe' ? '#i-info' : '#i-alert');
    $('endtitle').textContent = t('end_' + state);
    $('endtext').textContent = ok ? run.label + '. ' + t('installedVerified') : error?.message || t('stopped');
    $('endtips').textContent = t('tip_' + state);
    $('run-close').hidden = false;
    $('run-resume').hidden = state !== 'paused';
    $('run-resume').onclick = () => { close();run.onResume?.(); };
    clearInterval(run.timer);
    active = null;
    run.release();document.title = ok ? t('done') + ' · Melodee' : baseTitle;
    banner();$('run-close').focus();
  }
  function resume() {
    if (!active) throw new Error('No install session');
    const pending = read();
    if (pending?.key && pending.key !== active.key)
      throw Object.assign(new Error(t('differentPending') + ' ' + pending.label), {code:'pending'});
    active.pm = progressModel(active.image, true);
    active.staged = true;save({key:active.key,label:active.label});
  }
  async function probe(fn) {
    const release = await hold();
    if (!release) throw new Error(t('busy'));
    try { return await fn(); } finally { release(); }
  }
  return {begin,step,message,finish,resume,probe,busy:busyElsewhere};
}
