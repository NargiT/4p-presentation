#!/usr/bin/env python3
"""Generate Kpop Daemon Hunter pixel art sprites as SVG files."""

import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'img')

COLORS = {
    ' ': None,
    'H': '#1a0a2e',   # dark purple hair
    'h': '#5b2d94',   # hair highlight
    'S': '#f4c5a1',   # skin
    's': '#c4856a',   # shadow skin
    'E': '#2d1b69',   # eye (dark indigo)
    'W': '#e8e8f4',   # white / collar
    'B': '#0f0a1f',   # dark outfit
    'b': '#1e1040',   # outfit fold/accent
    'G': '#7c3aed',   # violet glow
    'g': '#4c1d95',   # dim glow
    'P': '#1e1b4b',   # dark pants
    'L': '#0f0c2e',   # boots
    'l': '#1e1a40',   # boot highlight
}

# Each sprite: 16 rows × 16 columns (each char = 1 pixel)
SPRITES = {
    'down': [
        "    HHHHHHHH    ",   # 0  top of hair
        "  HHHhHHHhHHH   ",   # 1  hair with highlights
        "  HHHHHHHHHHHH  ",   # 2  hair mass
        "    SSSSSSSS    ",   # 3  face top
        "    SE   ESS    ",   # 4  eyes (indigo)
        "    SSSSSSSS    ",   # 5  mid face
        "    SsSSSsSS    ",   # 6  chin shadow
        "   WbBBBBBbW    ",   # 7  collar
        "  BBBBBBGGBBBB  ",   # 8  outfit chest with violet glow runes
        "  BBBgBBBBgBBB  ",   # 9  glow detail
        "  BBBBBBBBBBBB  ",   # 10 outfit body
        "BB   BBBBBB   BB",   # 11 arms wide
        "Bb    BBBB    bB",   # 12 forearms / lower body
        "    PPPP PPPP   ",   # 13 legs
        "    PPPP PPPP   ",   # 14 legs
        "    LLLL LLLL   ",   # 15 boots
    ],
    'up': [
        "    HHHHHHHH    ",   # 0  hair top
        "  HHHhHHHhHHH   ",   # 1
        "  HHHHHHHHHHHH  ",   # 2
        " HHHHHHHHHHHHh  ",   # 3  wide hair (flowing)
        "   HhHHHHHhH    ",   # 4  hair base / back of head
        "    BBWWWBB     ",   # 5  back-of-neck collar
        "  BBBBBBBBBBB   ",   # 6  back of outfit
        "  BBBbGbGbBBB   ",   # 7  daemon sigil on back
        "  BBBGbBbGBBB   ",   # 8  sigil cross pattern
        "  BBBBBBBBBBBB  ",   # 9  outfit body
        " BBBBBBBBBBBBBB ",   # 10
        "BB   BBBBBB   BB",   # 11 arms
        "Bb    BBBB    bB",   # 12
        "    PPPP PPPP   ",   # 13
        "    PPPP PPPP   ",   # 14
        "    LLLL LLLL   ",   # 15
    ],
    'left': [
        " HHHHHHHH       ",   # 0
        "HHHhHHHHHH      ",   # 1
        "HHHHHHHHHH      ",   # 2
        " SSSSSSSSS      ",   # 3  face profile
        " SE  SS         ",   # 4  eye near front (left)
        " SSSSSS         ",   # 5
        " SsSSSS         ",   # 6
        " WbBBBBBBB      ",   # 7  collar + outfit side
        " BBBGbBBBBB     ",   # 8  glow accent
        " BBBBBbBBBB     ",   # 9
        " BBBBBBBBBB     ",   # 10
        "  BBBBBB  B     ",   # 11 arm extended
        "   BBBBB    B   ",   # 12 forearm / hand
        "  PPPP  PPP     ",   # 13
        "  PPPP  PPP     ",   # 14
        "  LLLL  LLL     ",   # 15
    ],
    'right': [
        "       HHHHHHH  ",   # 0
        "      HHHHHhHHH ",   # 1
        "      HHHHHHHHHH",   # 2
        "      SSSSSSSSS ",   # 3  face profile
        "         SS  ES ",   # 4  eye near front (right)
        "         SSSSSS ",   # 5
        "         SSSSsS ",   # 6
        "      BBBBBBBbW ",   # 7
        "     BBBBBbGBBB ",   # 8  glow accent
        "     BBBBbBBBBB ",   # 9
        "     BBBBBBBBBB ",   # 10
        "     B  BBBBBB  ",   # 11 arm extended
        "   B    BBBBB   ",   # 12
        "     PPP  PPPP  ",   # 13
        "     PPP  PPPP  ",   # 14
        "     LLL  LLLL  ",   # 15
    ],
}


def make_svg(rows: list[str]) -> str:
    n = len(rows)
    rects: list[str] = []
    for y, row in enumerate(rows):
        x_run = None
        run_color = None
        run_len = 0

        def flush():
            nonlocal x_run, run_color, run_len
            if run_color and run_len > 0:
                rects.append(
                    f'<rect x="{x_run}" y="{y}" width="{run_len}" height="1" fill="{run_color}"/>'
                )
            x_run = None
            run_color = None
            run_len = 0

        for x, ch in enumerate(row):
            color = COLORS.get(ch)
            if color == run_color and color is not None:
                run_len += 1
            else:
                flush()
                if color is not None:
                    x_run = x
                    run_color = color
                    run_len = 1
        flush()

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {n} {n}" shape-rendering="crispEdges">\n'
        + '\n'.join(f'  {r}' for r in rects)
        + '\n</svg>\n'
    )


def validate(name: str, rows: list[str]) -> None:
    assert len(rows) == 16, f"{name}: expected 16 rows, got {len(rows)}"
    for i, row in enumerate(rows):
        assert len(row) == 16, (
            f"{name} row {i}: expected 16 chars, got {len(row)!r}  →  {row!r}"
        )
        for ch in row:
            assert ch in COLORS, f"{name} row {i}: unknown char {ch!r}"


os.makedirs(OUTPUT_DIR, exist_ok=True)

for name, rows in SPRITES.items():
    validate(name, rows)
    svg = make_svg(rows)
    path = os.path.join(OUTPUT_DIR, f'character-{name}.svg')
    with open(path, 'w') as f:
        f.write(svg)
    print(f"  wrote {path}")

print("Done — 4 sprites generated.")
