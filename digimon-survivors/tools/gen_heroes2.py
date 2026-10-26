"""Tall, good-looking wuxia heroes (replaces the chibi heroes from gen_heroes.py).

48x48 cells drawn on the 2x fine grid: ~6.5-head proportions, sharp jaws and broad shoulders
for the men, big lashed eyes, lips and slim waists for the women, and per-hero hair, headwear,
outfit, cape and weapon so nobody looks alike. Run after gen_heroes.py (same output names).
Requires Pillow: pip install pillow
"""
from gen_sprites import rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL
from gen_heroes import H, sword, staff

SKIN = rgba(244, 212, 182)
PALE = rgba(238, 230, 226)
TAN = rgba(214, 164, 120)
BLACK_HAIR = rgba(34, 30, 40)
BOOT = rgba(42, 36, 44)
CX = 24


class T(H):
    def __init__(self):
        super().__init__(48)


# ---------------------------------------------------------------- body
def cape(s, c, lining):
    s.poly([(18.4, 13.2), (29.6, 13.2), (31.5, 42), (22, 43.2), (10.5, 41.5), (15, 30)], lining)
    s.poly([(18.4, 13.2), (29.6, 13.2), (30.2, 38), (21, 40.4), (12.5, 39.4), (16, 28)], c)


def back_hair(s, hp):
    c, st = hp['color'], hp['style']
    if st in ('long', 'longwild', 'verylong'):
        L = 40 if st == 'verylong' else 31
        s.poly([(19.6, 4), (28.4, 4), (29.4, 12), (27.6, L - 6), (23, L), (16, L + 1), (12.5, L - 2), (17.6, 18), (19, 9)], c)
        for i in range(3):
            s.line(18.5 - i * 1.6, 14 + i * 4, 13.5 - i * 1.4, L - 2 - i, mul(c, 0.78), 0.7)
    if st == 'ponytail':
        s.poly([(25, 2.4), (21, 1.8), (15, 3.6), (9.5, 7.6), (14, 6.8), (10.5, 11.6), (17, 7.6), (21.6, 5.6)], c)
        s.line(20, 3, 11, 9.6, mul(c, 0.75), 0.6)
    if st == 'longtied':
        s.poly([(22.6, 10), (25.4, 10), (24.6, 26), (22, 30), (19.4, 28), (21.6, 18)], c)


def legs(s, trousers, boots=BOOT, wide=0.0):
    s.rect(20.2 - wide, 38.5, 23.2, 44.6, trousers)
    s.rect(24.8, 38.5, 27.8 + wide, 44.6, trousers)
    s.poly([(19.4 - wide, 44.2), (23.4, 44.2), (23.6, 46.8), (18.6 - wide, 46.8)], boots)
    s.poly([(24.6, 44.2), (28.6 + wide, 44.2), (29.4 + wide, 46.8), (24.6, 46.8)], boots)


def torso(s, o, male):
    sh = 0 if male else 1.0  # women: narrower shoulders, slimmer waist
    w = 0 if male else 1.2
    robe, inner = o['robe'], o['inner']
    # long robe skirt, hem trailing left in the wind
    fl = o.get('flare', 1.0)
    s.poly([(19.4 + w, 22.4), (28.6 - w, 22.4), (30.6 + fl, 40.6), (25, 41.6), (17 - fl * 1.6, 41.2), (15.4 - fl * 2, 39), (18.6, 30)], robe)
    s.poly([(24.2, 23), (25.4, 23), (26.6, 41), (24.6, 41.2)], inner)  # front slit
    for x0, x1 in ((21, 18.6), (27, 29.4)):
        s.line(x0, 24, x1, 39.6, mul(robe, 0.8), 0.6)
    # chest
    s.poly([(18.2 + sh, 13.4), (29.8 - sh, 13.4), (28.8 - w, 22.6), (19.2 + w, 22.6)], robe)
    if o.get('armor'):
        s.poly([(19 + sh, 14), (29 - sh, 14), (28.2 - w, 20.6), (19.8 + w, 20.6)], o['armor'])
        for y in (16, 18):
            s.line(20 + sh, y, 28 - sh, y, mix(o['armor'], WHITE, 0.3), 0.5)
    # crossed collar showing the inner layer
    s.poly([(22.2, 13.2), (25.8, 13.2), (24, 17.6)], inner)
    t = o.get('trim', mix(inner, WHITE, 0.25))
    s.line(21.6, 13.2, 25.2, 19, t, 1.1)
    s.line(26.4, 13.2, 24.4, 17.4, t, 1.0)
    # sash with streaming tails
    sa = o['sash']
    s.rect(19.2 + w, 20.8, 28.8 - w, 23, sa)
    if o.get('tails', True):
        s.poly([(19.6 + w, 21.6), (15, 24), (10.6, 28.4), (13.2, 28.2), (16.6, 25.6), (20, 23)], sa)
        s.poly([(19.8 + w, 22.4), (17, 26.6), (14.6, 31.6), (16.6, 30.8), (19, 26)], mul(sa, 0.85))
    if o.get('pattern'):
        for x, y in o['pattern']:
            s.blob(x, y, 0.8, 0.8, o.get('pattern_c', rgba(255, 170, 200)))


