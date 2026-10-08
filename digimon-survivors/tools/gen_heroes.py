"""Generates the hero sprites (32x32 grid, heroic proportions) into ../assets.

Run after gen_sprites.py: it overwrites the hero PNGs with the sharper, non-chibi style.
Each hero is built from layered parts (back hair/cape -> legs -> robe -> arms -> head -> weapon),
then cel-shaded from the left and outlined in ink. Wind always blows to the left.
Requires Pillow: pip install pillow
"""
import math

from gen_sprites import Sprite, rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL

SKIN = rgba(240, 206, 172)
PALE = rgba(236, 226, 220)
TAN = rgba(214, 160, 116)
BLACK = rgba(34, 30, 38)
HAIR = rgba(30, 26, 34)
SILVER = rgba(226, 228, 236)
BOOT = rgba(44, 38, 44)
BLOODRED = rgba(200, 30, 40)
ICE = rgba(170, 220, 255)
FLAME_BLUE = rgba(110, 190, 255)
PAPER = rgba(240, 214, 100)


class H(Sprite):
    def __init__(self):
        super().__init__(32)
        self.protect = set()  # pixels the shading pass must leave alone (eyes etc.)

    def put(self, x, y, c):
        super().put(int(x), int(y), c)

    def line(self, x0, y0, x1, y1, c, w=1.2):
        dx, dy = x1 - x0, y1 - y0
        L = dx * dx + dy * dy or 1
        for y in range(self.h):
            for x in range(self.w):
                px, py = x + 0.5, y + 0.5
                t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / L))
                if math.hypot(px - (x0 + t * dx), py - (y0 + t * dy)) <= w / 2:
                    self.px[y][x] = c

    def rect(self, x0, y0, x1, y1, c):
        self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], c)

    def blob(self, cx, cy, rx, ry, c, ymax=None):
        self.ellipse(cx, cy, rx, ry, c, shade=False, hl=False, ymax=ymax)

    def mark(self, x, y, c):
        self.put(x, y, c)
        self.protect.add((int(x), int(y)))

    def shade(self):
        """Cel shading: light from the upper left, a dark band along each row's right edge."""
        out = [row[:] for row in self.px]
        for y in range(14, self.h):
            row = self.px[y]
            x = 0
            while x < self.w:
                if row[x] is None:
                    x += 1
                    continue
                start = x
                while x < self.w and row[x] is not None:
                    x += 1
                end = x - 1
                n = end - start + 1
                if n >= 4:
                    for k in range(1 if n < 7 else 2):
                        if (end - k, y) not in self.protect:
                            out[y][end - k] = mul(row[end - k], 0.74)
                    if (start, y) not in self.protect:
                        out[y][start] = mix(row[start], WHITE, 0.22)
        self.px = out

    def center(self):
        pass  # keep feet on the same row for every hero

    def finish(self, name):
        self.outline()
        self.save(name)


# ---------- body parts ----------

def legs(s, trousers, boots=BOOT, stance=0.0):
    s.rect(12.2 - stance, 26.5, 15, 29.4, trousers)
    s.rect(17, 26.5, 19.8 + stance, 29.4, trousers)
    s.poly([(11.4 - stance, 29), (15.2, 29), (15.2, 31.2), (10.6 - stance, 31.2)], boots)
    s.poly([(16.8, 29), (20.6 + stance, 29), (21.4 + stance, 31.2), (16.8, 31.2)], boots)


def robe(s, color, inner, trim=None, flare=1.0, length=27.6, slit=True):
    """Torso + skirt. The hem trails left in the wind."""
    s.poly([(11, 14), (21, 14), (20.6, 21.2), (11.4, 21.2)], color)
    s.poly([(11.2, 20.6), (20.8, 20.6), (21.6 + flare * 0.8, length), (14, length + 0.6), (8.4 - flare * 0.8, length + 0.4), (9.6 - flare * 0.3, 24)], color)
    for x0, x1 in [(13, 11.4), (19, 20.4)]:
        s.line(x0, 22, x1, length - 0.6, mul(color, 0.8), 0.7)
    if slit:
        s.poly([(16.2, 21.2), (17.4, length), (15.2, length)], inner)
    # crossed collar (left over right) showing the inner layer
    s.poly([(14, 14), (18, 14), (16, 17.6)], inner)
    t = trim or mix(inner, WHITE, 0.3)
    s.line(13.4, 14, 16.6, 18.6, t, 1.1)
    s.line(18.6, 14, 16.2, 17.4, t, 1.0)


def sash(s, color, tails=True, y=19.4):
    s.rect(11.2, y, 20.8, y + 1.7, color)
    if tails:
        s.poly([(11.4, y + 0.6), (8, y + 2.6), (4.4, y + 5.6), (6.4, y + 5.8), (9.4, y + 3.6), (12, y + 1.8)], color)
        s.poly([(11.6, y + 1.2), (9.6, y + 4.2), (7.4, y + 8), (9.2, y + 7.6), (11, y + 4.8)], mul(color, 0.85))


