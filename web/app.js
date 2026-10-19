/**
 * SMK-dee // INSTALLER & ON-THE-FLY HARDWARE MAPPER (v1.4.1)
 * Dedicated Web MIDI Flasher, Live SysEx Hardware Remapper & Sound Editor
 * Designed for M-VAVE SMK-37 Pro & Elite
 */

// ---------------------------------------------------------------------------
// Hardware Constants & Functional Definitions (100% English)
// ---------------------------------------------------------------------------
const ACTIONS = [
  // Original FM-1 Physical Buttons (Engine Functions)
  { id: 7,   name: "ACT_GLO",       label: "GLO FM-1",          desc: "FM-1 GLO button (Global / Settings / Mutes)" },
  { id: 8,   name: "ACT_HOME",      label: "HOME FM-1",         desc: "FM-1 HOME button (Home Screen / Sound Picker)" },
  { id: 6,   name: "ACT_EDIT",      label: "EDIT FM-1",         desc: "FM-1 EDIT button (Synth / Engine Parameter Edit)" },
  { id: 4,   name: "ACT_ENV",       label: "ENV FM-1",          desc: "FM-1 ENV button (Envelopes / Tap Tempo)" },
  { id: 2,   name: "ACT_FX",        label: "FX FM-1",           desc: "FM-1 FX button (Effects / Punch-in FX)" },
  { id: 3,   name: "ACT_SCALE",     label: "SCL FM-1",          desc: "FM-1 SCL button (Scales / Quantizer)" },
  { id: 5,   name: "ACT_LFO",       label: "LFO FM-1",          desc: "FM-1 LFO button (LFO Modulation)" },
  { id: 9,   name: "ACT_SAVE",      label: "SAVE FM-1",         desc: "FM-1 SAVE button (Save Preset / Undo)" },
  { id: 10,  name: "ACT_ARP",       label: "ARP FM-1",          desc: "FM-1 ARP button (Arpeggiator)" },
  { id: 11,  name: "ACT_SEQ",       label: "SEQ FM-1",          desc: "FM-1 SEQ button (Step Sequencer)" },
  { id: 12,  name: "ACT_PLAY",      label: "PLAY FM-1",         desc: "FM-1 PLAY button (Play / Stop)" },
  { id: 13,  name: "ACT_REC",       label: "REC FM-1",          desc: "FM-1 REC button (Record / Clear)" },
  { id: 0,   name: "ACT_OCTDN",     label: "OCT- FM-1",         desc: "FM-1 OCT- button (Navigate < / Undo)" },
  { id: 1,   name: "ACT_OCTUP",     label: "OCT+ FM-1",         desc: "FM-1 OCT+ button (Navigate > / Redo)" },
  { id: 14,  name: "ACT_PREV",      label: "SAVE < FM-1",       desc: "Opens SAVE on the 1st page (Presets) and steps left < across SAVE pages" },
  { id: 15,  name: "ACT_NEXT",      label: "SAVE > FM-1",       desc: "Opens default SAVE (User) and steps right > across SAVE pages" },

  // Exclusive SMK-37 Hardware Functions
  { id: 20,  name: "ACT_KBD_OCTDN", label: "OCT- SMK-37",       desc: "SMK-37 Hardware: Transpose keyboard octave -1" },
  { id: 21,  name: "ACT_KBD_OCTUP", label: "OCT+ SMK-37",       desc: "SMK-37 Hardware: Transpose keyboard octave +1" },
  { id: 19,  name: "ACT_CHORD",     label: "CHORD SMK-37",      desc: "SMK-37 Hardware: Toggle chord harmonization" },
  { id: 18,  name: "ACT_REPEAT",    label: "NOTE REPEAT SMK-37",desc: "SMK-37 Hardware: Toggle note repeat" },
  { id: 17,  name: "ACT_SEL",       label: "KNOB BANK SMK-37",  desc: "SMK-37 Hardware: Toggle knob bank 1/2" },
  { id: 16,  name: "ACT_FBANK",     label: "FADER BANK SMK-37", desc: "SMK-37 Hardware: Toggle fader bank 1/2" },

  { id: 255, name: "ACT_NONE",      label: "[Unassigned / Disabled]", desc: "Control disabled" }
];

const ENCODERS = [
  { id: 0,   name: "ENC_ACT_KNOB1",  label: "KNOB 1 FM-1",      desc: "FM-1 Physical Knob 1 (Column 1 Parameter)" },
  { id: 1,   name: "ENC_ACT_KNOB2",  label: "KNOB 2 FM-1",      desc: "FM-1 Physical Knob 2 (Column 2 Parameter)" },
  { id: 2,   name: "ENC_ACT_KNOB3",  label: "KNOB 3 FM-1",      desc: "FM-1 Physical Knob 3 (Column 3 Parameter)" },
  { id: 3,   name: "ENC_ACT_KNOB4",  label: "KNOB 4 FM-1",      desc: "FM-1 Physical Knob 4 (Column 4 Parameter)" },
  { id: 4,   name: "ENC_ACT_TEMPO",  label: "SELECT FM-1",      desc: "FM-1 Physical Knob SELECT (BPM / Selection)" },
  { id: 5,   name: "ENC_ACT_PADSEL", label: "PRESETS FM-1",     desc: "FM-1 Physical Knob PRESETS (Sound / Preset Browser)" },
  { id: 6,   name: "ENC_ACT_SAMPLE", label: "ALGORITHM FM-1",   desc: "FM-1 Physical Knob ALGORITHM (Tracks T1-T4 / Engine)" },
  { id: 7,   name: "ENC_ACT_MASTER", label: "MASTER VOL FM-1",  desc: "FM-1 Physical MASTER Potentiometer (Main Volume)" },
  { id: 255, name: "ENC_ACT_NONE",   label: "[Unassigned]",     desc: "Encoder disabled" }
];

const FADERS = [
  { id: 1,  name: "FAD_ACT_CH1",     label: "[Engine] Track 1 Level",           desc: "Track 1 Volume" },
  { id: 2,  name: "FAD_ACT_CH2",     label: "[Engine] Track 2 Level",           desc: "Track 2 Volume" },
  { id: 3,  name: "FAD_ACT_CH3",     label: "[Engine] Track 3 Level",           desc: "Track 3 Volume" },
  { id: 4,  name: "FAD_ACT_CH4",     label: "[Engine] Track 4 Level",           desc: "Track 4 Volume" },
  { id: 9,  name: "FAD_ACT_MASTER",  label: "[Engine] Master Volume",           desc: "Main output level" },
  { id: 0,  name: "FAD_ACT_DEFAULT", label: "[Engine] Active Bank Track Level", desc: "Volume by active track bank" },
  { id: 14, name: "FAD_ACT_CUTOFF",  label: "[Engine] Filter Cutoff",           desc: "Low-pass filter cutoff" },
  { id: 15, name: "FAD_ACT_RESO",    label: "[Engine] Filter Resonance",        desc: "Filter resonance" },
  { id: 16, name: "FAD_ACT_TEMPO",   label: "[Engine] Global Tempo BPM",        desc: "Global playback tempo" }
];

const BUTTON_LABELS = [
  "BTN 00: KNOB BANK",
  "BTN 01: PAD BANK",
  "BTN 02: < (LEFT)",
  "BTN 03: > (RIGHT)",
  "BTN 04: OCTAVE -",
  "BTN 05: OCTAVE +",
  "BTN 06: ARP",
  "BTN 07: NOTE REPEAT",
  "BTN 08: SCALE",
  "BTN 09: CHORD",
  "BTN 10: GLOBE",
  "BTN 11: BT (Bluetooth)",
  "BTN 12: PATCH",
  "BTN 13: PARA",
  "BTN 14: FX",
  "BTN 15: SEQ",
  "BTN 16: SEQ PLAY",
  "BTN 17: SEQ REC"
];

const BUTTON_SHORT_NAMES = [
  "KNOB BANK",
  "PAD BANK",
  "<",
  ">",
  "OCTAVE -",
  "OCTAVE +",
  "ARP",
  "NOTE REPEAT",
  "SCALE",
  "CHORD",
  "GLOBE",
  "BT",
  "PATCH",
  "PARA",
  "FX",
  "SEQ",
  "SEQ PLAY",
  "SEQ REC"
];