def arms(s, o, pose, male, skin):
    sl = o.get('sleeve', o['robe'])
    cuff = o.get('cuff', mix(sl, o['inner'], 0.5))
    sh = 0 if male else 1.0
    # back arm hanging, wide sleeve
    s.poly([(18.6 + sh, 13.6), (20.6, 15), (19.4, 23.6), (15.2, 26.2), (14.4, 24.8), (16.6, 17)], sl)
    s.line(15.2, 25.4, 18.8, 23.4, cuff, 0.9)
    s.blob(16.4, 26.2, 1.3, 1.2, skin)
    if pose == 'fists':
        s.poly([(29.4 - sh, 13.6), (27.4, 15), (28.4, 21.6), (31.6, 22.4), (31.4, 17)], sl)
        s.blob(31.2, 22.6, 1.6, 1.5, skin)
        return (31.2, 22.6)
    if pose == 'raised':
        s.poly([(29.4 - sh, 13.6), (27.6, 15.4), (30.6, 18.4), (34.6, 13.4), (32.6, 11.8)], sl)
        s.line(31.6, 17.6, 34.2, 13.6, cuff, 0.8)
        s.blob(34.2, 12.4, 1.3, 1.3, skin)
        return (34.2, 12.4)
    if pose == 'forward':
        s.poly([(29.4 - sh, 13.6), (27.6, 15.4), (30.4, 21), (34.6, 19.6), (32.2, 15.2)], sl)
        s.line(31, 20.8, 34.4, 19.6, cuff, 0.8)
        s.blob(35, 19.4, 1.3, 1.2, skin)
        return (35, 19.4)
    # 'low': hand by the hip holding a lowered blade
    s.poly([(29.4 - sh, 13.6), (27.4, 15), (28.6, 23.4), (32.4, 25.4), (32.4, 18)], sl)
    s.line(28.8, 23.6, 32.4, 25, cuff, 0.9)
    s.blob(31.6, 26, 1.3, 1.2, skin)
    return (31.6, 26)


# ---------------------------------------------------------------- head
def face(s, male, skin, eye, closed=False, glow=None, old=False, flushed=False):
    s.rect(23.2, 10.8, 24.8, 13.0, mul(skin, 0.93))  # neck
    if male:
        s.poly([(21, 5.6), (27, 5.6), (27.1, 8.8), (25.8, 10.9), (24, 11.7), (22.2, 10.9), (20.9, 8.8)], skin)
        s.blob(24, 6.4, 3.05, 2.6, skin)
    else:
        s.blob(24, 7.4, 2.9, 3.5, skin)
        s.poly([(21.2, 7.4), (26.8, 7.4), (26, 9.9), (24, 11.2), (22, 9.9)], skin)
    s.dot(26.5, 9.0, mul(skin, 0.84))
    s.dot(26.0, 9.5, mul(skin, 0.84))
    if glow:
        for side in (-1, 1):
            cx = 24 + side * 1.6
            for i in range(-2, 2):
                s.dot(cx + i * 0.5, 8.0, glow)
            s.dot(cx + side * 1.0, 7.5, glow)
            s.dot(cx - 0.5, 8.0, mix(glow, WHITE, 0.6))
        return
    for side in (-1, 1):
        cx = 24 + side * 1.6
        if closed:
            for i in range(-2, 2):
                s.dot(cx + i * 0.5, 8.5, INK)
        elif male:
            # narrow, sharp eyes; heavy lash line with an upswept outer flick
            for i in range(-2, 2):
                s.dot(cx + i * 0.5, 8.0, INK)
            s.dot(cx + side * 1.0, 7.5, INK)
            s.dot(cx - 0.5 * (side < 0), 8.5, eye)
            s.dot(cx - 0.5 * (side > 0), 8.5, mul(eye, 0.6))
        else:
            # big lashed eyes with a coloured iris and catch-light
            for i in range(-2, 2):
                s.dot(cx + i * 0.5, 7.5, INK)
            s.dot(cx + side * 1.0, 7.0, INK)
            s.dot(cx + side * 1.5, 7.0, INK)
            s.dot(cx - 0.5, 8.0, eye)
            s.dot(cx, 8.0, eye)
            s.dot(cx - 0.5, 8.5, mul(eye, 0.55))
            s.dot(cx, 8.5, mul(eye, 0.55))
            s.dot(cx - 0.5 if side > 0 else cx, 8.0, mix(eye, WHITE, 0.8))
            s.dot(cx + side * 1.0, 8.5, mul(skin, 0.7))
    s.dot(24.5, 9.5, mul(skin, 0.78))  # nose shadow
    if male:
        s.dot(23.5, 10.5, mul(skin, 0.7))
        s.dot(24.0, 10.5, mul(skin, 0.7))
    else:
        s.dot(23.5, 10.0, rgba(214, 90, 100))
        s.dot(24.0, 10.0, rgba(196, 70, 84))
        s.dot(22.0, 9.0, mix(skin, rgba(255, 140, 150), 0.45))
        s.dot(26.0, 9.0, mix(skin, rgba(255, 140, 150), 0.45))
    if flushed:
        for x in (21.5, 22.0, 26.0, 26.5):
            s.dot(x, 9.0, rgba(236, 120, 110))