def arms(s, sleeve, skin=SKIN, wide=False, front_raised=False):
    w = 1.6 if wide else 0
    # back arm (viewer's left), hanging
    s.poly([(11.2, 14.2), (12.6, 15.2), (11.4, 21.4), (8.6 - w, 22.2 + w * 0.6), (9.2 - w * 0.4, 16.6)], sleeve)
    s.blob(9.8, 23, 1.3, 1.2, skin)
    # front arm (viewer's right) holding the weapon
    if front_raised:
        s.poly([(20.8, 14.2), (19.6, 15.4), (22.4, 18.6), (25.8 + w, 15.6 - w * 0.4), (23.4, 13.6)], sleeve)
        s.blob(25.6, 14.6, 1.3, 1.2, skin)
    else:
        s.poly([(20.8, 14.2), (19.4, 15.2), (20.6, 21.4), (23.4 + w, 22.2 + w * 0.6), (22.8 + w * 0.4, 16.6)], sleeve)
        s.blob(22.4, 23, 1.3, 1.2, skin)


def head(s, skin=SKIN, eye=rgba(60, 40, 40), mouth=True, brow=BLACK):
    s.rect(14.8, 12, 17.2, 14.6, mul(skin, 0.86))
    s.blob(16, 8.4, 3.7, 4.0, skin)
    s.poly([(12.4, 9), (19.6, 9), (18.6, 11.6), (16, 13), (13.4, 11.6)], skin)
    for y in (10, 11):
        s.mark(19 if y == 10 else 18, y, mul(skin, 0.84))
    # sharp eyes: heavy upper lash line, iris below, brows slanting down to the centre
    for x in (12, 13, 14):
        s.mark(x, 9, INK)
        s.mark(31 - x, 9, INK)
    s.mark(13, 10, eye)
    s.mark(18, 10, eye)
    s.mark(14, 10, mul(skin, 0.8))
    s.mark(17, 10, mul(skin, 0.8))
    s.mark(14, 8, mul(skin, 0.75))
    s.mark(17, 8, mul(skin, 0.75))
    s.mark(13, 8, brow)
    s.mark(18, 8, brow)
    s.mark(16, 11, mul(skin, 0.86))
    if mouth:
        s.mark(15, 12, mul(skin, 0.72))
        s.mark(16, 12, mul(skin, 0.72))


def hair_cap(s, color, bangs=True):
    s.blob(16, 5.8, 4.3, 3.2, color, ymax=6.6)
    s.rect(11.8, 6, 12.8, 10.4, color)
    s.rect(19.2, 6, 20.2, 10.4, color)
    if bangs:
        s.poly([(12.4, 6), (15.4, 6), (12.8, 8.4)], color)
        s.poly([(15.2, 6), (18.4, 6), (16.6, 7)], color)
        s.poly([(18, 6), (20.2, 6), (19.8, 9)], color)
    s.put(14, 5, mix(color, WHITE, 0.3))
    s.put(15, 5, mix(color, WHITE, 0.3))


def hair_back_long(s, color, length=24):
    s.poly([(11.6, 5), (20.4, 5), (21.4, 13), (19.6, length - 4), (12, length), (6, length + 1), (3.4, length - 1), (8.4, 16), (10.6, 9)], color)
    s.line(9, 15, 5, length - 1, mul(color, 0.8), 0.8)


def ponytail(s, color):
    s.poly([(12.4, 4), (9, 3.4), (5.4, 5.2), (2, 9.4), (5, 8.6), (2.6, 12.8), (7.4, 9.4), (11.6, 7)], color)


def topknot(s, color):
    s.blob(16, 2.6, 1.8, 1.6, color)
    s.rect(15.2, 3.4, 16.8, 4.4, color)


def headband(s, color):
    for x in range(11, 21):
        if s.px[6][x] is not None:
            s.put(x, 6, color)
    s.poly([(11.6, 5.6), (8, 7), (3.4, 6.4), (6, 8), (2.4, 10), (8.4, 8.6), (11.8, 7.2)], color)


def scarf(s, color, long=True):
    s.rect(13.4, 12.8, 18.8, 14.8, color)
    if long:
        s.poly([(13.6, 13), (9, 12.6), (4, 14.2), (0.6, 13.6), (3.4, 15.6), (0.8, 18.2), (6.4, 16.4), (13.6, 15)], color)
        s.line(4, 14.8, 9.6, 14, mul(color, 0.75), 0.6)


def cape(s, color, lining):
    s.poly([(10.2, 13.6), (21.8, 13.6), (25.6, 29.8), (14, 30.6), (2.4, 29.4), (5.2, 22), (8.4, 16)], lining)
    s.poly([(10.2, 13.6), (21.8, 13.6), (24.4, 26), (12, 28), (3.4, 27.6), (6, 20.6), (8.8, 15.6)], color)


def gat(s, color=BLACK):
    s.blob(16, 4.4, 8.4, 1.3, color)
    s.rect(12.6, 0.4, 19.4, 4.4, color)
    s.rect(12.6, 3, 19.4, 3.8, mul(color, 1.6))


def guan(s, color=GOLD):
    s.rect(14, 0.8, 18, 3.6, color)
    s.poly([(13.4, 3.6), (18.6, 3.6), (18, 4.6), (14, 4.6)], mul(color, 0.8))
    s.line(10.4, 2.2, 21.6, 2.2, color, 0.8)


