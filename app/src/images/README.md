# Naishi images

All images are cut from the publisher's print PDFs (`_sources-images/*.pdf`, not versioned) at **100 px/cm**.
Scripts: `_sources-images/scripts/` (Node: `npm i mupdf sharp`; PDF pages rendered with `mupdf` at 254 dpi,
because `pdfjs` + `@napi-rs/canvas` segfaults on these files, then cut with `sharp`).

| Folder | Content | Size (px) | Physical |
|--------|---------|-----------|----------|
| `cards/base/*.jpg` | 12 base faces: mountain, naishi, advisor, fortress, sentinel, torii, monk, rice, banner, horseman, ronin, ninja | 629 × 879 | 63 × 88 mm |
| `cards/legends/*.jpg` | 7 legendary faces: naishi, sentinel, advisor, horseman, monk, ronin, ninja | 629 × 879 | 63 × 88 mm |
| `cards/travellers/*.jpg` | 6 Travellers: umbrella-lady, old-man, cherry-lady, girl, porter, samurai (PDF pages 8-13) | 629 × 879 | 63 × 88 mm |
| `cards/ryokan-4.jpg`, `ryokan-7.jpg` | Ryokan, face 4 (start) / face 7 | 629 × 879 | 63 × 88 mm |
| `cards/back.jpg` | Common back (base **and** extension: identical) | 629 × 879 | 63 × 88 mm |
| `cards/first-player-black.png`, `first-player-white.png` | First-player marker, two sides (transparent corners + shadow) | 621 × 870 / 623 × 873 (incl. 23 px shadow margin) | art 57.5 × 82.4 mm |
| `boards/board.png` | Board, die-cut shape with the two bottom tabs (transparent, no shadow) | 1396 × 946 | 139.6 × 94.6 mm |
| `tokens/white.png`, `black.png` | Emissary tokens: white disc / black tomoe, black disc / white flower | 246 × 246 (incl. 23 px margin) | disc 20 mm |
| `scorepad/scorepad.jpg` | One score block (top-left of the 4 on the sheet) | 425 × 653 | ~42.5 × 65.3 mm |

## Recipe

- **Cards**: page = 77.8 × 102.8 mm with bleed and crop marks. The marks are 1 px lines at x = 74 / 704 and
  y = 74 / 954 (254 dpi), so the cut is `left 75, top 75, 629 × 879`. The `×N` copy counts printed bottom-left
  are print annotations: erased (filled with the paper colour).
- **Board**: mask = inside of the red die-cut line of `plateau-Naishi-with-diecut.pdf` (flood fill from the
  outside; red art inside the board is kept), applied to `plateau-Naishi.pdf` page 1 (page 2 is the logo back).
- **Shadow**: cardboard recipe of `.claude/skills/game-park/scripts/shadow.py` ported to `sharp`
  (dilate 2, blur σ 7, opacity 0.36, tint `#1A1107`). The canvas grows by 23 px on each side: **add 46 px
  (4.6 mm) to the size declared in `Material.ts`**.
- **Tokens**: the flower is inverted from `BLACK_TOKEN-WHITE_ART-FLOWER.pdf` (ink `#231F20` as disc colour).

## Copies per face (from the print files)

Base (50): mountain 16, naishi 2, advisor 4, fortress 4, sentinel 4, torii 4, monk 3, rice 5, banner 2,
horseman 2, ronin 2, ninja 2.
Legends: 1 each (7 cards, 3 drawn at random). Travellers: 1 each (6 cards, 5 drawn). Ryokan: 1 (face 4 / face 7).
The `×N` printed on the extension files are leftovers of the base card layout: the extension has 14 cards.

## Buttons

`buttons/flower-*.png`, `buttons/tomoe-*.png`: the symbol of a player (flower = first player, tomoe = second player) in a pink ring with an arrow.
The sources (`_sources-images/fleur-noire-fléchée.png`, `tomoe-blanc-fléché.png`) have the arrow down (`-down`); the `-up` versions are made by
`_sources-images/scripts/buttons.mjs` (image turned upside down, symbol put back upright).
« Donner »: the symbol of the opponent, arrow up. « Rappeler mes émissaires »: my symbol, arrow down.
`buttons/choose-ninja.jpg` (from `_sources-images/Choix Ninja.jpg`): « Copier », in a white round with a thick #FFA9C1 border.
Each button has its text under it.