def brows(s, male, old=False, skip=False):
    if skip:
        return
    b = rgba(236, 236, 240) if old else BLACK_HAIR
    for side in (-1, 1):
        cx = 24 + side * 1.6
        if male:
            # straight, thick, slanting down toward the nose: a stern look
            for i in range(4):
                s.dot(cx - side * 0.5 + side * i * 0.5, 6.5 - (0.5 if i >= 2 else 0), b)
            s.dot(cx - side * 0.5, 7.0, b)
        else:
            for i in range(4):
                s.dot(cx - side * 0.5 + side * i * 0.5, 6.0 + (0.5 if i in (0, 3) else 0), mul(b, 1.2))


def front_hair(s, hp, male):
    c, st = hp['color'], hp['style']
    hl = mix(c, WHITE, 0.28)
    if st == 'bald':
        s.blob(24, 5.4, 3.5, 3.2, mul(SKIN, 0.95), ymax=6.4)
        return
    if st == 'hood':
        return
    s.blob(24, 4.8, 3.9, 3.4, c, ymax=6.6)
    if st in ('wild', 'longwild'):
        for (x0, y0, x1, y1) in ((20.4, 3.4, 18.2, 2.2), (22.4, 2.0, 21.2, 0.4), (25.6, 2.0, 27.0, 0.6), (27.4, 3.4, 29.8, 2.6), (20.2, 6.4, 18.4, 8.2)):
            s.poly([(x0 - 1.6, y0 + 1.4), (x0 + 1.8, y0 + 1.0), (x1, y1)], c)
    # side locks framing the face: short and tapered for men, long front strands for women
    if male:
        s.poly([(20.1, 4.6), (21.3, 4.6), (21.1, 8.6), (20.3, 9.6)], c)
        s.poly([(26.7, 4.6), (27.9, 4.6), (27.7, 9.6), (26.9, 8.6)], c)
    else:
        s.poly([(20.1, 5), (21.3, 5), (21.0, 12.6), (20.2, 14)], c)
        s.poly([(26.7, 5), (27.9, 5), (27.8, 14), (27.0, 12.6)], c)
    # bangs: men swept to one side, women parted with long front strands
    if male:
        s.poly([(20.4, 4.4), (26.6, 4.2), (23.4, 5.8), (21.2, 7.6)], c)
        s.poly([(25.8, 4.4), (27.6, 5.0), (26.8, 6.4)], c)
    else:
        s.poly([(20.4, 4.8), (23.8, 4.4), (21.2, 7.6)], c)
        s.poly([(24.2, 4.4), (27.6, 4.8), (26.8, 7.6)], c)
    s.line(21.6, 3.2, 23.6, 2.6, hl, 0.6)
    if st == 'topknot':
        s.blob(24, 1.4, 1.7, 1.4, c)
        s.rect(23.2, 2.2, 24.8, 3, hp.get('tie', GOLD))
    if st == 'bun':
        s.blob(24, 1.2, 2.2, 1.7, c)
        s.line(21, 1.2, 28, 0.6, hp.get('pin', GOLD), 0.6)
        s.blob(28.2, 0.7, 0.7, 0.7, hp.get('jewel', rgba(120, 220, 170)))
    if st == 'twinbuns':
        for x in (20.4, 27.6):
            s.blob(x, 2.4, 1.8, 1.6, c)
        s.line(19, 1.4, 22, 2.4, hp.get('pin', GOLD), 0.5)
        s.line(29, 1.4, 26, 2.4, hp.get('pin', GOLD), 0.5)