def sword(s, hx, hy, tx, ty, blade=STEEL, guard=GOLD, grip=rgba(90, 50, 40), width=2.0):
    L = math.hypot(tx - hx, ty - hy)
    ux, uy = (tx - hx) / L, (ty - hy) / L
    gx, gy = hx + ux * 1.4, hy + uy * 1.4
    s.line(gx, gy, tx, ty, blade, width)
    s.line(gx + ux, gy + uy, tx - ux * 1.6, ty - uy * 1.6, mix(blade, WHITE, 0.7), 0.7)
    s.line(gx - uy * 2.2, gy + ux * 2.2, gx + uy * 2.2, gy - ux * 2.2, guard, 1.2)
    s.line(hx - ux * 3, hy - uy * 3, gx, gy, grip, 1.4)
    s.put(hx - ux * 3.4, hy - uy * 3.4, guard)


def staff(s, x0, y0, x1, y1, color, w=1.4):
    s.line(x0, y0, x1, y1, color, w)


def eyes_glow(s, color):
    for x in (13, 18):
        s.mark(x, 10, color)
    s.mark(14, 10, color)
    s.mark(17, 10, color)


# ---------- heroes ----------

def cheongpung():
    """검객: teal swordsman, red headband streaming, blade drawn low."""
    s = H()
    headband_c = RED
    legs(s, rgba(40, 52, 60), stance=0.6)
    robe(s, rgba(36, 104, 112), rgba(226, 222, 206), flare=1.4)
    sash(s, RED)
    arms(s, rgba(32, 92, 100))
    head(s, eye=rgba(40, 120, 130))
    hair_cap(s, HAIR)
    topknot(s, HAIR)
    headband(s, headband_c)
    s.shade()
    sword(s, 22.4, 22.8, 30.6, 30.4)
    s.finish('cheongpung.png')


def unhak():
    """도사: grey-white Taoist robe with black trim, gat, talismans fanned in hand."""
    s = H()
    legs(s, rgba(60, 60, 70))
    robe(s, rgba(220, 220, 210), BLACK, trim=BLACK, flare=1.8)
    sash(s, BLACK, tails=True)
    arms(s, rgba(206, 206, 196), wide=True, front_raised=True)
    head(s, eye=rgba(70, 60, 120))
    hair_cap(s, HAIR)
    gat(s)
    s.shade()
    for i, a in enumerate((-50, -20, 10)):
        r = math.radians(a)
        cx, cy = 27 + math.cos(r) * 2.4, 12 + math.sin(r) * 2.4
        s.poly([(cx - 1.2, cy - 2.4), (cx + 1.2, cy - 2.4), (cx + 1.2, cy + 2.4), (cx - 1.2, cy + 2.4)], PAPER)
        s.put(cx, cy - 1, RED)
        s.put(cx, cy + 0.4, RED)
    s.finish('unhak.png')


def yeoubi():
    """구미호: silver hair whipping, fox ears, three tails, foxfire in palm."""
    s = H()
    tail = rgba(242, 170, 84)
    tip = rgba(255, 246, 236)
    for (cx, cy, rx, ry, rot) in [(6, 22, 5.6, 2.4, 0), (5, 16.6, 5, 2.2, 0), (7.6, 27.2, 5, 2, 0)]:
        s.blob(cx, cy, rx, ry, tail)
        s.blob(cx - rx + 1.4, cy - 0.2, 1.6, 1.4, tip)
    hair_back_long(s, SILVER, 25)
    legs(s, rgba(120, 30, 40))
    robe(s, rgba(186, 36, 54), rgba(250, 210, 216), flare=1.6)
    sash(s, rgba(250, 210, 216))
    arms(s, rgba(170, 30, 48), front_raised=True)
    head(s, skin=PALE, eye=rgba(220, 50, 50))
    hair_cap(s, SILVER)
    s.poly([(11.6, 6), (10.6, 0.4), (14.2, 4)], SILVER)
    s.poly([(20.4, 6), (21.4, 0.4), (17.8, 4)], SILVER)
    s.poly([(11.8, 4.6), (11.4, 2), (13, 4)], tail)
    s.poly([(20.2, 4.6), (20.6, 2), (19, 4)], tail)
    s.shade()
    s.blob(27, 11.6, 2.2, 2.4, FLAME_BLUE)
    s.poly([(25.4, 11), (28.6, 11), (27.4, 7.4)], FLAME_BLUE)
    s.blob(27, 12, 1, 1.2, rgba(230, 248, 255))
    s.finish('yeoubi.png')


def cheolsan():
    """무승: shaved head, bare muscled shoulder, ochre kasaya, prayer beads, wrapped fists."""
    s = H()
    legs(s, rgba(150, 90, 40), stance=1.2)
    robe(s, rgba(200, 120, 44), rgba(240, 190, 120), flare=1.0)
    # bare right shoulder & arm (muscle)
    s.poly([(16, 14), (21.8, 14), (21.4, 20), (17.2, 18)], TAN)
    sash(s, rgba(120, 50, 36), tails=False)
    s.poly([(10.4, 14.2), (12, 15.2), (10.8, 21.6), (7.4, 22.4), (8.2, 16.6)], rgba(186, 108, 40))
    s.poly([(21.4, 14), (20, 15.4), (21.6, 21), (25.4, 21.2), (24.4, 15.6)], TAN)
    s.blob(8.8, 23.2, 1.6, 1.5, rgba(236, 230, 214))
    s.blob(24.4, 22.6, 1.9, 1.8, rgba(236, 230, 214))
    head(s, skin=TAN, eye=rgba(80, 50, 30))
    s.blob(16, 5.6, 3.4, 1.4, mix(TAN, WHITE, 0.3))
    s.shade()
    for i in range(11):
        a = math.pi * (0.05 + 0.9 * i / 10)
        s.put(16 + math.cos(a) * 4.4, 14 + math.sin(a) * 2.6, rgba(110, 34, 30))
    s.finish('cheolsan.png')


