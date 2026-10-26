"""Generates upright scenery props for the 2.5D field (trees, rocks, pagodas, graves ...) into ../assets.

32x32 grids drawn tall, feet on the bottom rows; the game draws them standing up and depth-sorted.
Run after gen_heroes.py. Requires Pillow: pip install pillow
"""
from gen_sprites import rgba, mul, mix, WHITE, INK, RED, GOLD
from gen_heroes import H

BARK = rgba(110, 76, 52)
PINE = rgba(52, 104, 72)
STONE = rgba(150, 146, 140)
MOSS = rgba(110, 140, 80)


def prop(name):
    def deco(fn):
        def run():
            s = H()
            fn(s)
            s.shade(0)
            s.finish(name + '.png')
        run.__name__ = name
        return run
    return deco


@prop('prop_pine')
def pine(s):
    s.rect(14.6, 20, 17.4, 31.6, BARK)
    s.line(16, 26, 12, 22, BARK, 1.2)
    for i, (y, w) in enumerate([(5, 5), (10, 8.6), (15, 11.4), (20, 13.4)]):
        s.poly([(16 - w, y + 5), (16, y - 3), (16 + w, y + 5)], mul(PINE, 1 - i * 0.06))
        s.line(16 - w + 2, y + 4, 16 + w - 3, y + 4, mix(PINE, WHITE, 0.25), 0.6)
    s.blob(16, 31, 6, 1.2, rgba(80, 70, 50))


@prop('prop_bamboo')
def bamboo(s):
    for x, h, c in [(10, 2, rgba(120, 170, 80)), (16, 0.5, rgba(100, 156, 70)), (22, 4, rgba(130, 180, 90))]:
        s.rect(x - 1.2, h, x + 1.2, 31.6, c)
        for y in range(int(h) + 4, 31, 6):
            s.line(x - 1.4, y, x + 1.4, y, mul(c, 0.7), 0.7)
        s.poly([(x + 1, h + 6), (x + 6, h + 4), (x + 2, h + 8)], mix(c, WHITE, 0.15))
        s.poly([(x - 1, h + 11), (x - 6, h + 9), (x - 2, h + 13)], mix(c, WHITE, 0.15))


@prop('prop_rock')
def rock(s):
    s.poly([(4, 31.6), (6, 22), (11, 16), (19, 15), (25, 19), (28, 26), (28, 31.6)], STONE)
    s.poly([(11, 16), (19, 15), (17, 21), (12, 21)], mix(STONE, WHITE, 0.25))
    s.line(18, 22, 23, 29, mul(STONE, 0.7), 0.7)
    s.blob(8, 29, 3, 1.4, MOSS)
    s.blob(24, 30, 2.4, 1.2, MOSS)


@prop('prop_pagoda')
def pagoda(s):
    s.rect(11, 27, 21, 31.6, STONE)
    for i, y in enumerate([22, 16, 10]):
        w = 9 - i * 1.6
        s.rect(16 - w * 0.55, y, 16 + w * 0.55, y + 5, STONE)
        s.poly([(16 - w - 1, y + 0.6), (16 + w + 1, y + 0.6), (16 + w - 1, y - 1.4), (16 - w + 1, y - 1.4)], mul(STONE, 0.8))
    s.rect(15, 3, 17, 9, mul(STONE, 0.85))
    s.blob(16, 3, 1.6, 1.4, GOLD)
    s.blob(12, 30.4, 2.4, 1, MOSS)


@prop('prop_grave')
def grave(s):
    s.blob(16, 26, 12, 6, rgba(110, 120, 70))
    s.blob(16, 25, 10, 4.6, rgba(130, 140, 80))
    s.rect(14, 12, 18, 25, STONE)
    s.poly([(13.4, 12), (18.6, 12), (16, 9.6)], STONE)
    for y in (15, 18, 21):
        s.line(15, y, 17, y, mul(STONE, 0.6), 0.5)
    s.blob(22, 27, 1.2, 1, rgba(230, 230, 220))


@prop('prop_deadtree')
def deadtree(s):
    c = rgba(80, 66, 60)
    s.rect(14.4, 14, 17.6, 31.6, c)
    for (x0, y0, x1, y1) in [(16, 16, 7, 6), (16, 15, 25, 4), (9, 9, 4, 8), (23, 7, 28, 9), (16, 20, 22, 14), (16, 12, 15, 2)]:
        s.line(x0, y0, x1, y1, c, 1.3)
    s.mark(26, 5, rgba(40, 32, 36))
    s.mark(27, 5, rgba(40, 32, 36))
    s.blob(16, 31, 5, 1.2, rgba(70, 60, 50))


@prop('prop_lantern')
def lantern(s):
    wood = rgba(90, 60, 44)
    s.rect(15, 6, 17, 31.6, wood)
    s.line(16, 7, 23, 7, wood, 1)
    s.blob(23, 12, 3.2, 4, RED)
    s.blob(23, 12, 1.8, 2.6, rgba(255, 200, 90))
    s.rect(21.6, 7, 24.4, 8, INK)
    s.rect(21.6, 16, 24.4, 17, INK)
    s.rect(12, 30, 20, 31.6, mul(wood, 0.8))


@prop('prop_house')
def house(s):
    s.rect(5, 18, 27, 31.6, rgba(206, 180, 140))
    s.rect(13.6, 23, 18.4, 31.6, rgba(110, 76, 52))
    s.rect(7, 21, 11, 25, rgba(240, 230, 200))
    s.rect(21, 21, 25, 25, rgba(240, 230, 200))
    s.poly([(1, 19), (31, 19), (27, 11), (5, 11)], rgba(200, 170, 90))
    for x in range(4, 30, 3):
        s.line(x, 12, x - 1, 19, rgba(170, 140, 70), 0.6)
    s.blob(16, 11, 11, 1.6, rgba(180, 150, 80))


PROPS = [pine, bamboo, rock, pagoda, grave, deadtree, lantern, house]

if __name__ == '__main__':
    for fn in PROPS:
        fn()