def headwear(s, kind, c=None):
    if kind == 'headband':
        s.rect(20.2, 4.6, 27.8, 5.6, c)
        s.poly([(20.4, 4.8), (16, 6.6), (11.4, 5.4), (14.4, 7.4), (10.6, 9.6), (16.6, 8.2), (20.4, 6)], c)
    elif kind == 'gat':
        s.blob(24, 3.6, 8.6, 1.2, c)
        s.rect(20.8, -0.4, 27.2, 3.6, c)
        s.rect(20.8, 2.4, 27.2, 3.0, mix(c, WHITE, 0.25))
    elif kind == 'guan':
        s.rect(22.4, -0.2, 25.6, 2.6, c)
        s.poly([(21.8, 2.6), (26.2, 2.6), (25.6, 3.4), (22.4, 3.4)], mul(c, 0.8))
        s.line(19.6, 1.2, 28.4, 1.2, c, 0.7)
        s.blob(24, 1, 0.8, 0.8, rgba(120, 220, 170))
    elif kind == 'foxears':
        s.poly([(20, 3.6), (19.4, -1.6), (22.6, 2)], c)
        s.poly([(28, 3.6), (28.6, -1.6), (25.4, 2)], c)
        s.poly([(20.4, 2.6), (20.2, 0), (21.6, 2)], rgba(255, 180, 190))
        s.poly([(27.6, 2.6), (27.8, 0), (26.4, 2)], rgba(255, 180, 190))
    elif kind == 'horns':
        s.poly([(20.6, 3), (16.6, -2), (21.8, 1.4)], c)
        s.poly([(27.4, 3), (31.4, -2), (26.2, 1.4)], c)
    elif kind == 'hood':
        s.blob(24, 6, 4.8, 5.2, c, ymax=9.4)
        s.rect(19.2, 5, 20.8, 14, c)
        s.rect(27.2, 5, 28.8, 14, c)
    elif kind == 'strawhat':
        s.poly([(14.6, 5.4), (33.4, 5.4), (24, -0.6)], c)
        s.line(15.4, 5.2, 32.6, 5.2, mul(c, 0.7), 0.6)
        for x in (19, 24, 29):
            s.line(24, -0.2, x, 5.2, mul(c, 0.82), 0.4)
    elif kind == 'scholarcap':
        s.rect(20.6, 0.6, 27.4, 4.4, c)
        s.poly([(27.4, 1.6), (30.6, 0.6), (30.6, 2.2)], c)
        s.poly([(20.6, 1.6), (17.4, 0.6), (17.4, 2.2)], c)
    elif kind == 'crown':
        s.poly([(20.6, 3.4), (27.4, 3.4), (28, -0.4), (26.2, 1.4), (24, -1), (21.8, 1.4), (20, -0.4)], c)
        s.blob(24, 1.8, 0.8, 0.8, RED)
    elif kind == 'mask':
        s.rect(20.8, 8.6, 27.2, 11.6, c)
    elif kind == 'talisman_brow':
        s.rect(23.2, 3.2, 24.8, 8.4, rgba(240, 214, 100))
        s.line(24, 4, 24, 7.6, RED, 0.5)