def dallae():
    """무녀: long black hair, white jeogori, red chima, bell wand trailing ribbons."""
    s = H()
    hair_back_long(s, HAIR, 25)
    for i, c in enumerate([rgba(60, 90, 180), rgba(250, 210, 60), RED, rgba(60, 160, 90)]):
        s.line(27, 8, 30 - i * 1.6, 18 + i * 1.6, c, 0.9)
    legs(s, rgba(200, 40, 40))
    robe(s, rgba(196, 36, 40), rgba(240, 238, 230), flare=2.2, slit=False)
    s.poly([(10.2, 14), (21.8, 14), (21.4, 18.6), (10.6, 18.6)], rgba(240, 238, 230))
    s.poly([(14, 14), (18, 14), (16, 17)], rgba(60, 90, 180))
    sash(s, rgba(60, 90, 180), y=18.4)
    arms(s, rgba(232, 230, 222), wide=True, front_raised=True)
    head(s, eye=rgba(60, 30, 40))
    hair_cap(s, HAIR)
    s.blob(12.4, 4.6, 1, 1, RED)
    s.blob(19.6, 4.6, 1, 1, RED)
    s.shade()
    staff(s, 26.4, 16, 27.6, 6, GOLD, 1.2)
    for (x, y) in [(26, 5), (28.6, 5.6), (27, 3.4), (29, 7.6)]:
        s.blob(x, y, 1.1, 1.1, GOLD)
    s.finish('dallae.png')


def yawol():
    """자객: indigo shinobi, hood and mask, long red scarf, chakram ready."""
    s = H()
    dark = rgba(44, 42, 70)
    scarf(s, RED)
    legs(s, rgba(34, 32, 52), stance=1.2)
    robe(s, dark, rgba(70, 66, 100), flare=0.8, length=25.6)
    sash(s, RED, tails=False)
    arms(s, rgba(38, 36, 62), front_raised=True)
    head(s, eye=rgba(230, 60, 60), mouth=False)
    s.blob(16, 7, 5, 5, dark, ymax=8.6)
    s.rect(11.4, 6, 12.8, 13, dark)
    s.rect(19.2, 6, 20.6, 13, dark)
    s.rect(12.4, 9.6, 19.6, 13.2, rgba(30, 28, 48))
    scarf(s, RED, long=False)
    eyes_glow(s, rgba(255, 70, 70))
    s.shade()
    s.blob(27.4, 13.4, 3.4, 3.4, STEEL)
    for y in range(32):
        for x in range(32):
            if math.hypot(x + 0.5 - 27.4, y + 0.5 - 13.4) <= 1.8:
                s.px[y][x] = None
    s.put(25, 10, WHITE)
    s.finish('yawol.png')


def songhwa():
    """약사: jade robe, long ponytail, hairpin, poison vial."""
    s = H()
    ponytail(s, HAIR)
    legs(s, rgba(60, 80, 60))
    robe(s, rgba(70, 128, 84), rgba(232, 214, 150), flare=1.4)
    sash(s, rgba(232, 214, 150))
    arms(s, rgba(60, 112, 74), front_raised=True)
    head(s, eye=rgba(40, 110, 70))
    hair_cap(s, HAIR)
    s.line(19, 3, 23, 1, GOLD, 0.9)
    s.put(23, 1, RED)
    s.shade()
    s.rect(25.6, 9, 28.4, 13.6, rgba(210, 230, 240))
    s.rect(25.6, 11, 28.4, 13.6, rgba(150, 230, 90))
    s.rect(26.2, 7.6, 27.8, 9, rgba(120, 80, 50))
    s.finish('songhwa.png')


def muyeong():
    """검귀: wild white hair, pale skin, tattered grey coat, twin swords."""
    s = H()
    s.poly([(10.4, 13.6), (21.8, 13.6), (23, 28), (19, 26.4), (16, 29.6), (12.6, 26.4), (8, 29), (4, 26)], rgba(70, 66, 74))
    hair_back_long(s, SILVER, 22)
    legs(s, rgba(50, 50, 58), stance=1.4)
    robe(s, rgba(112, 112, 124), rgba(40, 36, 44), flare=1.0, length=26)
    sash(s, rgba(40, 36, 44))
    arms(s, rgba(96, 96, 108))
    head(s, skin=PALE, eye=rgba(220, 40, 40))
    hair_cap(s, SILVER)
    s.poly([(12, 4), (9, 1), (13.4, 3)], SILVER)
    s.poly([(18, 3.6), (21.6, 0.6), (19.4, 4.4)], SILVER)
    eyes_glow(s, rgba(255, 60, 60))
    s.shade()
    sword(s, 22.4, 22.8, 30.6, 29.4, width=1.6)
    sword(s, 9.8, 23, 2, 30, width=1.6)
    s.finish('muyeong.png')