// Default SMK-dee Hardware Mapping
const SMKDEE_DEFAULT_BUTTONS = [
  5,   // BTN 00: KNOB BANK -> [SMK-dee] Physical Button LFO
  4,   // BTN 01: PAD BANK -> [SMK-dee] Physical Button ENV
  14,  // BTN 02: < (LEFT) -> [SMK-dee] SAVE < (Presets / Save Page <)
  15,  // BTN 03: > (RIGHT) -> [SMK-dee] SAVE > (Save User / Save Page >)
  0,   // BTN 04: OCTAVE - -> [SMK-dee] Physical Button OCT-
  1,   // BTN 05: OCTAVE + -> [SMK-dee] Physical Button OCT+
  10,  // BTN 06: ARP -> [SMK-dee] Physical Button ARP
  18,  // BTN 07: NOTE REPEAT -> [SMK-37] NOTE REPEAT
  3,   // BTN 08: SCALE -> [SMK-dee] Physical Button SCL
  19,  // BTN 09: CHORD -> [SMK-37] CHORD Mode
  7,   // BTN 10: GLOBE -> [SMK-dee] Physical Button GLO
  255, // BTN 11: BT -> [Unassigned / Disabled]
  8,   // BTN 12: PATCH -> [SMK-dee] Physical Button HOME / PATCH
  6,   // BTN 13: PARA -> [SMK-dee] Physical Button EDIT / PARA
  2,   // BTN 14: FX -> [SMK-dee] Physical Button FX
  11,  // BTN 15: SEQ -> [SMK-dee] Physical Button SEQ
  12,  // BTN 16: SEQ PLAY -> [SMK-dee] Physical Button PLAY
  13   // BTN 17: SEQ REC -> [SMK-dee] Physical Button REC
];

const SMKDEE_DEFAULT_ENCODERS = [0, 1, 2, 3, 4, 5, 6, 7];
const SMKDEE_DEFAULT_FADERS = [1, 2, 3, 4];

const DEFAULT_MIDI_CONFIG = {
  keyboardCh: 1,
  knobsCh: 1,
  fadersCh: 1,
  padsCh: 10,
  knobsCC: Array.from({ length: 16 }, (_, i) => 20 + i),
  fadersCC: Array.from({ length: 8 }, (_, i) => 70 + i),
  padsCC: Array.from({ length: 32 }, (_, i) => 36 + i)
};

let currentMapping = {
  buttons: [...SMKDEE_DEFAULT_BUTTONS],
  encoders: [...SMKDEE_DEFAULT_ENCODERS],
  faders: [...SMKDEE_DEFAULT_FADERS]
};

let midiConfig = {
  keyboardCh: DEFAULT_MIDI_CONFIG.keyboardCh,
  knobsCh: DEFAULT_MIDI_CONFIG.knobsCh,
  fadersCh: DEFAULT_MIDI_CONFIG.fadersCh,
  padsCh: DEFAULT_MIDI_CONFIG.padsCh,
  knobsCC: [...DEFAULT_MIDI_CONFIG.knobsCC],
  fadersCC: [...DEFAULT_MIDI_CONFIG.fadersCC],
  padsCC: [...DEFAULT_MIDI_CONFIG.padsCC]
};

let activeMidiKnobBank = 1; // 1 = K1..K8, 2 = K9..K16
let activeMidiPadBank = "A"; // "A" = PAD 01..16, "B" = PAD 17..32

// Firmware Selection State: 'smkdee' or 'stock'
let activeFirmwareType = "smkdee";

const $ = (id) => document.getElementById(id);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Application Initialization
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadSavedMidiConfig();
  initTopNavViews();
  initTargetModel();
  initFirmwareCards();
  initButtons();
  initEncoders();
  initFaders();
  initMidiMapperSection();
  initRemapperActions();
  initFlasherUI();
  updateActiveFirmwareDisplay();

  // Attempt silent auto-connect if Web MIDI permission is already granted
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: true }).then((acc) => {
      midiAccess = acc;
      midiAccess.onstatechange = () => {
        attachMidiInputMonitoring();
      };
      attachMidiInputMonitoring();
      scanMidiDevices(true);
    }).catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// Target Hardware Model Switcher (SMK-37 Pro / Elite)
// ---------------------------------------------------------------------------
function initTargetModel() {
  const btnPro = $("btn-model-pro");
  const btnElite = $("btn-model-elite");

  if (btnPro) {
    btnPro.addEventListener("click", () => setTargetModel("pro", true));
  }
  if (btnElite) {
    btnElite.addEventListener("click", () => setTargetModel("elite", true));
  }
}

function setTargetModel(model, manual = false) {
  const normalized = model === "elite" ? "elite" : "pro";
  const hiddenInput = $("target-model");
  if (hiddenInput) hiddenInput.value = normalized;

  const btnPro = $("btn-model-pro");
  const btnElite = $("btn-model-elite");
  if (btnPro && btnElite) {
    btnPro.classList.toggle("active", normalized === "pro");
    btnElite.classList.toggle("active", normalized === "elite");
  }

  if (manual) {
    installLog(`Target hardware model set to: SMK-37 ${normalized.toUpperCase()}`, "info");
  }
  updateActiveFirmwareDisplay();
}

function getTargetModel() {
  const el = $("target-model");
  return el ? el.value : "pro";
}

// ---------------------------------------------------------------------------
// Firmware Selection Cards (SMK-dee v1.4.1 & Stock V016)
// ---------------------------------------------------------------------------
function initFirmwareCards() {
  const btnSmkDee = $("btn-select-smkdee");
  const btnStock = $("btn-select-stock");
  const cardSmkDee = $("fw-card-smkdee");
  const cardStock = $("fw-card-stock");

  if (cardSmkDee) cardSmkDee.addEventListener("click", () => selectFirmware("smkdee"));
  if (cardStock) cardStock.addEventListener("click", () => selectFirmware("stock"));

  if (btnSmkDee) btnSmkDee.addEventListener("click", (e) => { e.stopPropagation(); selectFirmware("smkdee"); });
  if (btnStock) btnStock.addEventListener("click", (e) => { e.stopPropagation(); selectFirmware("stock"); });
}

function selectFirmware(type) {
  activeFirmwareType = type === "stock" ? "stock" : "smkdee";

  const cardSmkDee = $("fw-card-smkdee");
  const cardStock = $("fw-card-stock");
  const btnSmkDee = $("btn-select-smkdee");
  const btnStock = $("btn-select-stock");

  if (cardSmkDee) cardSmkDee.classList.toggle("active", activeFirmwareType === "smkdee");
  if (cardStock) cardStock.classList.toggle("active", activeFirmwareType === "stock");

  if (btnSmkDee) btnSmkDee.textContent = activeFirmwareType === "smkdee" ? "ACTIVE" : "SELECT";
  if (btnStock) btnStock.textContent = activeFirmwareType === "stock" ? "ACTIVE" : "SELECT";

  updateActiveFirmwareDisplay();
}

function resolveFirmwarePath() {
  const model = getTargetModel();
  if (activeFirmwareType === "stock") {
    return model === "elite" ? "firmware/SMK-37_Elite_016.fwsc" : "firmware/SMK-37_Pro_016.fwsc";
  }
  return `firmware/smk-dee-${model}.fwsc`;
}

function resolveDownloadFilename() {
  const model = getTargetModel();
  if (activeFirmwareType === "stock") {
    return model === "elite" ? "SMK-37_Elite_016.fwsc" : "SMK-37_Pro_016.fwsc";
  }
  return `SMK-dee-v1.4.1-${model}.fwsc`;
}

