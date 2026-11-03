#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Kerem Kilic (Ellic Studio)
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
import size_fns


def function(name, group, lines):
    return f'define void @{name}() #{group} {{\n' + '  ret void\n' * lines + '}\n'


ir = (function('boot_transaction', 0, 40) + function('tiny_accessor', 0, 39) +
      function('hot_inline', 1, 80) + function('sample_loop', 0, 80) +
      'attributes #0 = { nounwind }\nattributes #1 = { alwaysinline nounwind }\n')
assert size_fns.outlined_names(ir, {'boot_transaction', 'tiny_accessor', 'hot_inline'}) == {'boot_transaction'}
assert {'persist_boot', 'shared_boot'} <= size_fns.NOINLINE_NAMES
assert 'master_samples' not in size_fns.size_names()
assert 'fm6_op' not in size_fns.size_names()
print('size attributes: large cold transactions outlined, tiny/hot/sample code preserved')