def geumbi():
    """부적술사: gold-and-crimson robe, high ponytail, talismans orbiting."""
    s = H()
    ponytail(s, HAIR)
    legs(s, rgba(120, 50, 40))
    robe(s, rgba(214, 170, 62), RED, trim=RED, flare=1.6)
    sash(s, RED)
    arms(s, rgba(196, 152, 52), front_raised=True)
    head(s, eye=rgba(170, 100, 30))
    hair_cap(s, HAIR)
    s.shade()
    for (x, y) in [(27, 9), (3.6, 13), (28.6, 19.6)]:
        s.rect(x - 1.2, y - 2.4, x + 1.2, y + 2.4, PAPER)
        s.put(x, y - 1, RED)
        s.put(x, y + 0.6, RED)
    s.finish('geumbi.png')


def seola():
    """설녀: white hair to the knees, ice-blue robe, frost shard."""
    s = H()
    hair_back_long(s, rgba(236, 244, 252), 28)
    legs(s, rgba(150, 190, 220))
    robe(s, rgba(214, 234, 248), rgba(110, 170, 220), trim=rgba(110, 170, 220), flare=2.4, slit=False)
    sash(s, rgba(110, 170, 220))
    arms(s, rgba(200, 224, 244), wide=True, front_raised=True)
    head(s, skin=rgba(240, 236, 240), eye=rgba(60, 150, 230))
    hair_cap(s, rgba(236, 244, 252))
    s.shade()
    s.poly([(27, 6), (29, 10.6), (27, 15.4), (25, 10.6)], ICE)
    s.line(27, 7.4, 27, 13.6, WHITE, 0.7)
    for x, y in [(3, 6), (6, 2), (29, 22), (24, 3)]:
        s.put(x, y, WHITE)
    s.finish('seola.png')


def cheonma():
    """천마: black and blood-red, wild long hair, crimson-lined cape, glowing eyes."""
    s = H()
    cape(s, rgba(30, 24, 32), BLOODRED)
    hair_back_long(s, HAIR, 23)
    legs(s, rgba(30, 26, 34), stance=1.2)
    robe(s, rgba(44, 34, 46), BLOODRED, trim=BLOODRED, flare=1.6)
    sash(s, BLOODRED, tails=False)
    arms(s, rgba(40, 30, 42), wide=True, front_raised=True)
    head(s, skin=PALE, eye=rgba(255, 50, 50))
    hair_cap(s, HAIR)
    s.poly([(12, 4), (8, 0.4), (13, 2.6)], HAIR)
    s.poly([(20, 4), (24, 0.4), (19, 2.6)], HAIR)
    s.rect(14.6, 3.4, 17.4, 4.6, BLOODRED)
    eyes_glow(s, rgba(255, 40, 40))
    s.shade()
    s.blob(27, 12.6, 2.6, 2.6, rgba(150, 20, 40))
    s.blob(27, 12.6, 1.4, 1.4, rgba(255, 90, 90))
    s.finish('cheonma.png')


def sansin():
    """산신령: white beard and hair, white-gold robe, gnarled staff with a gourd."""
    s = H()
    hair_back_long(s, SILVER, 22)
    legs(s, rgba(200, 196, 180))
    robe(s, rgba(240, 238, 228), GOLD, trim=GOLD, flare=2.2)
    sash(s, GOLD)
    arms(s, rgba(228, 226, 214), wide=True)
    head(s, eye=rgba(90, 80, 70), mouth=False, brow=SILVER)
    hair_cap(s, SILVER, bangs=False)
    s.poly([(12.6, 10.4), (19.4, 10.4), (18, 17), (16, 19.4), (14, 17)], SILVER)
    topknot(s, SILVER)
    s.shade()
    staff(s, 24.4, 31, 25.4, 4, rgba(120, 80, 46), 1.6)
    s.blob(26.8, 8, 1.6, 1.8, rgba(214, 150, 70))
    s.blob(26.8, 5.4, 1.1, 1.1, rgba(214, 150, 70))
    s.finish('sansin.png')


def baekmae():
    """화산파: black robe embroidered with plum blossoms, white collar, sword trailing petals."""
    s = H()
    legs(s, rgba(34, 30, 38), stance=0.8)
    robe(s, rgba(40, 34, 44), rgba(240, 236, 230), flare=1.6)
    for x, y in [(11, 24), (20, 23), (13, 16), (21, 26)]:
        s.mark(x, y, rgba(250, 140, 180))
    sash(s, rgba(230, 110, 150))
    arms(s, rgba(36, 30, 40))
    head(s, eye=rgba(210, 80, 120))
    hair_cap(s, HAIR)
    topknot(s, HAIR)
    s.shade()
    sword(s, 22.4, 22.8, 30.4, 29.8)
    for x, y in [(28, 25), (30, 22), (26, 28), (29, 18)]:
        s.blob(x, y, 0.9, 0.9, rgba(250, 150, 190))
    s.finish('baekmae.png')