# ---------------------------------------------------------------- weapons & props
def wpn(s, kind, hand, c=None):
    hx, hy = hand
    if kind == 'sword_low':
        sword(s, hx, hy, hx + 9, hy + 13, blade=c or STEEL)
    elif kind == 'sword_up':
        sword(s, hx, hy + 1, hx + 4, hy - 13, blade=c or STEEL)
    elif kind == 'sword_fwd':
        sword(s, hx, hy, hx + 11, hy - 6, blade=c or STEEL)
    elif kind == 'greatsword':
        sword(s, hx, hy + 1, hx + 5, hy - 16, blade=c or STEEL, width=3.0)
    elif kind == 'dao':
        sword(s, hx, hy, hx + 10, hy + 11, blade=c or rgba(200, 200, 210), guard=rgba(90, 60, 50), width=3.0)
    elif kind == 'sheathed':
        s.line(hx - 2, hy - 1, hx + 9, hy + 12, rgba(70, 50, 44), 1.6)
        s.line(hx - 4, hy - 3, hx - 2, hy - 1, GOLD, 1.0)
    elif kind == 'staff':
        staff(s, hx - 1, hy + 21, hx + 1.5, hy - 14, c or rgba(110, 76, 50), 1.3)
    elif kind == 'bamboo':
        staff(s, hx - 2, hy + 20, hx + 3, hy - 13, rgba(110, 170, 80), 1.3)
        for k in range(4):
            y = hy - 10 + k * 8
            s.line(hx - 0.5 + k * 0.2, y, hx + 1.6 + k * 0.2, y, rgba(70, 120, 50), 0.5)
    elif kind == 'talismans':
        for i, a in enumerate((-0.5, 0, 0.5)):
            x, y = hx + 2 + i * 2.2, hy - 3 - abs(a) * 3
            s.rect(x - 0.9, y - 2.4, x + 0.9, y + 2.4, rgba(240, 214, 100))
            s.line(x, y - 1.6, x, y + 1.6, RED, 0.4)
    elif kind == 'orb':
        s.blob(hx + 1.6, hy - 1.6, 2.4, 2.4, c)
        s.blob(hx + 1.2, hy - 2.2, 0.9, 0.9, WHITE)
    elif kind == 'flame':
        s.poly([(hx - 1, hy), (hx + 4, hy), (hx + 2.6, hy - 5), (hx + 1.6, hy - 2.6), (hx + 0.6, hy - 6)], rgba(255, 120, 40))
        s.poly([(hx, hy - 0.4), (hx + 3, hy - 0.4), (hx + 1.6, hy - 3.4)], rgba(255, 220, 90))
    elif kind == 'fan':
        s.poly([(hx, hy), (hx + 7, hy - 6), (hx + 8.4, hy - 1), (hx + 6.4, hy + 3.4)], rgba(240, 240, 230))
        for k in range(4):
            s.line(hx, hy, hx + 7 - k * 0.2, hy - 5 + k * 2.6, rgba(150, 150, 140), 0.4)
    elif kind == 'bellwand':
        staff(s, hx, hy + 2, hx + 1, hy - 11, GOLD, 1.0)
        s.blob(hx + 1, hy - 11.6, 1.2, 1.2, GOLD)
        for k, col in enumerate((RED, rgba(80, 160, 255), rgba(255, 220, 80), rgba(100, 200, 120))):
            s.line(hx + 1, hy - 10, hx + 2.4 + k * 0.9, hy - 3 + k * 1.4, col, 0.6)
    elif kind == 'gourd':
        s.blob(hx + 0.8, hy - 2.4, 1.7, 1.8, rgba(196, 150, 70))
        s.blob(hx + 0.8, hy - 5.2, 1.1, 1.2, rgba(196, 150, 70))
        s.line(hx + 0.2, hy - 3.8, hx + 1.4, hy - 3.8, RED, 0.5)
    elif kind == 'chakram':
        s.blob(hx + 2.6, hy - 1, 3.2, 3.2, STEEL)
        s.erase_disc(hx + 2.6, hy - 1, 1.8)
        s.dot(hx + 1.6, hy - 3.6, WHITE)
    elif kind == 'needles':
        for k in range(4):
            s.line(hx + 0.6, hy, hx + 5.2, hy - 4.6 + k * 1.6, rgba(220, 224, 236), 0.4)
    elif kind == 'piercers':
        s.line(hx, hy, hx + 6, hy - 5, STEEL, 0.6)
        s.line(16.4, 26, 11.4, 31, STEEL, 0.6)
    elif kind == 'vial':
        s.blob(hx + 1, hy - 1.6, 1.4, 1.8, rgba(120, 220, 120))
        s.rect(hx + 0.4, hy - 4.2, hx + 1.6, hy - 3.2, rgba(220, 220, 230))
    elif kind == 'frost':
        s.poly([(hx, hy), (hx + 2, hy - 7), (hx + 3.4, hy - 1)], rgba(190, 236, 255))
        s.poly([(hx + 1.6, hy - 1), (hx + 5, hy - 4), (hx + 3, hy + 1)], rgba(150, 210, 250))
    elif kind == 'club':
        s.line(hx, hy, hx + 7, hy - 12, rgba(120, 80, 50), 2.4)
        for k in range(3):
            s.blob(hx + 4.6 + k * 1, hy - 7.6 - k * 1.8, 0.7, 0.7, STEEL)


def finish_hero(s, name, rim=(196, 222, 255, 255)):
    s.rim(rim, 0.45)
    s.outline()
    s.save(name)


# ---------------------------------------------------------------- the cast
def hero(name, male, hair, outfit, pose, weapon, skin=SKIN, eye=rgba(60, 40, 40), hat=None, hat_c=None,
         cape_c=None, extra=None, wpn_c=None, face_opts=None, rim=(196, 222, 255, 255), wide=0.0):
    s = T()
    if cape_c:
        cape(s, *cape_c)
    back_hair(s, hair)
    if extra and 'behind' in extra:
        extra['behind'](s)
    legs(s, outfit.get('trousers', mul(outfit['robe'], 0.6)), wide=wide)
    torso(s, outfit, male)
    hand = arms(s, outfit, pose, male, skin)
    face(s, male, skin, eye, **(face_opts or {}))
    front_hair(s, hair, male)
    fo = face_opts or {}
    brows(s, male, fo.get('old', False), skip=bool(fo.get('glow')) or hair['style'] == 'hood')
    if hat:
        headwear(s, hat, hat_c)
    if extra and 'front' in extra:
        extra['front'](s)
    s.shade(0)
    if weapon:
        wpn(s, weapon, hand, wpn_c)
    if extra and 'after' in extra:
        extra['after'](s)
    finish_hero(s, name + '.png', rim)


