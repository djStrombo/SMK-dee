These binary fixtures were written by unmodified firmware at commit
`590e7cd2af42b7b35efb8e6aa01f72ba57155185`, using its real `proj_pack`,
`bank_pack` and `template_save` paths. They freeze the pre-FX FUN16, FBKK
and TPLF formats independently of the new decoder.

Track 1 has FM6 engine parameter E0 = 17 and an obsolete FX field set to 127.
Its first step is C/E/G with velocity 100. Another pattern bank has note 72.
The recording has onset 55, duration 217, owner 11 and pitch offset 3.
Motion addresses the old E0 ID, 96. The new decoder must move E0 to 108,
preserve this material and initialise all new FX slots dry.

`fun17.bin`, `fbkk17.bin` and `tplg.bin` were written by unmodified firmware at
`1673b24` through those same save paths. They additionally carry ECHO in the
original insert, with MIX 91, TIME 83 and REPEAT 77; engine motion uses E0 ID
100. Loading them must retain that insert in slot 1, leave slots 2 and 3 off,
and preserve the musical data above.

`fun18.bin`, `fbkk18.bin`, and `tplh.bin` are frozen synthetic three-insert records from the 116-track-parameter, 27-global layout. They contain Phaser/Echo/Reverb in slots 1/2/3 and a C4 note. They verify migration to SEND/RETURN without altering the insert chain; older records have no sends or shared effects.

`../fun20-split.bin` and `../tplj-split.bin` were written by unmodified
`6e81e66` using `project_capture`/`proj_pack` and `template_save` before the low-cut
parameters were added. They contain SPLIT routing, shared Reverb, RETURN 73,
track 1 Echo/MIX 91, SEND 2 = 71 and engine E3 = 42. Their imports must retain
those values and initialise every insert/shared low and high cut to OFF.

`../fun21-cuts.bin` and `../tplk-cuts.bin` were written by unmodified `201cbbd`
(the per-slot low and high cuts, never released) using `project_capture`/`proj_pack`
and `template_save`. They contain SPLIT routing, shared Reverb/Echo, RETURN 73,
track 1 Echo/MIX 91 and Room, SEND 2 = 71, engine E3 = 42 and an E3 motion event.
Cuts: insert 1 LO CUT 19 (200 Hz), insert 2 HI CUT 20 (500 Hz), insert 3 both
(LO CUT 7 = 80 Hz, HI CUT 60), shared 1 LO CUT 29 (300 Hz), shared 2 HI CUT 45
(1000 Hz). Their imports must keep the rest and turn each slot's cut into the
nearest TONE, the low cut when both are set; a low cut at or under 150 Hz is the
effects' own floor now, so insert 3 keeps its high cut.
