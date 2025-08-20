---
sidebar_position: 5
---

# Head First Emacs

**Speaker: Moroshima**

[Emacs is sexy](https://emacs.sexy/)

## macOS configuration

1. Enable Use Option key as Meta key in Apple Terminal > Description File > Keyboard

2. Disable `C-<SPC>` usage in Settings > Keyboard > Input Method

### Reference

[osx - emacs on terminal does not recognise option as alt-key on mac - Emacs Stack Exchange](https://emacs.stackexchange.com/questions/8068/emacs-on-terminal-does-not-recognise-option-as-alt-key-on-mac)

## Emacs

### Configuration

#### Disable automatic backup

add the line below to your initialization file like `~/.emacs.d/init.el`

```lisp
(setq make-backup-files nil)
```

##### Swipe backup files created by emacs

```bash
find ~ -type d \( -name 'Applications' -o -name 'Library' \) -prune -o -type f -name '*~' -print
```

##### Reference

[How do I stop emacs from creating backup files? - Super User](https://superuser.com/questions/84164/how-do-i-stop-emacs-from-creating-backup-files)

[Making Backups (GNU Emacs Lisp Reference Manual)](https://www.gnu.org/software/emacs/manual/html_node/elisp/Making-Backups.html#index-make_002dbackup_002dfiles)

#### Disable automatic save

add the line below to your initialization file like `~/.emacs.d/init.el`

```lisp
(setq auto-save-default nil)
```

##### Reference

[Auto-Saving (GNU Emacs Lisp Reference Manual)](https://www.gnu.org/software/emacs/manual/html_node/elisp/Auto_002dSaving.html#index-auto_002dsave_002ddefault)

### Display build settings

[config - Does emacs have an option to display build settings? - Emacs Stack Exchange](https://emacs.stackexchange.com/questions/35497/does-emacs-have-an-option-to-display-build-settings)

```emacs
C-h v system-configuration-options
```

```text
system-configuration-options is a variable defined in `C source code'.
Its value is
"--prefix=/usr/local/emacs 'CFLAGS=-O2 -march=native -pipe
-falign-functions=64 -fomit-frame-pointer -ftracer -funit-at-a-time
-fweb -fforce-addr -fpeel-loops -funswitch-loops -frename-registers
-mfpmath=sse -ffast-math -fno-finite-math-only -fstack-check'
PKG_CONFIG_PATH=/usr/share/pkgconfig"

Documentation:
String containing the configuration options Emacs was built with.

For more information check the manuals.
```

You can use the command above to check if your Emacs build includes  dynamic module support (--with-modules), which is essential for vterm to function properly.

## Packages

### markdown-mode

[Markdown Mode for Emacs](https://jblevins.org/projects/markdown-mode/)

### emacs-libvterm (*vterm*)

[akermu/emacs-libvterm: Emacs libvterm integration](https://github.com/akermu/emacs-libvterm)

**Attention：**Please ensure it that you have installed the compilation deps required by *vterm*.

```bash
brew install cmake libtool
```

If you failed to build vterm, please run the command below in emacs.

```emacs
 M-x vterm-module-compile
```

#### Reference

[How to use the starship prompt with eshell? : r/emacs](https://www.reddit.com/r/emacs/comments/qc89wq/how_to_use_the_starship_prompt_with_eshell/)

[安装vterm报错打不开 vterm-module - Emacs-general - Emacs China](https://emacs-china.org/t/vterm-vterm-module/9580/4)

[:term vterm - Doom Emacs v21.12 documentation](https://docs.doomemacs.org/v21.12/modules/term/vterm/)

### smart input source (*sis*)

[laishulu/emacs-smart-input-source: Less manual switch for native or OS input source (input method).](https://github.com/laishulu/emacs-smart-input-source)

## Other

It is recommended to watch [为什么Mac快捷键用⌘而不是Ctrl？它和Windows谁是反的？\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV16m421s74p) to gain knowledge related to Command key and Control key.