def palgeol():
    """개방: patched brown clothes, messy hair, green bamboo staff, gourd."""
    s = H()
    legs(s, rgba(110, 90, 70), stance=1.0)
    robe(s, rgba(150, 120, 86), rgba(200, 180, 140), flare=1.0, length=26)
    for x, y in [(12, 22), (19, 24), (20, 16)]:
        s.rect(x - 1, y - 1, x + 1.4, y + 1.2, rgba(120, 100, 150))
    sash(s, rgba(110, 70, 40), tails=False)
    arms(s, rgba(140, 110, 78))
    head(s, skin=TAN, eye=rgba(80, 60, 40))
    hair_cap(s, HAIR)
    for x in (12, 14.6, 17.4, 20):
        s.poly([(x - 1.4, 5), (x + 1.4, 5), (x - 0.6, 1.4)], HAIR)
    s.shade()
    staff(s, 21, 31, 29.4, 3, rgba(80, 160, 70), 1.8)
    s.blob(9.4, 25.6, 1.6, 1.8, rgba(214, 150, 70))
    s.finish('palgeol.png')


def dangyu():
    """사천당가: deep green, hood and face mask, needles fanned between fingers."""
    s = H()
    green = rgba(30, 72, 52)
    legs(s, rgba(26, 46, 36), stance=1.0)
    robe(s, green, rgba(140, 200, 120), flare=1.2)
    sash(s, rgba(140, 200, 120))
    arms(s, rgba(26, 64, 46), front_raised=True)
    head(s, eye=rgba(150, 230, 90), mouth=False)
    s.blob(16, 7, 5, 5, green, ymax=8.6)
    s.rect(11.4, 6, 12.8, 13, green)
    s.rect(19.2, 6, 20.6, 13, green)
    s.rect(12.4, 9.6, 19.6, 13, rgba(24, 40, 32))
    s.shade()
    for a in (-60, -35, -10):
        r = math.radians(a)
        s.line(26.4, 14.6, 26.4 + math.cos(r) * 5.4, 14.6 + math.sin(r) * 5.4, STEEL, 0.8)
        s.put(26.4 + math.cos(r) * 5.6, 14.6 + math.sin(r) * 5.6, rgba(150, 230, 90))
    s.finish('dangyu.png')


def namgung():
    """남궁세가: royal blue and gold, jade hairpiece, sword raised."""
    s = H()
    cape(s, rgba(30, 50, 120), GOLD)
    legs(s, rgba(30, 40, 80))
    robe(s, rgba(40, 70, 160), rgba(240, 220, 150), trim=GOLD, flare=1.4)
    sash(s, GOLD, tails=False)
    arms(s, rgba(36, 62, 146), front_raised=True)
    head(s, eye=rgba(60, 90, 200))
    hair_cap(s, HAIR)
    guan(s, rgba(110, 200, 160))
    s.shade()
    sword(s, 25.6, 14.8, 28.4, 0.6, width=2.0)
    s.finish('namgung.png')


def maengju():
    """무림맹주: white-gold armour robe, golden guan, flowing white cape, great sword."""
    s = H()
    cape(s, rgba(240, 236, 226), GOLD)
    legs(s, rgba(200, 190, 160), stance=1.0)
    robe(s, rgba(246, 244, 236), GOLD, trim=GOLD, flare=1.6)
    for y in (15.4, 17.4):
        s.line(11, y, 21, y, mul(GOLD, 0.9), 0.8)
    sash(s, GOLD, tails=False)
    arms(s, rgba(236, 232, 220), wide=True)
    head(s, eye=rgba(200, 150, 40))
    hair_cap(s, HAIR)
    guan(s)
    s.shade()
    sword(s, 22.4, 22.8, 31, 31.4, width=2.8)
    s.finish('maengju.png')


def aemi():
    """아미파: lavender robe, high bun with hairpin, emei piercers in both hands."""
    s = H()
    legs(s, rgba(90, 70, 110))
    robe(s, rgba(150, 120, 196), rgba(240, 236, 246), flare=1.8)
    sash(s, rgba(240, 236, 246))
    arms(s, rgba(136, 108, 180))
    head(s, eye=rgba(120, 80, 170))
    hair_cap(s, HAIR)
    s.blob(16, 2.6, 2.4, 2, HAIR)
    s.line(12.4, 2, 20, 3.4, GOLD, 0.8)
    s.shade()
    for hx, hy, d in [(22.4, 23, 1), (9.8, 23, -1)]:
        s.line(hx, hy - 3.6, hx, hy + 4, STEEL, 0.9)
        s.blob(hx, hy, 1, 0.8, GOLD)
    s.finish('aemi.png')


def gonryun():
    """곤륜파: sky blue and white, long ponytail in the wind, frosted sword raised."""
    s = H()
    ponytail(s, HAIR)
    scarf(s, rgba(230, 240, 250))
    legs(s, rgba(70, 100, 140), stance=0.8)
    robe(s, rgba(100, 150, 206), rgba(236, 244, 252), flare=1.6)
    sash(s, rgba(236, 244, 252), tails=False)
    arms(s, rgba(88, 136, 190), front_raised=True)
    head(s, eye=rgba(70, 140, 220))
    hair_cap(s, HAIR)
    scarf(s, rgba(230, 240, 250), long=False)
    s.shade()
    sword(s, 25.6, 14.8, 30.8, 1.4, blade=ICE, width=1.8)
    s.finish('gonryun.png')