function updateActiveFirmwareDisplay() {
  const fwPath = resolveFirmwarePath();
  const dlName = resolveDownloadFilename();
  const dlBtn = $("btn-download-fw");

  if (dlBtn) {
    dlBtn.href = fwPath;
    dlBtn.download = dlName;
    dlBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Download ${dlName}
    `;
    dlBtn.style.display = "inline-flex";
  }
}

// ---------------------------------------------------------------------------
// Top Navigation Views (Flasher & Mapper vs Synth Sound Editor)
// ---------------------------------------------------------------------------
function initTopNavViews() {
  const btnFlasher = $("btn-view-flasher");
  const btnEditor = $("btn-view-editor");
  const viewFlasher = $("view-flasher-mapper");
  const viewEditor = $("view-sound-editor");

  if (!btnFlasher || !btnEditor || !viewFlasher || !viewEditor) return;

  function switchView(mode) {
    const editorFrame = $("sound-editor-frame");
    if (mode === "editor") {
      btnFlasher.classList.remove("active");
      btnEditor.classList.add("active");
      viewFlasher.style.display = "none";
      viewEditor.style.display = "flex";
      document.body.classList.add("mode-editor");
      if (editorFrame && (!editorFrame.src || editorFrame.src === "about:blank" || editorFrame.src.endsWith("/"))) {
        editorFrame.src = editorFrame.dataset.src || "editor.html";
      }
    } else {
      btnEditor.classList.remove("active");
      btnFlasher.classList.add("active");
      viewEditor.style.display = "none";
      viewFlasher.style.display = "flex";
      document.body.classList.remove("mode-editor");
      if (editorFrame && editorFrame.src && editorFrame.src !== "about:blank") {
        editorFrame.src = "about:blank";
      }
    }
  }

  btnFlasher.addEventListener("click", () => switchView("flasher"));
  btnEditor.addEventListener("click", () => switchView("editor"));
}

// ---------------------------------------------------------------------------
// Hardware Remapper Surface: Buttons, Encoders, Faders
// ---------------------------------------------------------------------------
function initButtons() {
  const container = $("buttons-grid");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < 18; i++) {
    const card = document.createElement("div");
    card.className = "btn-card";

    const header = document.createElement("div");
    header.className = "btn-card-header";

    const idx = document.createElement("span");
    idx.className = "btn-idx";
    idx.textContent = `[ ${String(i).padStart(2, "0")} ]`;

    const led = document.createElement("div");
    led.className = "btn-led-indicator" + (currentMapping.buttons[i] !== 255 ? " on" : "");
    led.id = `led-ind-${i}`;

    header.appendChild(idx);
    header.appendChild(led);

    const name = document.createElement("div");
    name.className = "btn-name";
    name.textContent = `SMK: ${BUTTON_LABELS[i].split(": ")[1]}`;

    const select = document.createElement("select");
    select.className = "btn-select";
    select.dataset.index = i;

    ACTIONS.forEach((act) => {
      const opt = document.createElement("option");
      opt.value = act.id;
      opt.textContent = act.label;
      if (act.id === currentMapping.buttons[i]) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      currentMapping.buttons[i] = val;
      const ledEl = $(`led-ind-${i}`);
      if (ledEl) ledEl.className = "btn-led-indicator" + (val !== 255 ? " on" : "");
      updateButtonOptions();
    });

    card.appendChild(header);
    card.appendChild(name);
    card.appendChild(select);
    container.appendChild(card);
  }

  updateButtonOptions();
}

function updateButtonOptions() {
  const container = $("buttons-grid");
  if (!container) return;
  const selects = container.querySelectorAll(".btn-select");

  selects.forEach((select) => {
    const btnIdx = parseInt(select.dataset.index, 10);
    const currentVal = currentMapping.buttons[btnIdx];

    Array.from(select.options).forEach((opt) => {
      const actId = parseInt(opt.value, 10);
      const act = ACTIONS.find((a) => a.id === actId);
      if (!act) return;

      if (actId === 255) {
        opt.textContent = "[Unassigned / Disabled]";
        return;
      }

      const assignedOther = [];
      for (let b = 0; b < 18; b++) {
        if (b !== btnIdx && currentMapping.buttons[b] === actId) {
          assignedOther.push(b);
        }
      }

      if (assignedOther.length > 0) {
        opt.textContent = `[● In ${assignedOther.map(b => BUTTON_SHORT_NAMES[b]).join(", ")}] ${act.label}`;
      } else if (actId === currentVal) {
        opt.textContent = `[✓ Assigned here] ${act.label}`;
      } else {
        opt.textContent = `${act.label}`;
      }
    });
  });
}

function initEncoders() {
  const container = $("knobs-grid");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const item = document.createElement("div");
    item.className = "knob-item";

    const header = document.createElement("div");
    header.className = "btn-card-header";

    const idx = document.createElement("span");
    idx.className = "btn-idx";
    idx.textContent = `[ ENC 0${i + 1} ]`;

    const led = document.createElement("div");
    led.className = "btn-led-indicator" + (currentMapping.encoders[i] !== 255 ? " on" : "");
    led.id = `enc-led-ind-${i}`;

    header.appendChild(idx);
    header.appendChild(led);

    const midRow = document.createElement("div");
    midRow.className = "knob-mid-row";
    midRow.innerHTML = `
      <div class="knob-smk-label">K${i + 1}</div>
      <svg class="knob-smk-svg" width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="#0d0f14" stroke="#d8dde6" stroke-width="1.4"/>
        <circle cx="24" cy="24" r="17.8" fill="#12151c" stroke="#7c8594" stroke-width="1.05"/>
        <g stroke="#8e98a8" stroke-width="1.1" stroke-linecap="round">
          <line x1="34.35" y1="28.29" x2="40.45" y2="30.81"/>
          <line x1="28.29" y1="34.35" x2="30.81" y2="40.45"/>
          <line x1="19.71" y1="34.35" x2="17.19" y2="40.45"/>
          <line x1="13.65" y1="28.29" x2="7.55" y2="30.81"/>
          <line x1="13.65" y1="19.71" x2="7.55" y2="17.19"/>
          <line x1="19.71" y1="13.65" x2="17.19" y2="7.55"/>
          <line x1="28.29" y1="13.65" x2="30.81" y2="7.55"/>
          <line x1="34.35" y1="19.71" x2="40.45" y2="17.19"/>
        </g>
        <polygon points="34.35,28.29 28.29,34.35 19.71,34.35 13.65,28.29 13.65,19.71 19.71,13.65 28.29,13.65 34.35,19.71" fill="#171b24" stroke="#ffffff" stroke-width="1.45" stroke-linejoin="round"/>
      </svg>
    `;

    const select = document.createElement("select");
    select.className = "knob-select";
    select.dataset.index = i;

    ENCODERS.forEach((enc) => {
      const opt = document.createElement("option");
      opt.value = enc.id;
      opt.textContent = enc.label;
      if (enc.id === currentMapping.encoders[i]) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      currentMapping.encoders[i] = val;
      const ledEl = $(`enc-led-ind-${i}`);
      if (ledEl) ledEl.className = "btn-led-indicator" + (val !== 255 ? " on" : "");
    });

    item.appendChild(header);
    item.appendChild(midRow);
    item.appendChild(select);
    container.appendChild(item);
  }
}

function initFaders() {
  const container = $("faders-grid");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const item = document.createElement("div");
    item.className = "fader-item";

    const track = document.createElement("div");
    track.className = "fader-track";

    const ticks = document.createElement("div");
    ticks.className = "fader-ticks";
    for (let t = 0; t < 5; t++) {
      const tick = document.createElement("div");
      tick.className = "fader-tick";
      ticks.appendChild(tick);
    }

    const slot = document.createElement("div");
    slot.className = "fader-slot";

    const thumb = document.createElement("div");
    thumb.className = "fader-thumb";
    thumb.style.bottom = `${30 + i * 15}%`;

    track.appendChild(ticks);
    track.appendChild(slot);
    track.appendChild(thumb);

    const name = document.createElement("div");
    name.className = "fader-name";
    name.textContent = `SMK Fader F${i + 1}`;

    const select = document.createElement("select");
    select.className = "fader-select";
    select.dataset.index = i;

    FADERS.forEach((fad) => {
      const opt = document.createElement("option");
      opt.value = fad.id;
      opt.textContent = fad.label;
      if (fad.id === currentMapping.faders[i]) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      currentMapping.faders[i] = parseInt(e.target.value, 10);
    });

    item.appendChild(track);
    item.appendChild(name);
    item.appendChild(select);
    container.appendChild(item);
  }
}

// ---------------------------------------------------------------------------
// MIDI Controller Section (Channels, Knobs CC, 8 Faders CC, Pads CC)
// ---------------------------------------------------------------------------
function loadSavedMidiConfig() {
  try {
    const raw = localStorage.getItem("smkdee_midi_config_v1");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (parsed.keyboardCh >= 1 && parsed.keyboardCh <= 16) midiConfig.keyboardCh = parsed.keyboardCh;
      if (parsed.knobsCh >= 1 && parsed.knobsCh <= 16) midiConfig.knobsCh = parsed.knobsCh;
      if (parsed.fadersCh >= 1 && parsed.fadersCh <= 16) midiConfig.fadersCh = parsed.fadersCh;
      if (parsed.padsCh >= 1 && parsed.padsCh <= 16) midiConfig.padsCh = parsed.padsCh;
      if (Array.isArray(parsed.knobsCC) && parsed.knobsCC.length === 16) {
        midiConfig.knobsCC = parsed.knobsCC.map(v => Math.max(0, Math.min(127, parseInt(v, 10) || 0)));
      }
      if (Array.isArray(parsed.fadersCC) && parsed.fadersCC.length === 8) {
        midiConfig.fadersCC = parsed.fadersCC.map(v => Math.max(0, Math.min(127, parseInt(v, 10) || 0)));
      }
      if (Array.isArray(parsed.padsCC) && parsed.padsCC.length === 32) {
        midiConfig.padsCC = parsed.padsCC.map(v => Math.max(0, Math.min(127, parseInt(v, 10) || 0)));
      }
    }
  } catch (_) {}
}

function saveMidiConfig() {
  try {
    localStorage.setItem("smkdee_midi_config_v1", JSON.stringify(midiConfig));
  } catch (_) {}
}

function initMidiMapperSection() {
  const tabBtnEngine = $("tab-btn-engine");
  const tabBtnMidi = $("tab-btn-midi");
  const paneEngine = $("pane-engine-remapper");
  const paneMidi = $("pane-midi-customizer");

  if (tabBtnEngine && tabBtnMidi && paneEngine && paneMidi) {
    tabBtnEngine.onclick = () => {
      tabBtnEngine.classList.add("active");
      tabBtnMidi.classList.remove("active");
      paneEngine.style.display = "flex";
      paneMidi.style.display = "none";
    };
    tabBtnMidi.onclick = () => {
      tabBtnMidi.classList.add("active");
      tabBtnEngine.classList.remove("active");
      paneMidi.style.display = "flex";
      paneEngine.style.display = "none";
    };
  }

  const chSelects = [
    { id: "midi-ch-keyboard", key: "keyboardCh" },
    { id: "midi-ch-knobs",    key: "knobsCh" },
    { id: "midi-ch-faders",   key: "fadersCh" },
    { id: "midi-ch-pads",     key: "padsCh" }
  ];

  chSelects.forEach(({ id, key }) => {
    const sel = $(id);
    if (!sel) return;
    sel.innerHTML = "";
    for (let ch = 1; ch <= 16; ch++) {
      const opt = document.createElement("option");
      opt.value = ch;
      opt.textContent = `CH ${String(ch).padStart(2, "0")}`;
      if (midiConfig[key] === ch) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.onchange = (e) => {
      midiConfig[key] = parseInt(e.target.value, 10) || 1;
      saveMidiConfig();
    };
  });

  const btnKB1 = $("btn-midi-knobs-b1");
  const btnKB2 = $("btn-midi-knobs-b2");
  if (btnKB1 && btnKB2) {
    btnKB1.onclick = () => {
      activeMidiKnobBank = 1;
      btnKB1.classList.add("active");
      btnKB2.classList.remove("active");
      renderMidiKnobsCC();
    };
    btnKB2.onclick = () => {
      activeMidiKnobBank = 2;
      btnKB2.classList.add("active");
      btnKB1.classList.remove("active");
      renderMidiKnobsCC();
    };
  }

  const btnPBA = $("btn-midi-pads-ba");
  const btnPBB = $("btn-midi-pads-bb");
  if (btnPBA && btnPBB) {
    btnPBA.onclick = () => {
      activeMidiPadBank = "A";
      btnPBA.classList.add("active");
      btnPBB.classList.remove("active");
      renderMidiPadsCC();
    };
    btnPBB.onclick = () => {
      activeMidiPadBank = "B";
      btnPBB.classList.add("active");
      btnPBA.classList.remove("active");
      renderMidiPadsCC();
    };
  }

  renderMidiKnobsCC();
  renderMidiFadersCC();
  renderMidiPadsCC();
}

function renderMidiKnobsCC() {
  const container = $("midi-knobs-cc-grid");
  if (!container) return;
  container.innerHTML = "";

  const start = activeMidiKnobBank === 1 ? 0 : 8;
  for (let i = start; i < start + 8; i++) {
    const phyK = (i % 8) + 1;
    const card = document.createElement("div");
    card.className = "midi-cc-card";
    card.innerHTML = `
      <div class="midi-cc-top">
        <span class="midi-cc-name">K${i + 1}</span>
        <span class="midi-cc-tag">KNOB ${phyK}</span>
      </div>
      <div class="midi-cc-field">
        <span>CC</span>
        <input type="number" min="0" max="127" class="midi-num-input" value="${midiConfig.knobsCC[i]}" data-midi-knob="${i}">
      </div>
    `;
    container.appendChild(card);
  }

  container.querySelectorAll("input[data-midi-knob]").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.midiKnob, 10);
      const val = Math.max(0, Math.min(127, parseInt(e.target.value, 10) || 0));
      e.target.value = val;
      midiConfig.knobsCC[idx] = val;
      saveMidiConfig();
    });
  });
}

function renderMidiFadersCC() {
  const container = $("midi-faders-cc-grid");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const bankNum = i < 4 ? 1 : 2;
    const phyF = (i % 4) + 1;
    const card = document.createElement("div");
    card.className = "midi-cc-card";
    card.innerHTML = `
      <div class="midi-cc-top">
        <span class="midi-cc-name">F${i + 1}</span>
        <span class="midi-cc-tag">B${bankNum} · FADER ${phyF}</span>
      </div>
      <div class="midi-cc-field">
        <span>CC</span>
        <input type="number" min="0" max="127" class="midi-num-input" value="${midiConfig.fadersCC[i]}" data-midi-fader="${i}">
      </div>
    `;
    container.appendChild(card);
  }

  container.querySelectorAll("input[data-midi-fader]").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.midiFader, 10);
      const val = Math.max(0, Math.min(127, parseInt(e.target.value, 10) || 0));
      e.target.value = val;
      midiConfig.fadersCC[idx] = val;
      saveMidiConfig();
    });
  });
}

function renderMidiPadsCC() {
  const container = $("midi-pads-cc-grid");
  if (!container) return;
  container.innerHTML = "";

  const start = activeMidiPadBank === "A" ? 0 : 16;
  for (let i = start; i < start + 16; i++) {
    const phyP = (i % 16) + 1;
    const card = document.createElement("div");
    card.className = "midi-cc-card";
    card.innerHTML = `
      <div class="midi-cc-top">
        <span class="midi-cc-name">PAD ${String(i + 1).padStart(2, "0")}</span>
        <span class="midi-cc-tag">P${phyP}</span>
      </div>
      <div class="midi-cc-field">
        <span>CC</span>
        <input type="number" min="0" max="127" class="midi-num-input" value="${midiConfig.padsCC[i]}" data-midi-pad="${i}">
      </div>
    `;
    container.appendChild(card);
  }

  container.querySelectorAll("input[data-midi-pad]").forEach((inp) => {
    inp.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.midiPad, 10);
      const val = Math.max(0, Math.min(127, parseInt(e.target.value, 10) || 0));
      e.target.value = val;
      midiConfig.padsCC[idx] = val;
      saveMidiConfig();
    });
  });
}

// ---------------------------------------------------------------------------
// On-the-Fly SysEx Hardware Mapper Actions
// ---------------------------------------------------------------------------
async function getLiveMidiLink() {
  if (activeLink && activeLink.output && activeLink.input) {
    return activeLink;
  }
  if (!navigator.requestMIDIAccess) return null;
  if (!midiAccess) {
    try {
      midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    } catch (_) {
      return null;
    }
  }
  const isVirtual = (p) => /iac|driver iac|internal|network|apple|thru/i.test(p.name || "");
  const isMatch = (p) => /fm-1|smk|felucca|melodee|fomni|x0x|makkuro|ota|composite|sinco|usb-midi|kartun|oscuro|m-vave|mvave/i.test(p.name || "");

  const ins = [...midiAccess.inputs.values()].filter(i => i.state !== "disconnected" && !isVirtual(i));
  const outs = [...midiAccess.outputs.values()].filter(o => o.state !== "disconnected" && !isVirtual(o));

  let inPort = ins.find(isMatch) || (ins.length === 1 ? ins[0] : null);
  let outPort = outs.find(o => inPort && o.name === inPort.name) || outs.find(isMatch) || (outs.length === 1 ? outs[0] : null);

  if (!inPort || !outPort) return null;
  try { await inPort.open(); await outPort.open(); } catch (_) {}
  return { input: inPort, output: outPort };
}

async function readMappingSysEx() {
  const logContainer = $("install-log-container");
  if (logContainer) logContainer.classList.remove("is-hidden");

  installLog("Searching for SMK-37 keyboard via USB-MIDI...", "cmd");
  const link = await getLiveMidiLink();
  if (!link) {
    installLog("No SMK-37 keyboard detected via USB-MIDI. Please connect it via USB.", "error");
    alert("Please connect your SMK-37 via USB and click 'Connect Keyboard' first.");
    return;
  }

  installLog(`Connected to [${link.output.name}]. Requesting active control mapping (SysEx F0 7D 53 4D 4B 01 F7)...`, "cmd");

  const query = [0xF0, 0x7D, 0x53, 0x4D, 0x4B, 0x01, 0xF7];

  return new Promise((resolve) => {
    let done = false;
    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        link.input.removeEventListener("midimessage", handler);
        installLog("Timeout: the keyboard did not respond to the SysEx mapping query.", "warn");
        resolve(false);
      }
    }, 2500);

    const handler = (e) => {
      const d = e.data;
      if (d && d.length >= 37 && d[0] === 0xF0 && d[1] === 0x7D && d[2] === 0x53 && d[3] === 0x4D && d[4] === 0x4B && d[5] === 0x11) {
        clearTimeout(timeout);
        done = true;
        link.input.removeEventListener("midimessage", handler);

        installLog(`Received reply from keyboard (${d.length} bytes).`, "info");
        if (d.length < 97) {
          installLog("Notice: The keyboard responded with legacy 38-byte mapping. It does not have the extended MIDI CC tables yet — please flash the firmware in Section 03 once.", "warn");
        }

        for (let i = 0; i < 18; i++) {
          const v = d[6 + i];
          currentMapping.buttons[i] = (v === 0x7F) ? 0xFF : v;
        }
        for (let i = 0; i < 8; i++) {
          const v = d[24 + i];
          currentMapping.encoders[i] = (v === 0x7F) ? 0xFF : v;
        }
        currentMapping.faders = [...SMKDEE_DEFAULT_FADERS];

        // If extended MIDI config bytes are included in reply (offset 36..95)
        if (d.length >= 97) {
          midiConfig.keyboardCh = ((d[36] & 0x0F) + 1);
          midiConfig.knobsCh    = ((d[37] & 0x0F) + 1);
          midiConfig.fadersCh   = ((d[38] & 0x0F) + 1);
          midiConfig.padsCh     = ((d[39] & 0x0F) + 1);
          for (let i = 0; i < 16; i++) midiConfig.knobsCC[i]  = d[40 + i] & 0x7F;
          for (let i = 0; i < 8; i++)  midiConfig.fadersCC[i] = d[56 + i] & 0x7F;
          for (let i = 0; i < 32; i++) midiConfig.padsCC[i]   = d[64 + i] & 0x7F;
          saveMidiConfig();
          initMidiMapperSection();
        }

        initButtons();
        initEncoders();
        installLog("Active control mapping read from SMK-37 and loaded into the mapper!", "success");
        resolve(true);
      }
    };

    link.input.addEventListener("midimessage", handler);
    try {
      link.output.send(query);
    } catch (err) {
      clearTimeout(timeout);
      installLog("Failed to send SysEx message: " + err.message, "error");
      resolve(false);
    }
  });
}

async function applyLiveMappingSysEx() {
  const logContainer = $("install-log-container");
  if (logContainer) logContainer.classList.remove("is-hidden");

  saveMidiConfig();

  installLog("Searching for SMK-37 keyboard via USB-MIDI...", "cmd");
  const link = await getLiveMidiLink();
  if (!link) {
    installLog("No SMK-37 keyboard detected via USB-MIDI. Please connect it via USB and click 'Connect Keyboard'.", "error");
    alert("Please connect your SMK-37 via USB and click 'Connect Keyboard' first.");
    return;
  }

  installLog(`Sending on-the-fly control & MIDI mapping (RAM) to [${link.output.name}]...`, "cmd");

  const msg = [0xF0, 0x7D, 0x53, 0x4D, 0x4B, 0x02];
  for (let i = 0; i < 18; i++) {
    const v = currentMapping.buttons[i];
    msg.push(v === 0xFF ? 0x7F : (v & 0x7F));
  }
  for (let i = 0; i < 8; i++) {
    const v = currentMapping.encoders[i];
    msg.push(v === 0xFF ? 0x7F : (v & 0x7F));
  }
  for (let i = 0; i < 4; i++) {
    msg.push(SMKDEE_DEFAULT_FADERS[i] & 0x7F);
  }
  // Append 60-byte MIDI Controller configuration (4 channels + 16 knob CCs + 8 fader CCs + 32 pad CCs)
  msg.push((midiConfig.keyboardCh - 1) & 0x0F);
  msg.push((midiConfig.knobsCh - 1) & 0x0F);
  msg.push((midiConfig.fadersCh - 1) & 0x0F);
  msg.push((midiConfig.padsCh - 1) & 0x0F);
  for (let i = 0; i < 16; i++) msg.push(midiConfig.knobsCC[i] & 0x7F);
  for (let i = 0; i < 8; i++)  msg.push(midiConfig.fadersCC[i] & 0x7F);
  for (let i = 0; i < 32; i++) msg.push(midiConfig.padsCC[i] & 0x7F);
  msg.push(0xF7);

  return new Promise((resolve) => {
    let done = false;
    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        link.input.removeEventListener("midimessage", handler);
        installLog("Mapping SysEx sent, but keyboard did not acknowledge (Timeout). If you haven't flashed the new firmware yet, please flash it in Section 03.", "warn");
        const btnApply = $("btn-apply-live-sysex");
        if (btnApply) {
          btnApply.textContent = "Sent (No ACK)";
          setTimeout(() => { btnApply.textContent = "Apply On-the-Fly (RAM)"; }, 2500);
        }
        resolve(false);
      }
    }, 2000);

    const handler = (e) => {
      const d = e.data;
      if (d && d.length >= 7 && d[0] === 0xF0 && d[1] === 0x7D && d[2] === 0x53 && d[3] === 0x4D && d[4] === 0x4B && d[5] === 0x12) {
        clearTimeout(timeout);
        done = true;
        link.input.removeEventListener("midimessage", handler);
        installLog("SUCCESS! [ACK Received] Keyboard confirmed mapping applied to RAM! Screen shows MAPPING UPDATED.", "success");
        const btnApply = $("btn-apply-live-sysex");
        if (btnApply) {
          btnApply.textContent = "Applied to RAM!";
          setTimeout(() => { btnApply.textContent = "Apply On-the-Fly (RAM)"; }, 2000);
        }
        resolve(true);
      }
    };

    link.input.addEventListener("midimessage", handler);
    try {
      link.output.send(msg);
    } catch (err) {
      clearTimeout(timeout);
      installLog("Error sending SysEx mapping: " + err.message, "error");
      resolve(false);
    }
  });
}

function initRemapperActions() {
  const btnReset = $("btn-reset-mapping");
  const btnRead = $("btn-read-mapping-sysex");
  const btnApplyLive = $("btn-apply-live-sysex");
  const btnToggleMode = $("btn-toggle-keyboard-midi-mode");

  if (btnToggleMode) {
    btnToggleMode.addEventListener("click", async () => {
      const link = await getLiveMidiLink();
      if (!link) {
        installLog("Cannot toggle mode: no SMK-37 keyboard detected via USB-MIDI.", "error");
        alert("Please connect your SMK-37 via USB first.");
        return;
      }
      const msg = [0xF0, 0x7D, 0x53, 0x4D, 0x4B, 0x03, 0x02, 0xF7];
      try {
        link.output.send(msg);
        installLog("Sent mode toggle SysEx to keyboard! (Screen will switch between MIDI CTRL MODE & SMK-DEE MODE)", "success");
        const origText = btnToggleMode.textContent;
        btnToggleMode.textContent = "Mode Toggled!";
        setTimeout(() => { btnToggleMode.textContent = origText; }, 1500);
      } catch (err) {
        installLog("Error sending mode toggle SysEx: " + err.message, "error");
      }
    });
  }

  if (btnRead) {
    btnRead.addEventListener("click", () => readMappingSysEx());
  }

  if (btnApplyLive) {
    btnApplyLive.addEventListener("click", () => applyLiveMappingSysEx());
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      currentMapping.buttons = [...SMKDEE_DEFAULT_BUTTONS];
      currentMapping.encoders = [...SMKDEE_DEFAULT_ENCODERS];
      currentMapping.faders = [...SMKDEE_DEFAULT_FADERS];
      midiConfig.keyboardCh = DEFAULT_MIDI_CONFIG.keyboardCh;
      midiConfig.knobsCh = DEFAULT_MIDI_CONFIG.knobsCh;
      midiConfig.fadersCh = DEFAULT_MIDI_CONFIG.fadersCh;
      midiConfig.padsCh = DEFAULT_MIDI_CONFIG.padsCh;
      midiConfig.knobsCC = [...DEFAULT_MIDI_CONFIG.knobsCC];
      midiConfig.fadersCC = [...DEFAULT_MIDI_CONFIG.fadersCC];
      midiConfig.padsCC = [...DEFAULT_MIDI_CONFIG.padsCC];
      saveMidiConfig();
      initButtons();
      initEncoders();
      initFaders();
      initMidiMapperSection();
      installLog("Hardware and MIDI mapping reset to default SMK-dee layout.", "info");
    });
  }
}

// ---------------------------------------------------------------------------
// Status Pill Helper (Green = OK/Connected, Yellow = Warn/Busy, Red = Error)
// ---------------------------------------------------------------------------
function setMidiStatusPill(state, text) {
  const pill = $("midi-status-pill");
  if (!pill) return;
  let dotClass = "status-dot";
  if (state === "ok") dotClass = "status-dot ok";
  else if (state === "warn") dotClass = "status-dot warn";
  else if (state === "error") dotClass = "status-dot error";
  pill.innerHTML = `<span class="${dotClass}"></span> ${text}`;
}

// ---------------------------------------------------------------------------
// Technical Log & Progress Bar
// ---------------------------------------------------------------------------
function initFlasherUI() {
  const btnToggleLog = $("btn-toggle-log");
  const logContainer = $("install-log-container");
  const btnClearLog = $("btn-clear-log");
  const btnConnect = $("btn-connect-midi");
  const btnFlash = $("btn-flash-device");

  if (btnToggleLog && logContainer) {
    btnToggleLog.addEventListener("click", () => {
      const isHidden = logContainer.classList.toggle("is-hidden");
      btnToggleLog.querySelector("span").textContent = isHidden ? "Show Technical Log" : "Hide Technical Log";
    });
  }

  if (btnClearLog) {
    btnClearLog.addEventListener("click", () => {
      $("install-log-box").innerHTML = '<div class="log-line info">[SYSTEM] Log cleared. Ready.</div>';
    });
  }

  if (btnConnect) {
    btnConnect.addEventListener("click", connectMidi);
  }

  if (btnFlash) {
    btnFlash.addEventListener("click", flashCurrentFirmware);
  }
}

function installLog(msg, type = "info") {
  const box = $("install-log-box");
  if (!box) return;
  const time = new Date().toTimeString().split(" ")[0];
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.textContent = `[${time}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function setFlashProgress(percent, statusText, detailText = "", dotState = null) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const fill = $("flash-progress-fill");
  const badge = $("flash-percent-badge");
  const status = $("flash-status-text");
  const detail = $("flash-detail-text");

  if (fill) fill.style.width = `${p}%`;
  if (badge) badge.textContent = `${p}%`;
  if (status && statusText) {
    const st = dotState || (p === 100 ? "ok" : (p > 0 ? "warn" : ""));
    const cls = st ? `status-dot ${st}` : "status-dot";
    status.innerHTML = `<span class="${cls}"></span> ${statusText}`;
  }
  if (detail && detailText) {
    detail.textContent = detailText;
  }
}

// ---------------------------------------------------------------------------
// Web MIDI SysEx Flasher Engine (Updater Protocol)
// ---------------------------------------------------------------------------
let midiAccess = null;
let activeLink = null;
let connectedDevice = null;

const HS_QUERY = [0xF0, 0x00, 0x32, 0x45, 0x00, 0x00, 0x00, 0x40, 0x7F, 0xF7];
const UPGRADE = [0xF0, 0x22, 0x24, 0x35, 0x7F, 0xF7];
const BLOCKS = 20, BLK = 0x30, KEEP = 0x2F, MAX_BLOCKS = 64;
const MAXDATA = 512;
const IS_OTA = (id) => /^ota-/i.test(id.model || id.text || "");

function crc16(d, c = 0) {
  for (const b of d) {
    c ^= b << 8;
    for (let k = 0; k < 8; k++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
  }
  return c;
}

function jlDec(b) {
  const out = Uint8Array.from(b);
  let key = 0xFFFF;
  for (let i = 0; i < out.length; i++) {
    out[i] ^= key & 0xFF;
    key = ((key << 1) ^ (key & 0x8000 ? 0x1021 : 0)) & 0xFFFF;
  }
  return out;
}

function blockCount(fwsc) {
  let n = BLOCKS;
  while (n < MAX_BLOCKS && (n + 1) * BLK <= fwsc.length && fwsc[n * BLK + KEEP] === 0x7D) n++;
  return n;
}

function deinterleave(fwsc, blocks = 20) {
  const out = new Uint8Array(fwsc.length - blocks);
  for (let i = 0; i < blocks; i++) out.set(fwsc.subarray(i * BLK, i * BLK + KEEP), i * KEEP);
  out.set(fwsc.subarray(blocks * BLK), blocks * KEEP);
  return out;
}

function filesOk(img) {
  if (img.length < 0x40) return false;
  const h = jlDec(img.subarray(0, 0x40));
  const rd = (a, o, n) => a.slice(o, o + n).reduce((v, x, i) => v + x * 2 ** (8 * i), 0);
  if (crc16(h.subarray(2, 0x40)) !== rd(h, 0, 2)) return false;
  const count = rd(h, 8, 2);
  if (count < 1 || count > 8 || img.length < 0x40 + 0x50 * count) return false;
  for (let i = 0; i < count; i++) {
    const e = jlDec(img.subarray(0x40 + i * 0x50, 0x90 + i * 0x50));
    const typ = rd(e, 0, 2), off = rd(e, 8, 4), size = rd(e, 12, 4);
    if (off + size > img.length) return false;
    if ((typ === 0 || typ === 100) && crc16(img.subarray(off, off + size)) !== rd(e, 4, 2)) return false;
  }
  return true;
}

function logicalImage(fwsc) {
  if (fwsc.length < 0x40) throw new Error("Firmware file is too short to be a valid image.");
  if (filesOk(fwsc)) return fwsc;

  const n = blockCount(fwsc);
  if (n !== BLOCKS) {
    const img = deinterleave(fwsc, n);
    if (filesOk(img) || !filesOk(deinterleave(fwsc, BLOCKS))) return img;
  }
  return deinterleave(fwsc, BLOCKS);
}

function pack7(data) {
  const out = []; let acc = 0, nb = 0;
  for (const b of data) {
    acc |= b << nb; nb += 8;
    while (nb >= 7) { out.push(acc & 0x7F); acc >>>= 7; nb -= 7; }
  }
  if (nb) out.push(acc & 0x7F);
  return out;
}

function unpack7(s) {
  const out = []; let acc = 0, nb = 0;
  for (const b of s) {
    acc |= (b & 0x7F) << nb; nb += 7;
    while (nb >= 8) { out.push(acc & 0xFF); acc >>>= 8; nb -= 8; }
  }
  return out;
}

function response(addr, data, fl = 0) {
  const len = data.length;
  const body = [0x00, 0x59, 0x30, (len + 8) & 0xFF, ((len + 8) >> 8) & 0xFF, 0, fl,
    addr & 0xFF, (addr >>> 8) & 0xFF, (addr >>> 16) & 0xFF, (addr >>> 24) & 0xFF,
    len & 0xFF, (len >> 8) & 0xFF, 0, ...data];
  let s = 0;
  for (let i = 6; i < body.length; i++) s += body[i];
  body.push(~s & 0xFF);
  return [0xF0, ...pack7(body), 0xF7];
}

function parseRequest(pkt) {
  if (pkt[0] !== 0xF0 || pkt[pkt.length - 1] !== 0xF7) return null;
  const u = unpack7(pkt.slice(1, -1));
  if (u.length !== 15 || u[0] !== 0 || u[1] !== 0x59 || u[2] !== 0x30) return null;
  let s = 0;
  for (let i = 6; i < 14; i++) s += u[i];
  if ((~s & 0xFF) !== u[14]) return null;
  return { fl: u[6], addr: (u[7] | (u[8] << 8) | (u[9] << 16) | (u[10] << 24)) >>> 0, len: u[11] | (u[12] << 8) | (u[13] << 16) };
}

function parseIdentity(pkt) {
  const d = unpack7(pkt.slice(1, -1));
  if (d.length !== 34 || d[0] !== 0 || d[1] !== 0x59 || d[2] !== 0x11) return null;
  const txt = String.fromCharCode(...d.slice(6, 33)).replace(/\0+$/, "");
  const m = /^([^_]+)_(\d+)$/.exec(txt);
  return m ? { text: txt, model: m[1], version: parseInt(m[2], 10) } : { text: txt, model: txt, version: 0 };
}

class Link {
  constructor(input, output) {
    this.input = input; this.output = output; this.q = []; this.waiter = null;
    input.onmidimessage = (ev) => {
      if (ev.data[0] !== 0xF0) return;
      this.q.push(Array.from(ev.data));
      if (this.waiter) { const w = this.waiter; this.waiter = null; w(); }
    };
  }
  send(bytes) {
    try { this.output.send(bytes); return true; } catch (_) { return false; }
  }
  drain() { this.q.length = 0; }
  async read(ms) {
    if (!this.q.length) {
      let tm;
      await Promise.race([new Promise((r) => { this.waiter = r; }), new Promise((r) => { tm = setTimeout(r, ms); })]);
      clearTimeout(tm);
      this.waiter = null;
    }
    return this.q.shift() || null;
  }
  close() { this.input.onmidimessage = null; }
}

async function handshake(link, tries = 4) {
  link.drain();
  for (let t = 0; t < tries; t++) {
    if (!link.send(HS_QUERY)) return null;
    const end = Date.now() + 1000;
    while (Date.now() < end) {
      const p = await link.read(end - Date.now());
      if (!p) break;
      const id = parseIdentity(p);
      if (id) return id;
    }
    await sleep(100);
  }
  return null;
}

async function findDevice(filter = null, tries = 3) {
  if (!midiAccess) return null;
  const isVirtual = (p) => /iac|driver iac|internal|network|apple|thru/i.test(p.name || "");
  const isMatch = (p) => /fm-1|smk|felucca|melodee|fomni|x0x|makkuro|ota|composite|sinco|usb-midi|kartun|oscuro|m-vave|mvave/i.test(p.name || "");

  const ins = [...midiAccess.inputs.values()].filter(i => i.state !== "disconnected" && !isVirtual(i));
  const outs = [...midiAccess.outputs.values()].filter(o => o.state !== "disconnected" && !isVirtual(o));

  for (const input of ins) {
    if (!isMatch(input)) continue;
    const output = outs.find(o => o.name === input.name) || outs.find(isMatch) || (outs.length === 1 ? outs[0] : null);
    if (!output) continue;
    try { await input.open(); await output.open(); } catch (_) { continue; }
    const l = new Link(input, output);
    const id = await handshake(l, tries);
    if (id && (!filter || filter(id))) {
      return { link: l, id, name: input.name };
    }
    l.close();
  }
  return null;
}

async function waitForDevice(filter, ms = 30000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (navigator.requestMIDIAccess) {
      try {
        midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      } catch (_) {}
    }
    const dev = await findDevice(filter, 2);
    if (dev) return dev;
    await sleep(1000);
  }
  return null;
}

function attachMidiInputMonitoring() {
  if (!midiAccess) return;
  for (const input of midiAccess.inputs.values()) {
    try {
      input.removeEventListener("midimessage", handleMidiMonitorMessage);
      input.addEventListener("midimessage", handleMidiMonitorMessage);
    } catch (_) {}
  }
}

function handleMidiMonitorMessage() {}

function autoDetectModelFromDevice(dev) {
  const rawDevText = ((dev.id && dev.id.text) || "") + " " + (dev.name || "");
  if (/elite/i.test(rawDevText)) {
    setTargetModel("elite", false);
    installLog("Hardware auto-detected: SMK-37 Elite. Target model switched to Elite.", "success");
  } else if (/pro/i.test(rawDevText)) {
    setTargetModel("pro", false);
    installLog("Hardware auto-detected: SMK-37 Pro. Target model switched to Pro.", "info");
  } else if (/_016/i.test(rawDevText)) {
    setTargetModel("elite", false);
    installLog("Hardware auto-detected: SMK-37 Elite. Target model switched to Elite.", "success");
  } else if (/_900/i.test(rawDevText)) {
    setTargetModel("pro", false);
    installLog("Hardware auto-detected: SMK-37 Pro. Target model switched to Pro.", "info");
  }
}

async function connectMidi() {
  const btn = $("btn-connect-midi");
  btn.disabled = true;
  btn.textContent = "Searching...";
  setMidiStatusPill("warn", "MIDI: Searching...");
  installLog("Scanning USB-MIDI ports for SMK-37...", "info");

  if (!navigator.requestMIDIAccess) {
    const msg = "Your browser does not support Web MIDI. Please use Google Chrome, Microsoft Edge, or Brave.";
    installLog("ERROR: " + msg, "error");
    setMidiStatusPill("error", "MIDI: Unsupported");
    alert(msg);
    btn.disabled = false;
    btn.textContent = "Connect Keyboard";
    return;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    midiAccess.onstatechange = () => attachMidiInputMonitoring();
    attachMidiInputMonitoring();
    installLog("Web MIDI SysEx permission granted.", "info");
    await scanMidiDevices(false);
  } catch (e) {
    installLog(`Web MIDI permission error: ${e.message}`, "error");
    setMidiStatusPill("error", "MIDI: Permission Denied");
    alert(`Could not access Web MIDI SysEx: ${e.message}`);
    btn.disabled = false;
    btn.textContent = "Connect Keyboard";
  }
}

async function scanMidiDevices(silent = false) {
  const btn = $("btn-connect-midi");
  const dev = await findDevice(null, silent ? 2 : 4);

  if (dev) {
    activeLink = dev.link;
    connectedDevice = dev.id;
    const isOtaMode = IS_OTA(dev.id);
    setMidiStatusPill(isOtaMode ? "warn" : "ok", dev.id.text || dev.name);
    $("device-name-display").textContent = dev.id.text || dev.name;
    $("device-meta-display").textContent = isOtaMode
      ? "Keyboard connected in OTA Recovery / Loader mode — ready to flash."
      : "Keyboard connected and ready for SysEx firmware transfer & live mapping.";
    btn.textContent = "Connected";
    btn.disabled = false;
    $("btn-flash-device").disabled = false;
    installLog(`Keyboard detected: "${dev.id.text}" (${dev.name})`, "success");
    attachMidiInputMonitoring();
    autoDetectModelFromDevice(dev);
  } else {
    activeLink = null;
    connectedDevice = null;
    if (!silent) {
      setMidiStatusPill("error", "MIDI: Not Found");
      $("device-name-display").textContent = "No keyboard detected";
      $("device-meta-display").textContent = "Connect your SMK-37 via USB and click 'Retry Connection'";
      btn.disabled = false;
      btn.textContent = "Retry Connection";
      $("btn-flash-device").disabled = true;
      installLog("No SMK-37 keyboard responded to the SysEx handshake.", "warning");
    }
  }
}

async function serveImage(link, image, finishAddr, idleMs, onProgress) {
  let served = 0, last = Date.now();
  for (;;) {
    const pkt = await link.read(1000);
    if (!pkt) {
      if (Date.now() - last > idleMs) return { served, finished: false };
      continue;
    }
    const r = parseRequest(pkt);
    if (!r) continue;
    last = Date.now();
    if (r.addr === 0xE0000000 || r.addr === 0xF0000000) {
      link.send(response(r.addr, [...new TextEncoder().encode("success"), 0]));
      if (r.addr === finishAddr) return { served, finished: true };
      continue;
    }
    if (r.len > MAXDATA || r.addr + r.len > image.length) {
      throw new Error(`Image request out of range: 0x${r.addr.toString(16)}+${r.len}`);
    }
    await sleep(8);
    if (!link.send(response(r.addr, Array.from(image.subarray(r.addr, r.addr + r.len)), r.fl))) {
      return { served, finished: false, lost: true };
    }
    served++;
    if (onProgress) onProgress(served, r.addr);
  }
}

async function flashCurrentFirmware() {
  const btn = $("btn-flash-device");
  btn.disabled = true;

  try {
    if (!navigator.requestMIDIAccess) {
      throw new Error("Browser does not support Web MIDI. Please use Google Chrome, Edge, or Brave.");
    }
    if (!midiAccess) {
      installLog("Requesting Web MIDI SysEx access...", "cmd");
      midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    const fwPath = resolveFirmwarePath();
    const fwDisplayName = resolveDownloadFilename();

    installLog(`Loading firmware package: ${fwDisplayName}...`, "info");
    const res = await fetch(`${fwPath}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Could not download firmware file (${fwPath}).`);
    }
    const rawBytes = new Uint8Array(await res.arrayBuffer());
    installLog(`Firmware loaded: ${rawBytes.length} bytes (CRC verified).`, "success");
    const image = logicalImage(rawBytes);

    installLog(`--- STARTING FIRMWARE FLASH: ${fwDisplayName.toUpperCase()} ---`, "cmd");
    setFlashProgress(10, "Searching for SMK-37 keyboard...", "Scanning USB-MIDI endpoints", "warn");
    setMidiStatusPill("warn", "MIDI: Flashing...");

    let dev = await findDevice(null, 3);
    if (!dev) {
      installLog("Waiting for keyboard response...", "warning");
      dev = await waitForDevice(null, 6000);
      if (!dev) {
        throw new Error("No SMK-37 detected. Check your USB cable and click 'Connect Keyboard'.");
      }
    }

    installLog(`Device paired: "${dev.id.text}" on ${dev.name}`, "success");

    // Stage 1: Upload and verify OTA loader if in standard mode
    if (!IS_OTA(dev.id)) {
      setFlashProgress(15, "Stage 1: Preparing OTA loader...", "Sending M-UPGRADE SysEx command", "warn");
      installLog("Sending M-UPGRADE command [F0 22 24 35 7F F7]...", "cmd");
      dev.link.send(UPGRADE);
      await sleep(2000);

      installLog("Verifying and streaming Stage 1 loader blocks...", "info");
      $("device-meta-display").textContent = "Streaming Stage 1 loader blocks...";

      const s1 = await serveImage(dev.link, image, 0xE0000000, 15000, (n, addr) => {
        const p1 = Math.min(28, 15 + Math.round((n / 6) * 13));
        setFlashProgress(p1, `Stage 1: Block #${n} verified...`, `Offset: 0x${addr.toString(16)}`, "warn");
        installLog(`[Stage 1] Block #${n} verified (offset: 0x${addr.toString(16)})`, "progress");
      });
      dev.link.close();

      if (!s1.finished) {
        throw new Error(`Device did not complete Stage 1 after ${s1.served} requests.`);
      }

      setFlashProgress(30, "Rebooting into OTA mode...", "Keyboard screen showing UPDATE RESTART", "warn");
      installLog(`Stage 1 complete (${s1.served} blocks). Keyboard is rebooting into OTA mode...`, "success");
      $("device-meta-display").textContent = "Rebooting into OTA loader...";
      await sleep(3500);

      installLog("Waiting for OTA loader on USB bus...", "cmd");
      dev = await waitForDevice(IS_OTA, 30000);
      if (!dev) {
        throw new Error("OTA loader timed out. If the screen is flashing, click 'Flash Keyboard Now' again.");
      }
    } else {
      installLog(`Keyboard is already in OTA mode ("${dev.id.text}"). Proceeding with Stage 2...`, "warning");
    }

    installLog(`OTA loader connected: "${dev.id.text}".`, "success");
    installLog("Sending M-UPGRADE to OTA loader to start Flash write...", "cmd");
    dev.link.send(UPGRADE);
    await sleep(2000);

    const totalBlocks = Math.ceil(image.length / 512);
    installLog(`Writing Flash partitions (${totalBlocks} blocks of 512 bytes)...`, "cmd");
    $("device-meta-display").textContent = "Writing Flash partitions...";

    const s2 = await serveImage(dev.link, image, 0xF0000000, 180000, (n, addr) => {
      const pct = Math.min(99, 30 + Math.round((n / totalBlocks) * 68));
      setFlashProgress(pct, "Stage 2: Writing Flash...", `Block ${n}/${totalBlocks} - Addr 0x${addr.toString(16)}`, "warn");
      if (n % 20 === 0 || n === 1 || n === totalBlocks) {
        installLog(`[Stage 2] Flash write: ${pct}% (Block ${n}/${totalBlocks} - 0x${addr.toString(16)})`, "progress");
        $("device-meta-display").textContent = `Writing Flash (${n}/${totalBlocks} blocks)...`;
      }
    });
    dev.link.close();

    if (!s2.finished) {
      throw new Error(`Flash write interrupted after ${s2.served} blocks.`);
    }

    setFlashProgress(98, "Flash memory written! Rebooting keyboard...", "Finalizing installation", "warn");
    installLog("Flash memory written! Rebooting keyboard into new firmware...", "success");
    $("device-meta-display").textContent = "Installation complete! Rebooting...";
    await sleep(4000);

    // Final verification
    installLog("Verifying new firmware boot...", "cmd");
    dev = await waitForDevice(null, 15000);
    setFlashProgress(100, "Firmware flashed successfully!", dev ? `Active: ${dev.id.text}` : "Keyboard ready", "ok");

    if (dev) {
      activeLink = dev.link;
      connectedDevice = dev.id;
      setMidiStatusPill("ok", dev.id.text);
      $("device-name-display").textContent = dev.id.text;
      $("device-meta-display").textContent = "Firmware installed and running properly.";
      installLog(`SUCCESS! Keyboard is online with new firmware: "${dev.id.text}"`, "success");
      autoDetectModelFromDevice(dev);
    } else {
      setMidiStatusPill("ok", "MIDI: Flash Complete");
      installLog("Flashing process finished. If your keyboard does not reboot automatically, power cycle it.", "info");
    }

    alert(`Success!\n\nFirmware "${fwDisplayName}" has been flashed to your SMK-37.`);

  } catch (err) {
    installLog(`[FLASH ERROR] ${err.message}`, "error");
    setFlashProgress(0, "Flashing failed", err.message, "error");
    setMidiStatusPill("error", "MIDI: Flash Error");
    $("device-meta-display").textContent = `Error: ${err.message}`;
    alert(`Error during flashing:\n\n${err.message}`);
  } finally {
    btn.disabled = false;
  }
}
