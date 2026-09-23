"""Generates the pixel-art sprites in ../assets. Requires Pillow: pip install pillow"""
import math
import os
from PIL import Image

EXPORT_SCALE = 4
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')

WHITE = (255, 255, 255, 255)
EYE = (52, 38, 64, 255)
BLUSH = (255, 150, 175, 255)
MOUTH = (120, 50, 70, 255)
CREAM = (252, 242, 218, 255)


def rgba(r, g, b, a=255):
    return (r, g, b, a)


def mul(c, f):
    return (int(c[0] * f), int(c[1] * f), int(c[2] * f), c[3])


def mix(c, d, t):
    return tuple(int(c[i] + (d[i] - c[i]) * t) for i in range(3)) + (c[3],)


class Sprite:
    def __init__(self, w, h=None):
        self.w = w
        self.h = h or w
        self.px = [[None] * self.w for _ in range(self.h)]

    def put(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = c

    def mirror_x(self, x):
        return self.w - 1 - x

    def ellipse(self, cx, cy, rx, ry, base, shade=True, hl=True, ymax=None):
        dark = mul(base, 0.8)
        light = mix(base, WHITE, 0.45)
        hl = hl and rx >= 3 and ry >= 3
        for y in range(self.h):
            if ymax is not None and y >= ymax:
                continue
            for x in range(self.w):
                px, py = x + 0.5, y + 0.5
                nx, ny = (px - cx) / rx, (py - cy) / ry
                if nx * nx + ny * ny > 1:
                    continue
                c = base
                if shade:
                    sx = (px - (cx - 0.18 * rx)) / (rx * 0.97)
                    sy = (py - (cy - 0.22 * ry)) / (ry * 0.97)
                    if sx * sx + sy * sy > 1:
                        c = dark
                if hl:
                    hx = (px - (cx - 0.42 * rx)) / (0.26 * rx)
                    hy = (py - (cy - 0.5 * ry)) / (0.2 * ry)
                    if hx * hx + hy * hy <= 1:
                        c = light
                self.px[y][x] = c

    def poly(self, pts, color):
        for y in range(self.h):
            for x in range(self.w):
                if _inside(pts, x + 0.5, y + 0.5):
                    self.px[y][x] = color

    def poly_sym(self, pts, color):
        self.poly(pts, color)
        self.poly([(self.w - px, py) for px, py in pts], color)

    def ellipse_sym(self, cx, cy, rx, ry, base, **kw):
        self.ellipse(cx, cy, rx, ry, base, **kw)
        self.ellipse(self.w - cx, cy, rx, ry, base, **kw)

    def outline(self):
        out = [row[:] for row in self.px]
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is not None:
                    continue
                best = None
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and self.px[ny][nx] is not None:
                        c = self.px[ny][nx]
                        if best is None or sum(c[:3]) < sum(best[:3]):
                            best = c
                if best is not None:
                    out[y][x] = mix(mul(best, 0.42), (40, 22, 50, 255), 0.35)[:3] + (255,)
        self.px = out

    def eyes(self, x, y, h=3, w=2, shine=True, color=EYE):
        for ex in (x, self.mirror_x(x) - (w - 1)):
            for yy in range(y, y + h):
                for xx in range(ex, ex + w):
                    self.put(xx, yy, color)
            if shine:
                self.put(ex, y, WHITE)

    def blush(self, x, y, w=2):
        for xx in range(x, x + w):
            self.put(xx, y, BLUSH)
            self.put(self.mirror_x(xx), y, BLUSH)

    def smile(self, y, wide=True):
        c = self.w // 2
        if wide:
            self.put(c - 2, y, MOUTH)
            self.put(c + 1, y, MOUTH)
            self.put(c - 1, y + 1, MOUTH)
            self.put(c, y + 1, MOUTH)
        else:
            self.put(c - 1, y, MOUTH)
            self.put(c, y, MOUTH)

    def sparkle(self, x, y, color=(255, 250, 200, 255)):
        self.put(x, y, WHITE)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            self.put(x + dx, y + dy, color)

    def center(self):
        cells = [(x, y) for y in range(self.h) for x in range(self.w) if self.px[y][x] is not None]
        x0, x1 = min(x for x, _ in cells), max(x for x, _ in cells)
        y0, y1 = min(y for _, y in cells), max(y for _, y in cells)
        dx = (self.w - 1 - x1 - x0) // 2
        dy = (self.h - 1 - y1 - y0) // 2
        moved = [[None] * self.w for _ in range(self.h)]
        for x, y in cells:
            moved[y + dy][x + dx] = self.px[y][x]
        self.px = moved

    def save(self, name):
        self.center()
        img = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        p = img.load()
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is not None:
                    p[x, y] = self.px[y][x]
        img = img.resize((self.w * EXPORT_SCALE, self.h * EXPORT_SCALE), Image.NEAREST)
        img.save(os.path.join(OUT_DIR, name))
        print('saved', name)


def _inside(pts, x, y):
    inside = False
    j = len(pts) - 1
    for i in range(len(pts)):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


# ============ Player evolution line ============

def mongsil():
    """Stage 1: round baby blob."""
    s = Sprite(24)
    base = rgba(150, 215, 255)
    s.ellipse_sym(7.5, 10, 2.0, 2.6, base, hl=False)
    s.ellipse(12, 14.5, 7.5, 6.5, base)
    s.ellipse_sym(8.5, 21, 2.2, 1.3, mul(base, 0.85), shade=False)
    for x, y in [(12, 7), (12, 6), (13, 5)]:
        s.put(x, y, base)
    s.eyes(8, 13)
    s.blush(6, 16)
    s.smile(16)
    s.outline()
    s.save('mongsil.png')


def kkomul():
    """Stage 2: little dragon pup."""
    s = Sprite(24)
    base = rgba(105, 185, 250)
    s.ellipse(18.5, 18.5, 2.6, 1.8, base, hl=False)
    s.ellipse(20.5, 16.8, 1.7, 1.5, base, hl=False)
    s.ellipse(21.3, 15.2, 1.1, 1.2, base, hl=False)
    s.ellipse(12, 17.5, 5.5, 4.5, base)
    s.ellipse(12, 18.4, 3.3, 3.0, CREAM, hl=False)
    s.ellipse_sym(9, 21.8, 2.1, 1.3, mul(base, 0.85), shade=False)
    s.ellipse_sym(7, 17, 1.5, 1.2, base, hl=False)
    s.ellipse(12, 10.5, 7.0, 5.8, base)
    s.ellipse_sym(4.8, 8.5, 1.6, 2.4, mix(base, WHITE, 0.3), hl=False)
    s.poly([(11, 5.4), (13, 5.4), (12, 2.2)], CREAM)
    s.eyes(8, 9)
    s.blush(6, 12)
    s.smile(12)
    s.outline()
    s.save('kkomul.png')


def _dragon_body(s, base, belly, big=False):
    k = 1.0 if not big else 1.12
    s.ellipse(12, 17.5, 6.0 * k, 4.8 * k, base)
    s.ellipse(12, 18.4, 3.6 * k, 3.2 * k, belly, hl=False)
    s.ellipse_sym(8.8, 22, 2.3, 1.3, mul(base, 0.85), shade=False)
    s.ellipse_sym(6.2 if not big else 5.6, 17, 1.7, 1.3, base, hl=False)


def hwareu():
    """Stage 3 (fire): little fire dragon."""
    s = Sprite(24)
    base = rgba(255, 140, 85)
    wing = rgba(255, 196, 150)
    flame = rgba(255, 215, 90)
    s.poly_sym([(8, 13), (2, 8), (1.5, 12), (3, 14.5), (6, 15.5)], wing)
    s.ellipse(18.8, 19, 2.8, 2.0, base, hl=False)
    s.ellipse(21, 17.2, 1.8, 1.6, base, hl=False)
    s.ellipse(21.8, 14.3, 1.5, 2.1, flame, shade=False, hl=False)
    s.ellipse(22, 12.6, 0.9, 1.2, rgba(255, 245, 190), shade=False, hl=False)
    _dragon_body(s, base, CREAM)
    s.ellipse(12, 10.2, 7.2, 6.0, base)
    s.poly_sym([(7.5, 6.8), (9.8, 5.2), (6.5, 2.0)], CREAM)
    s.eyes(8, 9)
    s.blush(6, 12)
    s.smile(12)
    s.put(13, 14, WHITE)
    s.outline()
    s.save('hwareu.png')


def ipsae():
    """Stage 3 (leaf): little leaf dragon."""
    s = Sprite(24)
    base = rgba(125, 205, 115)
    leaf = rgba(175, 232, 140)
    s.ellipse(18.8, 19, 2.8, 2.0, base, hl=False)
    s.ellipse(21, 17.2, 1.8, 1.6, base, hl=False)
    s.ellipse(22, 14.3, 1.4, 2.3, leaf, shade=False, hl=False)
    _dragon_body(s, base, rgba(248, 244, 200))
    s.ellipse(12, 10.2, 7.2, 6.0, base)
    s.poly_sym([(7.2, 7.5), (4.5, 3.4), (1.2, 2.2), (2.2, 5.6), (5.0, 8.8)], leaf)
    vein = mul(leaf, 0.72)
    for x, y in [(5, 7), (4, 6), (3, 5), (3, 4), (2, 3)]:
        s.put(x, y, vein)
        s.put(s.mirror_x(x), y, vein)
    s.ellipse_sym(10.2, 2.4, 1.6, 1.0, leaf, shade=False, hl=False)
    for y in (2, 3):
        s.put(11, y, vein)
        s.put(12, y, vein)
    s.eyes(8, 9)
    s.blush(6, 12)
    s.smile(12)
    s.outline()
    s.save('ipsae.png')


def taeyang():
    """Stage 4 (fire): sun dragon."""
    s = Sprite(24)
    base = rgba(255, 185, 70)
    wing = rgba(255, 224, 150)
    flame = rgba(255, 120, 70)
    s.poly_sym([(8, 12), (0.4, 4.2), (0.4, 10), (2, 14), (5, 16.5)], wing)
    s.ellipse(19.2, 19.2, 2.9, 2.0, base, hl=False)
    s.ellipse(21.4, 17.2, 1.8, 1.7, base, hl=False)
    s.ellipse(22, 14.2, 1.6, 2.4, flame, shade=False, hl=False)
    s.ellipse(22.1, 12.2, 1.0, 1.3, rgba(255, 220, 120), shade=False, hl=False)
    _dragon_body(s, base, rgba(255, 246, 215), big=True)
    s.ellipse(12, 9.8, 7.8, 6.3, base)
    s.poly_sym([(8.3, 5.6), (10.4, 4.4), (8.6, 1.2)], flame)
    s.poly([(10.9, 4.2), (13.1, 4.2), (12, 0.6)], flame)
    s.eyes(8, 8, h=4)
    s.blush(6, 12)
    s.smile(12)
    s.put(13, 14, WHITE)
    s.outline()
    s.sparkle(2, 19)
    s.sparkle(21, 2)
    s.save('taeyang.png')


def kkotip():
    """Stage 4 (leaf): flower dragon."""
    s = Sprite(24)
    base = rgba(115, 200, 125)
    leaf = rgba(170, 232, 150)
    petal = rgba(255, 170, 205)
    s.poly_sym([(8, 12), (1, 5.5), (0.4, 11), (2.5, 15), (6, 16.5)], leaf)
    s.ellipse(19.2, 19.2, 2.9, 2.0, base, hl=False)
    s.ellipse(21.4, 17.2, 1.8, 1.7, base, hl=False)
    s.ellipse(22, 14.4, 1.5, 1.5, petal, shade=False, hl=False)
    s.put(22, 14, rgba(255, 225, 110))
    _dragon_body(s, base, rgba(248, 244, 205), big=True)
    s.ellipse(12, 9.8, 7.8, 6.3, base)
    s.ellipse(12, 1.6, 1.5, 1.3, petal, shade=False, hl=False)
    s.ellipse_sym(10.1, 3.0, 1.4, 1.2, petal, shade=False, hl=False)
    s.ellipse_sym(10.8, 4.7, 1.3, 1.1, petal, shade=False, hl=False)
    s.ellipse(12, 3.3, 1.1, 1.1, rgba(255, 225, 110), shade=False, hl=False)
    s.eyes(8, 8, h=4)
    s.blush(6, 12)
    s.smile(12)
    s.outline()
    s.sparkle(2, 19, petal)
    s.sparkle(21, 3, petal)
    s.save('kkotip.png')


# ============ Wild monsters ============

def slime():
    s = Sprite(24)
    base = rgba(255, 222, 115)
    s.ellipse(12, 16.8, 7.5, 5.5, base, ymax=22)
    s.ellipse(12, 12.6, 3.8, 3.4, base, hl=False)
    s.put(8, 13, WHITE)
    s.put(8, 14, WHITE)
    s.put(9, 12, WHITE)
    s.eyes(9, 16, h=2, w=1, shine=False)
    s.blush(7, 18, w=1)
    s.smile(18, wide=False)
    s.outline()
    s.save('slime.png')


def mushroom():
    s = Sprite(24)
    cap = rgba(240, 100, 100)
    stem = rgba(252, 236, 205)
    s.ellipse(12, 17.5, 5.0, 4.4, stem, hl=False)
    s.ellipse_sym(9.5, 21.6, 1.9, 1.1, mul(stem, 0.85), shade=False)
    s.ellipse(12, 11.8, 9.0, 6.4, cap, ymax=14)
    for cx, cy, rx, ry in [(7.6, 9.8, 1.5, 1.2), (13.8, 8.0, 1.8, 1.3), (17.6, 11.4, 1.2, 1.0), (10.8, 12.4, 1.1, 0.8)]:
        s.ellipse(cx, cy, rx, ry, WHITE, shade=False, hl=False)
    s.eyes(9, 16, h=2, w=1, shine=False)
    s.blush(7, 18, w=1)
    s.smile(18, wide=False)
    s.outline()
    s.save('mushroom.png')


def bat():
    s = Sprite(32)
    base = rgba(160, 112, 222)
    wing = rgba(192, 150, 240)
    gold = rgba(255, 212, 80)
    s.poly_sym([(10, 14), (1, 6), (0.5, 12), (3, 11.5), (2.5, 17), (5.5, 15.5), (6, 20.5), (10, 18.5)], wing)
    s.poly_sym([(10.5, 12), (8.8, 3), (14.5, 9.5)], base)
    s.poly_sym([(11.2, 10.5), (10.2, 5.5), (13.2, 9.5)], rgba(255, 180, 210))
    s.ellipse(16, 17.5, 8.5, 8.0, base)
    s.ellipse(16, 20.5, 5.0, 4.3, rgba(212, 190, 248), hl=False)
    s.ellipse_sym(13, 25.4, 2.0, 1.2, mul(base, 0.8), shade=False)
    s.poly([(12.5, 10.2), (12.5, 6.5), (14.2, 8.2), (16, 5.2), (17.8, 8.2), (19.5, 6.5), (19.5, 10.2)], gold)
    s.put(16, 8, rgba(255, 110, 140))
    s.eyes(12, 14)
    for x, y in [(11, 12), (12, 12), (13, 13)]:
        s.put(x, y, EYE)
        s.put(s.mirror_x(x), y, EYE)
    for x in range(14, 18):
        s.put(x, 18, MOUTH)
    s.put(14, 19, WHITE)
    s.put(17, 19, WHITE)
    s.blush(9, 17)
    s.outline()
    s.save('bat.png')


# ============ Projectiles / pickups ============

def bubble():
    s = Sprite(12)
    s.ellipse(6, 6, 5, 5, rgba(170, 225, 255, 215), hl=False)
    s.ellipse(6, 6, 3.2, 3.2, rgba(205, 240, 255, 180), shade=False, hl=False)
    s.put(3, 3, WHITE)
    s.put(4, 3, WHITE)
    s.put(3, 4, WHITE)
    s.outline()
    s.save('bubble.png')


def fireball():
    s = Sprite(14)
    s.poly([(6, 3.2), (0.4, 4.6), (3, 7), (0.4, 9.4), (6, 10.8)], rgba(255, 110, 70))
    s.ellipse(8.6, 7, 4.8, 4.4, rgba(255, 150, 70), hl=False)
    s.ellipse(9.2, 7, 2.8, 2.6, rgba(255, 230, 140), shade=False, hl=False)
    s.put(10, 6, WHITE)
    s.outline()
    s.save('fireball.png')


def leaf():
    s = Sprite(12)
    s.poly([(11.6, 6), (8, 2.2), (3, 2.8), (0.8, 6), (3, 9.2), (8, 9.8)], rgba(135, 212, 110))
    for x in range(2, 11):
        s.put(x, 6, rgba(90, 160, 80))
    s.put(4, 4, rgba(190, 240, 160))
    s.put(5, 4, rgba(190, 240, 160))
    s.outline()
    s.save('leaf.png')


def star():
    s = Sprite(14)
    pts = []
    for i in range(10):
        r = 6.6 if i % 2 == 0 else 2.9
        a = -math.pi / 2 + i * math.pi / 5
        pts.append((7 + r * math.cos(a), 7.4 + r * math.sin(a)))
    s.poly(pts, rgba(255, 225, 100))
    s.eyes(5, 6, h=2, w=1, shine=False)
    s.put(6, 9, MOUTH)
    s.put(7, 9, MOUTH)
    s.outline()
    s.save('star.png')


def gem(name, color, size):
    s = Sprite(size)
    c = size / 2
    r = c - 0.8
    s.poly([(c, c - r), (c + r, c), (c, c + r), (c - r, c)], color)
    s.poly([(c, c - r), (c, c), (c - r, c)], mix(color, WHITE, 0.4))
    s.put(int(c) - 2, int(c) - 1, WHITE)
    s.outline()
    s.save(name)


def heart():
    s = Sprite(12)
    red = rgba(255, 105, 135)
    s.ellipse(4, 4.6, 2.8, 2.6, red, shade=False, hl=False)
    s.ellipse(8, 4.6, 2.8, 2.6, red, shade=False, hl=False)
    s.poly([(1.3, 5.4), (10.7, 5.4), (6, 10.8)], red)
    s.put(3, 3, WHITE)
    s.put(3, 4, WHITE)
    s.outline()
    s.save('heart.png')


if __name__ == '__main__':
    mongsil()
    kkomul()
    hwareu()
    ipsae()
    taeyang()
    kkotip()
    slime()
    mushroom()
    bat()
    bubble()
    fireball()
    leaf()
    star()
    gem('gem.png', rgba(120, 225, 200), 10)
    gem('gem_big.png', rgba(255, 150, 205), 12)
    heart()