def tails3(s):
    for i, (x, y) in enumerate(((10, 30), (8.4, 24.6), (11, 19.4))):
        s.poly([(19, 30), (x + 3, y + 3), (x, y), (x + 1, y - 2.6), (17.4, 26)], rgba(240, 210, 170))
        s.blob(x + 0.4, y - 0.4, 1.4, 1.4, rgba(255, 190, 120))


def beard(s):
    s.poly([(21.4, 9.6), (26.6, 9.6), (25.6, 18.6), (24, 21), (22.4, 18.6)], rgba(240, 240, 244))


def stubble(s):
    s.poly([(21.6, 10), (26.4, 10), (25.6, 11.4), (24, 12), (22.4, 11.4)], rgba(60, 50, 50))


def bare_shoulder(s):
    s.poly([(20.6, 13.4), (24.8, 13.4), (24, 19), (20, 19)], TAN)
    s.line(21.4, 15.6, 23.4, 15.6, mul(TAN, 0.8), 0.5)


def beads(s):
    for i in range(9):
        s.blob(20.6 + i * 0.85, 14 + abs(i - 4) * 0.6, 0.55, 0.55, rgba(120, 70, 40))


def tiger(s):
    for y in (39.5, 41.5, 43.5):
        s.line(20.4, y, 23, y + 0.6, BLACK_HAIR, 0.5)
        s.line(25, y, 27.6, y + 0.6, BLACK_HAIR, 0.5)


def feathers(s):
    for i in range(3):
        s.poly([(18, 34 + i * 2), (9 - i, 40 + i * 2), (12, 36 + i * 2)], (rgba(255, 120, 40), rgba(255, 190, 60), rgba(230, 60, 40))[i])


def petals(s):
    for x, y in ((40, 34), (43, 37.6), (38, 39), (44.6, 32)):
        s.blob(x, y, 0.8, 0.8, rgba(255, 170, 200))


def patches(s):
    for x, y in ((21, 30), (27, 34), (20, 17)):
        s.rect(x - 1.2, y - 1.2, x + 1.2, y + 1.2, rgba(160, 130, 90))


def bandages(s):
    for y in (16, 18, 20):
        s.line(14.8, y + 6, 19, y + 4.6, rgba(230, 220, 200), 0.6)