def jegal():
    """제갈세가: jade scholar robe, black scholar's cap, crane-feather fan."""
    s = H()
    legs(s, rgba(40, 70, 64))
    robe(s, rgba(60, 116, 104), rgba(236, 230, 210), trim=rgba(236, 230, 210), flare=2.0)
    sash(s, rgba(236, 230, 210))
    arms(s, rgba(52, 104, 92), wide=True, front_raised=True)
    head(s, eye=rgba(50, 110, 100))
    hair_cap(s, HAIR)
    s.rect(12.6, 0.8, 19.4, 4.6, BLACK)
    s.poly([(19.4, 1.6), (23, 3.4), (19.4, 3.6)], BLACK)
    s.shade()
    s.poly([(26.4, 14.6), (23.2, 6), (26.6, 3), (30.6, 5.6), (29.4, 12)], rgba(244, 244, 238))
    s.line(26.4, 14.6, 27, 4.6, rgba(200, 200, 190), 0.7)
    s.line(26.4, 14.6, 26.4, 17, rgba(120, 80, 50), 1.2)
    s.finish('jegal.png')


# ---------- hidden heroes ----------

def dokgo():
    """검성: grey-haired swordmaster under a straw hat, eyes closed, sheathed blade, grey cape."""
    s = H()
    cape(s, rgba(70, 70, 80), rgba(200, 200, 210))
    hair_back_long(s, rgba(190, 190, 200), 22)
    legs(s, rgba(40, 40, 48), stance=0.8)
    robe(s, rgba(36, 34, 44), rgba(210, 210, 220), trim=rgba(210, 210, 220), flare=1.4)
    sash(s, rgba(210, 210, 220))
    arms(s, rgba(32, 30, 40))
    head(s, eye=INK, brow=rgba(150, 150, 160))
    for x in (13, 18):
        s.mark(x, 10, INK)
    hair_cap(s, rgba(190, 190, 200))
    s.blob(16, 5, 8.6, 1.6, rgba(200, 170, 110))
    s.poly([(12, 4.6), (20, 4.6), (16, 0.8)], rgba(180, 150, 96))
    s.shade()
    s.line(10.4, 20.6, 3, 27.6, rgba(60, 50, 50), 2.2)
    s.line(10.4, 20.6, 13, 18, rgba(120, 80, 50), 1.4)
    s.put(10, 21, GOLD)
    s.finish('dokgo.png')


def hyeolrang():
    """혈랑: wolf-pelt hood, bandaged arms, crimson sash, heavy dao."""
    s = H()
    pelt = rgba(130, 130, 140)
    s.poly([(10, 4), (22, 4), (24, 18), (19, 22), (8, 24), (3, 20), (8, 12)], mul(pelt, 0.8))
    legs(s, rgba(50, 40, 40), stance=1.4)
    robe(s, rgba(70, 56, 52), rgba(150, 40, 40), flare=0.8, length=26)
    sash(s, BLOODRED)
    arms(s, rgba(214, 170, 130))
    for y in (17, 19, 21):
        s.line(8.4, y, 11.4, y - 0.6, rgba(230, 226, 214), 0.7)
    head(s, skin=rgba(226, 186, 150), eye=rgba(240, 40, 40))
    eyes_glow(s, rgba(255, 50, 50))
    s.blob(16, 5.6, 5.4, 3.6, pelt, ymax=7.6)
    s.poly([(11, 4.6), (10.6, 0.4), (13.6, 3)], pelt)
    s.poly([(21, 4.6), (21.4, 0.4), (18.4, 3)], pelt)
    s.poly([(12.4, 6.6), (19.6, 6.6), (16, 8.8)], mul(pelt, 0.7))
    s.shade()
    s.poly([(21.6, 21), (30.6, 26), (31, 29.6), (29, 30.6), (21, 23.6)], STEEL)
    s.line(22.6, 22.4, 30, 27.4, mix(STEEL, WHITE, 0.6), 0.6)
    s.line(19.6, 20, 22.6, 22.4, rgba(80, 40, 40), 1.6)
    s.finish('hyeolrang.png')


def hyeonmu():
    """강시술사: violet hooded robe, pale face, talisman on the brow, bell staff and ghost lights."""
    s = H()
    violet = rgba(70, 44, 96)
    cape(s, rgba(44, 28, 62), rgba(150, 90, 200))
    legs(s, rgba(40, 28, 52))
    robe(s, violet, rgba(170, 120, 220), trim=rgba(170, 120, 220), flare=1.8)
    sash(s, rgba(170, 120, 220))
    arms(s, rgba(60, 38, 84), wide=True, front_raised=True)
    head(s, skin=rgba(222, 222, 230), eye=rgba(170, 120, 255))
    s.blob(16, 6.6, 5.2, 5, violet, ymax=8.4)
    s.rect(11.2, 6, 12.6, 13, violet)
    s.rect(19.4, 6, 20.8, 13, violet)
    s.rect(15, 4, 17, 8.6, PAPER)
    s.mark(16, 5, RED)
    s.mark(16, 7, RED)
    eyes_glow(s, rgba(190, 140, 255))
    s.shade()
    staff(s, 26, 31, 26.6, 6, rgba(80, 60, 50), 1.2)
    s.blob(26.6, 5, 1.6, 1.6, GOLD)
    for x, y in [(3, 8), (5, 3), (29, 16)]:
        s.blob(x, y, 1.4, 1.6, rgba(170, 230, 255))
        s.put(x, y + 2, rgba(170, 230, 255))
    s.finish('hyeonmu.png')


