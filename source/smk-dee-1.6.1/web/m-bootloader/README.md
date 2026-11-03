# m-bootloader for the FM-1

Unmodified assets from Julius Vitkauskas's [m-bootloader v1.2 release](https://github.com/jvitkauskas/m-bootloader/releases/tag/v1.2), source commit `22e2559906f9fc4e077f2d6aee20bf332300439e`, MIT licence. Downloaded directly from the author's release, matching the copies pinned by Saadet at `f358c01`.

`web/mboot.py` pins both release hashes and the original MIT notice. Publishing checks them before writing the site and puts the notice beside every published copy. `fm1-uboot.fwsc` contains only the FM-1 bootloader installer; it is never sent through the application-update loader. `fm1-uboot.boot` is the plain boot container, for the separate upstream recovery tools.

The browser offers installation as an unchecked option, after a verified application restart, or alone when the selected release is already running. A development identity cannot identify a particular nightly, so nightly always updates the application before the bootloader. Melodee's staging code accepts the pinned writer using SHA-256 after flash readback. An older Melodee refuses it safely; install the current nightly first.

Keep power connected during a boot-area write. Application return confirms restart; hold PLAY at power-on to verify the recovery menu. Bootloader installation is never automatic during a normal firmware update.
