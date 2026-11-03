#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
"""Experimental BLE-only specialization of the pinned SDK's hci_vendor IR.

This is a size probe, NOT enabled in Melodee's build or a qualified BT library.
Use only with classic controller/stack modules disabled. The input is JieLi's
own bitcode disassembled with the matching toolchain; retain all vendor notices.
No SDK code/archive is distributed here. Unexpected dispatch layouts fail closed.
BLE pairing, encryption, both roles, reconnect and MIDI still need device tests.
"""
import argparse
import hashlib
from pathlib import Path
import re
from audio_ram import FUNCTION

# Shared HCI events: disconnect, encryption change, command complete,
# completed packets and LE meta. Classic-specific events reach the existing
# default path. All LE subevent handling and security code stay in the SDK.
LE_EVENTS = {5, 8, 14, 19, 62}


def replace_once(body, old, new):
    if body.count(old) != 1:
        raise ValueError(f'unrecognized SDK dispatch: {old}')
    return body.replace(old, new)


def specialize(ir):
    changed = set()

    def rewrite(match):
        name, body = match[2], match[5]
        if name == 'hci_acl_handler':
            # Keep the handle boundary check; discard the classic half.
            body = replace_once(body, 'br i1 %cmp, label %if.else, label %if.then,',
                                'br i1 %cmp, label %if.end11, label %if.then,')
        elif name == 'hci_event_handler':
            switch = re.search(r'  switch i8 %0, label %sw.epilog668 \[.*?\n  \]', body, re.S)
            if not switch:
                raise ValueError('unrecognized SDK HCI event switch')
            values = set(map(int, re.findall(r'i8 (\d+), label', switch[0])))
            if not LE_EVENTS <= values:
                raise ValueError('SDK shared HCI events changed')
            edited = re.sub(r'^    i8 (\d+), label %[^\n]+\n',
                            lambda case: case[0] if int(case[1]) in LE_EVENTS else '',
                            switch[0], flags=re.M)
            body = body[:switch.start()] + edited + body[switch.end():]
            # Do not reinterpret a classic handle as LE: retain each comparison
            # and return via the original cleanup block on the classic branch.
            # The final classic L2CAP event forwarding also retains its check.
            for condition, target in [('cmp442', 'if.then444'), ('cmp120', 'if.then122'),
                                      ('cmp695', 'if.then697'), ('cmp672', 'if.then674')]:
                body = replace_once(body, f'br i1 %{condition}, label %{target},',
                                    f'br i1 %{condition}, label %cleanup699,')
        else:
            return match[0]
        changed.add(name)
        return ir[match.start():match.start(5)] + body + ir[match.end(5):match.end()]

    result = FUNCTION.sub(rewrite, ir)
    if changed != {'hci_acl_handler', 'hci_event_handler'}:
        raise ValueError('SDK HCI dispatch definitions missing')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--ble-only', required=True, action='store_true',
                        help='assert both SDK module masks disable classic Bluetooth')
    args = parser.parse_args()
    original = args.input.read_text()
    result = specialize(original)
    args.output.write_text(result)
    print('Experimental BLE-only HCI probe; hardware qualification pending')
    print('input sha256:', hashlib.sha256(original.encode()).hexdigest())
    print('output sha256:', hashlib.sha256(result.encode()).hexdigest())


if __name__ == '__main__':
    main()