def jusun():
    """주선: flushed drunken master, loose open robe, gourd held high."""
    s = H()
    legs(s, rgba(90, 70, 50), stance=1.6)
    robe(s, rgba(170, 120, 70), rgba(236, 220, 190), flare=1.2, length=26)
    s.poly([(14.4, 14), (17.6, 14), (17, 19), (15, 19)], rgba(232, 180, 140))
    sash(s, rgba(110, 60, 40))
    arms(s, rgba(156, 108, 62), wide=True, front_raised=True)
    head(s, skin=rgba(236, 186, 150), eye=rgba(80, 50, 30))
    for x in (13, 14, 17, 18):
        s.mark(x, 11, rgba(240, 120, 110))
    hair_cap(s, HAIR)
    s.poly([(13, 4), (18, 4), (20, 0.6), (16, 2.4), (12, 0.8)], HAIR)
    s.shade()
    s.blob(27, 9.4, 2.4, 2.6, rgba(214, 150, 70))
    s.blob(27, 5.4, 1.6, 1.6, rgba(214, 150, 70))
    s.rect(26.2, 2.6, 27.8, 4, RED)
    s.rect(24.8, 7.4, 29.2, 8.2, RED)
    s.finish('jusun.png')


def hwaryeon():
    """화련: phoenix maiden, flame hair, red-gold robe with feather tails, fire in hand."""
    s = H()
    fire = rgba(255, 120, 40)
    s.poly([(10, 18), (2, 16), (0.6, 22), (4, 21), (2, 27), (8, 24), (11, 22)], fire)
    s.poly([(10, 20), (4, 22), (3.4, 26), (9, 24)], FLAME_BLUE if False else rgba(255, 200, 80))
    hair_back_long(s, rgba(230, 70, 40), 24)
    legs(s, rgba(150, 40, 30))
    robe(s, rgba(210, 50, 40), GOLD, trim=GOLD, flare=2.2)
    sash(s, GOLD)
    arms(s, rgba(190, 40, 34), wide=True, front_raised=True)
    head(s, eye=rgba(255, 160, 40))
    hair_cap(s, rgba(230, 70, 40))
    for x, h in [(12, 3.4), (14.6, 5), (17.4, 4.4), (20, 3)]:
        s.poly([(x - 1.4, 4.4), (x + 1.4, 4.4), (x + 0.4, 4.4 - h)], rgba(255, 150, 50))
    s.mark(16, 5, GOLD)
    s.shade()
    s.blob(27, 12, 2.6, 2.8, fire)
    s.poly([(25.2, 11), (28.8, 11), (27.6, 6)], rgba(255, 200, 80))
    s.blob(27, 12.4, 1.2, 1.2, rgba(255, 240, 200))
    s.finish('hwaryeon.png')


def dueok():
    """두억: dokkaebi king, blue skin, horns, gold crown, tiger-striped pants, studded club."""
    s = H()
    blue = rgba(70, 110, 190)
    tiger = rgba(230, 150, 50)
    legs(s, tiger, stance=1.6)
    for x in (12.6, 14, 17.6, 19):
        s.line(x, 26.8, x + 0.6, 29, INK, 0.6)
    s.poly([(10.4, 14), (21.6, 14), (21, 22), (11, 22)], blue)
    s.poly([(10.6, 21.4), (21.4, 21.4), (22.4, 27), (9.6, 27)], tiger)
    for x in (11.6, 14.4, 17.4, 20.2):
        s.line(x, 22, x + 0.8, 26.6, INK, 0.7)
    sash(s, rgba(60, 50, 50), tails=False, y=20.6)
    arms(s, blue, skin=blue, front_raised=True)
    head(s, skin=blue, eye=rgba(255, 220, 60), mouth=False)
    s.rect(14, 11.4, 18, 12.4, INK)
    s.mark(14, 12, WHITE)
    s.mark(17, 12, WHITE)
    s.poly([(11.6, 6), (9.6, 1), (13.4, 4.4)], rgba(240, 236, 214))
    s.poly([(20.4, 6), (22.4, 1), (18.6, 4.4)], rgba(240, 236, 214))
    s.blob(16, 6, 4.4, 2, rgba(60, 40, 40), ymax=7)
    s.poly([(12.6, 4.6), (19.4, 4.6), (20, 1.6), (18, 3), (16, 0.6), (14, 3), (12, 1.6)], GOLD)
    s.shade()
    s.line(25.6, 15, 29.6, 3, rgba(140, 90, 50), 3.2)
    for (x, y) in [(28.6, 5), (29.6, 7.4), (27.6, 8.6), (28.8, 3)]:
        s.put(x, y, rgba(240, 236, 214))
    s.finish('dueok.png')


HEROES = [cheongpung, unhak, yeoubi, cheolsan, dallae, yawol, songhwa, muyeong, geumbi, seola,
          cheonma, sansin, baekmae, palgeol, dangyu, namgung, maengju, aemi, gonryun, jegal,
          dokgo, hyeolrang, hyeonmu, jusun, hwaryeon, dueok]

if __name__ == '__main__':
    for fn in HEROES:
        fn()