CAST = [
    lambda: hero('cheongpung', True, {'style': 'topknot', 'color': BLACK_HAIR, 'tie': RED},
                 {'robe': rgba(36, 104, 112), 'inner': rgba(232, 226, 210), 'sash': RED}, 'low', 'sword_low',
                 eye=rgba(40, 120, 120), hat='headband', hat_c=RED),
    lambda: hero('unhak', True, {'style': 'longtied', 'color': BLACK_HAIR},
                 {'robe': rgba(226, 224, 214), 'inner': rgba(40, 40, 46), 'sash': rgba(40, 40, 46), 'trim': rgba(40, 40, 46)}, 'raised', 'talismans',
                 hat='gat', hat_c=rgba(30, 28, 34), extra={'after': lambda s: s.blob(37.6, 8.4, 0.9, 0.9, rgba(180, 160, 255))}),
    lambda: hero('yeoubi', False, {'style': 'verylong', 'color': rgba(232, 232, 240)},
                 {'robe': rgba(196, 48, 64), 'inner': rgba(255, 200, 210), 'sash': rgba(255, 200, 210)}, 'forward', 'orb',
                 eye=rgba(220, 120, 40), hat='foxears', hat_c=rgba(232, 232, 240), wpn_c=rgba(110, 190, 255), extra={'behind': tails3}),
    lambda: hero('cheolsan', True, {'style': 'bald', 'color': SKIN},
                 {'robe': rgba(196, 122, 52), 'inner': rgba(150, 80, 40), 'sash': rgba(120, 60, 30), 'sleeve': TAN, 'cuff': rgba(230, 220, 200)}, 'fists', None,
                 skin=TAN, extra={'front': lambda s: (bare_shoulder(s), beads(s))}, wide=1.0),
    lambda: hero('dallae', False, {'style': 'long', 'color': BLACK_HAIR},
                 {'robe': rgba(200, 40, 46), 'inner': rgba(246, 242, 232), 'sash': rgba(60, 80, 160), 'sleeve': rgba(246, 242, 232), 'cuff': rgba(60, 80, 160)}, 'raised', 'bellwand',
                 eye=rgba(70, 40, 40), extra={'front': lambda s: s.poly([(18.6, 13.4), (29.4, 13.4), (28.6, 20.4), (19.4, 20.4)], rgba(246, 242, 232))}),
    lambda: hero('yawol', True, {'style': 'hood', 'color': rgba(44, 42, 70)},
                 {'robe': rgba(44, 42, 70), 'inner': rgba(80, 76, 110), 'sash': RED, 'tails': True}, 'forward', 'chakram',
                 hat='hood', hat_c=rgba(40, 38, 64), face_opts={'glow': rgba(255, 70, 70)}, extra={'front': lambda s: headwear(s, 'mask', rgba(28, 26, 44))}),
    lambda: hero('songhwa', False, {'style': 'ponytail', 'color': rgba(50, 40, 34)},
                 {'robe': rgba(96, 140, 86), 'inner': rgba(232, 240, 220), 'sash': rgba(230, 200, 90)}, 'forward', 'vial',
                 eye=rgba(60, 120, 70), extra={'front': lambda s: s.line(26, 2.4, 29.6, 1.2, GOLD, 0.6)}),
    lambda: hero('muyeong', True, {'style': 'longwild', 'color': rgba(230, 230, 236)},
                 {'robe': rgba(110, 112, 124), 'inner': rgba(60, 60, 70), 'sash': rgba(160, 40, 50)}, 'low', 'sword_low',
                 skin=PALE, eye=rgba(200, 40, 50), extra={'after': lambda s: sword(s, 16.4, 26, 7.4, 36)}),
    lambda: hero('geumbi', False, {'style': 'ponytail', 'color': rgba(40, 30, 30)},
                 {'robe': rgba(200, 50, 46), 'inner': rgba(240, 200, 90), 'sash': GOLD, 'trim': GOLD}, 'forward', 'talismans',
                 eye=rgba(200, 140, 40), extra={'front': lambda s: s.line(20, 2, 26, 1, GOLD, 0.6)}),
    lambda: hero('seola', False, {'style': 'verylong', 'color': rgba(240, 246, 252)},
                 {'robe': rgba(170, 214, 240), 'inner': rgba(250, 252, 255), 'sash': rgba(110, 170, 220)}, 'forward', 'frost',
                 skin=PALE, eye=rgba(90, 170, 230), rim=(220, 240, 255, 255)),
    lambda: hero('cheonma', True, {'style': 'long', 'color': BLACK_HAIR},
                 {'robe': rgba(40, 32, 44), 'inner': rgba(190, 26, 40), 'sash': rgba(190, 26, 40), 'trim': rgba(190, 26, 40)}, 'forward', 'orb',
                 skin=PALE, cape_c=(rgba(30, 24, 32), rgba(190, 26, 40)), wpn_c=rgba(170, 20, 40), face_opts={'glow': rgba(255, 50, 50)}, rim=(255, 140, 140, 255)),
    lambda: hero('sansin', True, {'style': 'long', 'color': rgba(240, 240, 244)},
                 {'robe': rgba(244, 238, 220), 'inner': rgba(220, 190, 110), 'sash': rgba(200, 160, 70), 'trim': GOLD}, 'raised', 'staff',
                 face_opts={'old': True, 'closed': True}, extra={'front': beard, 'after': lambda s: wpn(s, 'gourd', (36, 6))}),
    lambda: hero('baekmae', False, {'style': 'bun', 'color': BLACK_HAIR, 'pin': rgba(255, 170, 200), 'jewel': rgba(255, 120, 170)},
                 {'robe': rgba(40, 34, 42), 'inner': rgba(244, 240, 236), 'sash': rgba(240, 110, 160), 'pattern': ((21, 27), (27, 31), (22, 36), (20, 16), (28, 18)), 'pattern_c': rgba(255, 150, 190)}, 'low', 'sword_low',
                 eye=rgba(200, 80, 130), extra={'after': petals}),
    lambda: hero('palgeol', True, {'style': 'wild', 'color': rgba(70, 54, 40)},
                 {'robe': rgba(130, 100, 70), 'inner': rgba(90, 70, 50), 'sash': rgba(80, 140, 60)}, 'raised', 'bamboo',
                 skin=TAN, extra={'front': lambda s: (patches(s), stubble(s)), 'after': lambda s: wpn(s, 'gourd', (19.6, 24))}),
    lambda: hero('dangyu', True, {'style': 'hood', 'color': rgba(30, 70, 50)},
                 {'robe': rgba(36, 82, 60), 'inner': rgba(150, 220, 120), 'sash': rgba(150, 220, 120)}, 'forward', 'needles',
                 hat='hood', hat_c=rgba(30, 70, 50), eye=rgba(120, 230, 120), extra={'front': lambda s: headwear(s, 'mask', rgba(24, 56, 40))}),
    lambda: hero('namgung', True, {'style': 'topknot', 'color': BLACK_HAIR, 'tie': GOLD},
                 {'robe': rgba(40, 70, 150), 'inner': rgba(236, 226, 190), 'sash': GOLD, 'trim': GOLD}, 'raised', 'sword_up',
                 eye=rgba(60, 90, 170), hat='guan', hat_c=rgba(110, 200, 160)),
    lambda: hero('maengju', True, {'style': 'long', 'color': BLACK_HAIR},
                 {'robe': rgba(246, 242, 230), 'inner': rgba(220, 180, 80), 'sash': GOLD, 'trim': GOLD, 'armor': rgba(220, 190, 110)}, 'raised', 'greatsword',
                 hat='guan', hat_c=GOLD, cape_c=(rgba(250, 248, 240), rgba(220, 190, 110)), rim=(255, 236, 180, 255)),
    lambda: hero('aemi', False, {'style': 'bun', 'color': BLACK_HAIR, 'pin': rgba(200, 170, 255), 'jewel': rgba(230, 200, 255)},
                 {'robe': rgba(170, 140, 214), 'inner': rgba(246, 240, 252), 'sash': rgba(110, 80, 170)}, 'forward', 'piercers',
                 eye=rgba(120, 80, 190)),
    lambda: hero('gonryun', True, {'style': 'ponytail', 'color': BLACK_HAIR},
                 {'robe': rgba(150, 200, 240), 'inner': rgba(250, 252, 255), 'sash': rgba(60, 110, 180)}, 'raised', 'sword_up',
                 eye=rgba(70, 130, 200), wpn_c=rgba(200, 236, 255), rim=(220, 240, 255, 255)),
    lambda: hero('jegal', False, {'style': 'twinbuns', 'color': BLACK_HAIR, 'pin': rgba(120, 210, 170)},
                 {'robe': rgba(80, 150, 130), 'inner': rgba(240, 244, 236), 'sash': rgba(30, 40, 50)}, 'forward', 'fan',
                 eye=rgba(50, 110, 90)),
    lambda: hero('dokgo', True, {'style': 'longtied', 'color': rgba(170, 170, 178)},
                 {'robe': rgba(120, 120, 128), 'inner': rgba(60, 60, 66), 'sash': rgba(50, 50, 56)}, 'low', 'sheathed',
                 hat='strawhat', hat_c=rgba(200, 170, 110), cape_c=(rgba(140, 140, 146), rgba(90, 90, 96)), face_opts={'closed': True}),
    lambda: hero('hyeolrang', True, {'style': 'wild', 'color': rgba(60, 40, 40)},
                 {'robe': rgba(70, 56, 54), 'inner': rgba(180, 30, 40), 'sash': rgba(180, 30, 40), 'sleeve': TAN}, 'low', 'dao',
                 skin=TAN, eye=rgba(220, 40, 40), extra={'front': bandages, 'behind': lambda s: s.poly([(18, 13), (30, 13), (32, 22), (16, 22)], rgba(130, 120, 110))}),
    lambda: hero('hyeonmu', True, {'style': 'hood', 'color': rgba(90, 60, 130)},
                 {'robe': rgba(96, 64, 140), 'inner': rgba(40, 30, 60), 'sash': rgba(200, 170, 80)}, 'raised', 'bellwand',
                 skin=PALE, hat='hood', hat_c=rgba(80, 50, 120), eye=rgba(170, 120, 255), extra={'front': lambda s: headwear(s, 'talisman_brow')}),
    lambda: hero('jusun', True, {'style': 'wild', 'color': BLACK_HAIR},
                 {'robe': rgba(200, 120, 70), 'inner': SKIN, 'sash': rgba(120, 70, 40), 'tails': True}, 'raised', 'gourd',
                 face_opts={'flushed': True, 'closed': True}),
    lambda: hero('hwaryeon', False, {'style': 'verylong', 'color': rgba(230, 70, 40)},
                 {'robe': rgba(200, 50, 36), 'inner': rgba(255, 210, 90), 'sash': GOLD, 'trim': GOLD}, 'forward', 'flame',
                 eye=rgba(240, 160, 40), extra={'behind': feathers}, rim=(255, 200, 120, 255)),
    lambda: hero('dueok', True, {'style': 'wild', 'color': rgba(30, 30, 40)},
                 {'robe': rgba(60, 90, 150), 'inner': rgba(230, 170, 60), 'sash': rgba(230, 170, 60), 'trousers': rgba(230, 170, 60)}, 'raised', 'club',
                 skin=rgba(110, 150, 220), eye=rgba(255, 220, 60), hat='horns', hat_c=rgba(240, 236, 220),
                 extra={'front': lambda s: (headwear(s, 'crown', GOLD), tiger(s))}, wide=1.2),
    lambda: hero('nameless', True, {'style': 'hood', 'color': rgba(120, 120, 128)},
                 {'robe': rgba(120, 120, 128), 'inner': rgba(80, 80, 88), 'sash': rgba(80, 80, 88), 'tails': False}, 'low', 'sword_low',
                 hat='hood', hat_c=rgba(110, 110, 118), face_opts={'glow': rgba(240, 240, 250)}, cape_c=(rgba(110, 110, 118), rgba(80, 80, 88))),
]

if __name__ == '__main__':
    for make in CAST:
        make()
