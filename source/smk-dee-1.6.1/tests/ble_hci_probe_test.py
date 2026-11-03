#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import ble_hci_probe as probe

acl = 'define void @hci_acl_handler() {\n  br i1 %cmp, label %if.else, label %if.then, !dbg !1\n}\n'
body = '  switch i8 %0, label %sw.epilog668 [\n'
for event in sorted(probe.LE_EVENTS | {1, 3, 4, 6, 22, 49}):
    body += f'    i8 {event}, label %case{event}\n'
body += '  ]\n'
for condition, target in [('cmp442', 'if.then444'), ('cmp120', 'if.then122'), ('cmp695', 'if.then697'), ('cmp672', 'if.then674')]:
    body += f'  br i1 %{condition}, label %{target}, label %le_path, !dbg !1\n'
events = 'define void @hci_event_handler() {\n' + body + '}\n'
untouched = 'define void @le_security_and_midi() {\n  call void @le_encrypt()\n  ret void\n}\n'
result = probe.specialize(acl + events + untouched)
assert untouched in result
assert result.count('label %cleanup699,') == 4
for event in probe.LE_EVENTS:
    assert f'i8 {event}, label %case{event}\n' in result
for event in {1, 3, 4, 6, 22, 49}:
    assert f'i8 {event}, label %case{event}\n' not in result
for malformed in [acl, events, (acl + events).replace('%cmp442', '%changed')]:
    try:
        probe.specialize(malformed)
    except ValueError:
        pass
    else:
        raise AssertionError('unknown SDK layout accepted')
print('BLE probe: LE cases and unrelated functions preserved, classic edges cut, SDK drift rejected')
