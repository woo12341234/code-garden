"""Generates the pixel-art sprites in ../assets. Requires Pillow: pip install pillow"""
import math
import os
from PIL import Image

EXPORT_SCALE = 4
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')

WHITE = (255, 255, 255, 255)
EYE = (34, 26, 30, 255)
INK = (34, 26, 30, 255)
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
                    out[y][x] = INK
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



# Palette: hanji, ink, vermilion, indigo, ochre.
SKIN = rgba(245, 214, 180)
RED = rgba(190, 52, 46)
GOLD = rgba(222, 176, 72)
STEEL = rgba(200, 205, 212)
HAIR = rgba(38, 32, 36)


# ============ Heroes (one form each) ============

def _human(s, robe, sash, shoes=rgba(60, 50, 50), wide=0.0):
    s.ellipse_sym(9.6, 22.2, 1.8, 1.1, shoes, shade=False)
    s.poly([(7.4 - wide, 13.4), (16.6 + wide, 13.4), (18.2 + wide, 21.6), (5.8 - wide, 21.6)], robe)
    s.poly([(5.8 - wide, 19.6), (18.2 + wide, 19.6), (18.2 + wide, 21.6), (5.8 - wide, 21.6)], mul(robe, 0.82))
    s.ellipse_sym(6.4 - wide, 16.2, 1.7, 2.6, robe, hl=False)
    s.poly([(7.2 - wide, 16.2), (16.8 + wide, 16.2), (16.9 + wide, 17.4), (7.1 - wide, 17.4)], sash)


def _head(s, y=9.0, skin=SKIN):
    s.ellipse(12, y, 5.6, 5.0, skin, hl=False)


def _cool_eyes(s, y, brow=True):
    s.eyes(9, y, h=2, w=1, shine=False)
    if brow:
        s.put(8, y - 1, EYE)
        s.put(s.mirror_x(8), y - 1, EYE)


def cheongpung():
    """검객: teal robe, topknot, sword on the back."""
    s = Sprite(24)
    s.poly([(15.4, 13.6), (16.6, 14.2), (21.2, 3.6), (20.1, 3.1)], STEEL)
    s.poly([(18.4, 7.2), (20.6, 8.2), (20.9, 7.4), (18.7, 6.4)], GOLD)
    _human(s, rgba(52, 118, 128), RED)
    _head(s)
    s.ellipse(12, 6.2, 5.9, 3.2, HAIR, hl=False, ymax=8)
    s.ellipse(12, 2.4, 1.7, 1.5, HAIR, hl=False)
    for x in range(7, 18):
        if s.px[7][x] is not None:
            s.put(x, 7, RED)
    s.put(18, 8, RED)
    s.put(19, 9, RED)
    _cool_eyes(s, 9)
    s.outline()
    s.save('cheongpung.png')


def unhak():
    """도사: white robe, black gat, holding a talisman."""
    s = Sprite(24)
    _human(s, rgba(228, 226, 214), HAIR)
    _head(s, 9.4)
    s.poly([(9.6, 5.4), (14.4, 5.4), (14, 1.2), (10, 1.2)], HAIR)
    s.ellipse(12, 5.6, 7.6, 1.3, HAIR, shade=False, hl=False)
    s.poly([(17.6, 14.2), (20, 14.2), (20, 19), (17.6, 19)], rgba(240, 210, 90))
    s.put(18, 16, RED)
    s.put(19, 17, RED)
    s.put(18, 17, RED)
    s.poly([(10.6, 13.6), (13.4, 13.6), (12, 15.6)], rgba(200, 200, 195))
    _cool_eyes(s, 9)
    s.outline()
    s.save('unhak.png')


def yeoubi():
    """구미호: silver hair, fox ears, three tails, red hanbok."""
    s = Sprite(24)
    tail = rgba(240, 170, 80)
    for cx, cy, rx, ry in [(19.6, 17.5, 2.2, 3.6), (20.8, 13.2, 1.8, 3.0), (17.8, 20.6, 2.6, 1.6)]:
        s.ellipse(cx, cy, rx, ry, tail, hl=False)
    for x, y in [(20, 14), (21, 10), (20, 11)]:
        s.put(x, y, rgba(255, 250, 240))
    s.ellipse(12, 11, 6.6, 6.4, rgba(236, 232, 226), hl=False)
    _human(s, rgba(196, 48, 60), rgba(250, 200, 210))
    _head(s)
    s.poly_sym([(6.6, 6.2), (5.6, 1.0), (9.6, 4.4)], rgba(236, 232, 226))
    s.poly_sym([(7.0, 5.0), (6.4, 2.4), (8.4, 4.2)], tail)
    s.ellipse(12, 5.8, 5.8, 2.6, rgba(236, 232, 226), hl=False, ymax=8)
    s.eyes(9, 9, h=2, w=1, shine=False, color=rgba(200, 60, 50))
    s.put(11, 12, RED)
    s.put(12, 12, RED)
    s.outline()
    s.save('yeoubi.png')


def cheolsan():
    """무승: bald monk, ochre robe, prayer beads."""
    s = Sprite(24)
    _human(s, rgba(196, 122, 52), rgba(120, 60, 40), wide=1.2)
    _head(s, 9.2, rgba(236, 190, 150))
    s.ellipse(12, 6.2, 3.6, 1.6, rgba(250, 215, 180), shade=False, hl=False)
    for i in range(9):
        import math as _m
        a = _m.pi * (0.15 + 0.7 * i / 8)
        s.put(int(round(12 + _m.cos(a) * 4.2 - 0.5)), int(round(13.6 + _m.sin(a) * 1.6)), rgba(120, 40, 40))
    for x in (8, 9):
        s.put(x, 8, EYE)
        s.put(s.mirror_x(x), 8, EYE)
    s.put(9, 9, EYE)
    s.put(s.mirror_x(9), 9, EYE)
    s.put(9, 10, EYE)
    s.put(s.mirror_x(9), 10, EYE)
    s.outline()
    s.save('cheolsan.png')


def dallae():
    """무녀: long black hair, white jeogori, red skirt, bells."""
    s = Sprite(24)
    s.ellipse(12, 12.6, 6.4, 7.4, HAIR, hl=False)
    _human(s, RED, rgba(60, 90, 160))
    s.poly([(7.4, 13.4), (16.6, 13.4), (16.9, 16.2), (7.1, 16.2)], rgba(240, 238, 230))
    s.ellipse_sym(6.4, 15.2, 1.7, 2.0, rgba(240, 238, 230), hl=False)
    _head(s)
    s.ellipse(12, 5.8, 5.9, 2.8, HAIR, hl=False, ymax=8)
    s.ellipse_sym(7.2, 4.6, 1.0, 1.0, RED, shade=False, hl=False)
    for x, y in [(18, 15), (19, 16), (18, 17), (19, 18)]:
        s.put(x, y, GOLD)
    s.eyes(9, 9, h=2, w=1, shine=False)
    s.put(11, 12, RED)
    s.put(12, 12, RED)
    s.outline()
    s.save('dallae.png')


def yawol():
    """자객: dark hood and mask, flowing red scarf, chakram."""
    s = Sprite(24)
    dark = rgba(52, 50, 78)
    s.poly([(15, 12.4), (22.6, 10.2), (21.6, 12.6), (23.4, 14.2), (16, 14)], RED)
    _human(s, dark, RED)
    _head(s)
    s.ellipse(12, 8.4, 6.2, 5.8, dark, hl=False)
    for x in range(7, 17):
        for y in (8, 9):
            if s.px[y][x] is not None:
                s.put(x, y, SKIN)
    s.put(9, 8, EYE)
    s.put(9, 9, EYE)
    s.put(s.mirror_x(9), 8, EYE)
    s.put(s.mirror_x(9), 9, EYE)
    s.outline()
    s.save('yawol.png')


# ============ Yokai ============

def wisp():
    """도깨비불"""
    s = Sprite(24)
    flame = rgba(110, 185, 255)
    s.poly([(7.4, 14.6), (16.6, 14.6), (13.4, 4.8), (12.2, 8.6), (10.6, 6.2)], flame)
    s.ellipse(12, 16, 5.2, 4.8, flame)
    s.ellipse(12, 16.8, 2.6, 2.4, rgba(225, 245, 255), shade=False, hl=False)
    s.eyes(10, 15, h=2, w=1, shine=False)
    s.outline()
    s.save('wisp.png')


def dokkaebi():
    """꼬마도깨비: red, one horn, club, tiger-pattern loincloth."""
    s = Sprite(24)
    skin = rgba(214, 78, 62)
    s.poly([(16.4, 18), (17.8, 18.8), (22, 9.8), (20, 9)], rgba(150, 100, 60))
    for x, y in [(20, 11), (21, 13), (19, 14)]:
        s.put(x, y, STEEL)
    s.ellipse(12, 15.5, 6.2, 6.0, skin)
    s.poly([(6.4, 17), (17.6, 17), (17, 20.4), (7, 20.4)], rgba(232, 180, 70))
    for x in (8, 11, 14):
        s.put(x, 18, HAIR)
        s.put(x + 1, 19, HAIR)
    s.ellipse_sym(9.4, 21.8, 1.8, 1.1, mul(skin, 0.8), shade=False)
    s.poly([(10.6, 9.6), (13.4, 9.6), (12, 5.0)], rgba(240, 215, 120))
    s.ellipse(12, 10.6, 5.6, 1.8, HAIR, shade=False, hl=False)
    s.eyes(9, 13, h=2, w=1, shine=False, color=rgba(255, 230, 100))
    s.put(10, 16, WHITE)
    s.put(13, 16, WHITE)
    s.outline()
    s.save('dokkaebi.png')


def crow():
    """까마귀요괴"""
    s = Sprite(24)
    body = rgba(58, 58, 80)
    s.poly_sym([(9, 13), (2, 9), (3, 13.6), (7, 16)], mul(body, 1.25))
    s.ellipse(12, 14, 4.8, 4.6, body)
    s.poly([(10.8, 15), (13.2, 15), (12, 18.2)], GOLD)
    s.eyes(10, 13, h=1, w=1, shine=False, color=rgba(230, 60, 60))
    s.outline()
    s.save('crow.png')


def jangseung():
    """돌장승"""
    s = Sprite(24)
    wood = rgba(158, 124, 96)
    s.poly([(8.4, 6), (15.6, 6), (16, 22), (8, 22)], wood)
    s.ellipse(12, 4.8, 5.2, 2.0, HAIR, shade=False, hl=False)
    s.poly([(10, 4.8), (14, 4.8), (13.4, 1.6), (10.6, 1.6)], HAIR)
    s.ellipse_sym(10, 9.6, 1.4, 1.4, WHITE, shade=False, hl=False)
    s.put(10, 10, EYE)
    s.put(s.mirror_x(10), 10, EYE)
    s.poly([(11.2, 10.4), (12.8, 10.4), (12.8, 14), (11.2, 14)], mul(wood, 0.8))
    s.poly([(9.4, 15), (14.6, 15), (14.2, 16.8), (9.8, 16.8)], WHITE)
    for x in (10, 12, 14):
        s.put(x, 16, EYE)
    s.outline()
    s.save('jangseung.png')


def wongwi():
    """원귀: white-robed ghost with long hair."""
    s = Sprite(24)
    robe = rgba(240, 240, 236, 235)
    s.poly([(6.6, 12), (17.4, 12), (18.4, 20), (16.4, 21.6), (14.2, 20), (12, 21.6), (9.8, 20), (7.6, 21.6), (5.6, 20)], robe)
    s.ellipse(12, 9.4, 5.4, 5.0, rgba(232, 236, 230), hl=False)
    s.ellipse(12, 8.6, 6.0, 5.4, HAIR, hl=False, ymax=9)
    s.poly([(6.2, 9), (8.6, 9), (8.2, 16), (6.6, 15)], HAIR)
    s.poly([(15.4, 9), (17.8, 9), (17.4, 15), (15.8, 16)], HAIR)
    s.eyes(10, 10, h=2, w=1, shine=False, color=rgba(170, 40, 40))
    s.outline()
    s.save('wongwi.png')


def meok():
    """먹물요괴: splits when defeated."""
    s = Sprite(24)
    ink = rgba(50, 44, 56, 240)
    s.ellipse(12, 16.5, 7.6, 5.6, ink, ymax=22)
    s.ellipse(12, 12.4, 4.0, 3.6, ink, hl=False)
    s.ellipse(17.6, 21, 1.2, 1.0, ink, shade=False, hl=False)
    s.eyes(9, 15, h=2, w=2, shine=False, color=WHITE)
    s.put(9, 16, EYE)
    s.put(14, 16, EYE)
    s.outline()
    s.save('meok.png')


def gangsi():
    """강시: Qing hat, talisman on the forehead, arms outstretched."""
    s = Sprite(24)
    skin = rgba(160, 196, 176)
    robe = rgba(50, 70, 110)
    s.poly([(7.6, 12.4), (16.4, 12.4), (17, 22), (7, 22)], robe)
    s.poly([(3, 13), (8, 13), (8, 15.4), (3, 15.4)], robe)
    s.poly([(16, 13), (21, 13), (21, 15.4), (16, 15.4)], robe)
    s.put(2, 14, skin)
    s.put(21, 14, skin)
    _head(s, 8.6, skin)
    s.poly([(7.2, 6), (16.8, 6), (15.6, 2.8), (8.4, 2.8)], HAIR)
    s.put(12, 2, RED)
    s.poly([(10.8, 5.8), (13.2, 5.8), (13.2, 10.4), (10.8, 10.4)], rgba(240, 210, 90))
    s.put(11, 7, RED)
    s.put(12, 8, RED)
    s.put(9, 9, EYE)
    s.put(14, 9, EYE)
    s.outline()
    s.save('gangsi.png')


def daedokkaebi():
    """대도깨비 (boss)"""
    s = Sprite(32)
    skin = rgba(72, 112, 190)
    s.poly([(22, 26), (24, 27), (30, 10), (27, 9)], rgba(150, 100, 60))
    for x, y in [(27, 12), (28, 15), (26, 18), (29, 11)]:
        s.put(x, y, STEEL)
    s.ellipse(16, 20, 9.2, 8.6, skin)
    s.poly([(7.6, 22), (24.4, 22), (23.6, 27), (8.4, 27)], rgba(232, 180, 70))
    for x in (9, 13, 17, 21):
        s.put(x, 23, HAIR)
        s.put(x + 1, 24, HAIR)
        s.put(x, 25, HAIR)
    s.ellipse_sym(12, 29.4, 2.6, 1.4, mul(skin, 0.8), shade=False)
    s.poly_sym([(10.4, 12.6), (8.4, 6), (12.8, 11.6)], rgba(240, 215, 120))
    s.ellipse(16, 12.8, 8.0, 2.4, HAIR, shade=False, hl=False)
    s.eyes(12, 16, h=2, w=2, shine=False, color=rgba(255, 230, 100))
    for x in range(13, 19):
        s.put(x, 21, EYE)
    s.put(13, 20, WHITE)
    s.put(18, 20, WHITE)
    s.outline()
    s.save('daedokkaebi.png')


def imugi():
    """이무기 (boss): coiled serpent."""
    s = Sprite(32)
    scale = rgba(70, 140, 100)
    belly = rgba(225, 215, 150)
    s.ellipse(16, 25, 12, 4.6, scale)
    s.ellipse(16, 25.6, 9, 2.4, belly, hl=False)
    s.ellipse(16, 18.6, 9.6, 4.2, scale)
    s.ellipse(16, 19.2, 7, 2.0, belly, hl=False)
    s.ellipse(16, 10, 6.4, 5.4, scale)
    s.poly_sym([(11.6, 6.6), (9.6, 2), (13.4, 5.4)], rgba(225, 215, 150))
    s.eyes(12, 9, h=2, w=2, shine=False, color=rgba(255, 220, 70))
    s.put(13, 10, EYE)
    s.put(18, 10, EYE)
    s.poly([(4, 11), (10, 12.4), (10, 13), (4, 12)], belly)
    s.poly([(28, 11), (22, 12.4), (22, 13), (28, 12)], belly)
    s.outline()
    s.save('imugi.png')


def heukyo():
    """흑요장군 (boss): armored general who calls wisps."""
    s = Sprite(32)
    armor = rgba(62, 58, 76)
    s.poly([(9, 15), (23, 15), (25, 29), (7, 29)], armor)
    for y in (18, 21, 24, 27):
        s.poly([(8.4, y), (23.6, y), (23.8, y + 0.8), (8.2, y + 0.8)], mul(armor, 1.5))
    s.ellipse_sym(7.4, 17.4, 3.2, 3.0, mul(armor, 1.3))
    s.ellipse(16, 11.4, 6.2, 5.6, rgba(150, 165, 175), hl=False)
    s.poly([(9, 10), (23, 10), (21.6, 5), (10.4, 5)], armor)
    s.poly([(14, 5.4), (18, 5.4), (19.4, 0.4), (16, 2), (12.6, 0.4)], RED)
    s.eyes(13, 11, h=2, w=1, shine=False, color=rgba(240, 70, 60))
    s.outline()
    s.save('heukyo.png')


# ============ Weapons & pickups ============

def sword():
    s = Sprite(14)
    s.poly([(13.6, 7), (11.6, 5.8), (3.6, 5.8), (3.6, 8.2), (11.6, 8.2)], STEEL)
    for x in range(4, 12):
        s.put(x, 6, WHITE)
    s.poly([(2.6, 4.4), (3.8, 4.4), (3.8, 9.6), (2.6, 9.6)], GOLD)
    s.poly([(0.4, 6.2), (2.6, 6.2), (2.6, 7.8), (0.4, 7.8)], rgba(110, 70, 50))
    s.outline()
    s.save('sword.png')


def foxfire():
    s = Sprite(14)
    s.poly([(3, 8), (11, 8), (8.4, 0.6), (7, 4), (5.4, 2.4)], rgba(255, 140, 70))
    s.ellipse(7, 9, 4.2, 4.0, rgba(255, 160, 80))
    s.ellipse(7, 9.6, 2.0, 2.0, rgba(255, 240, 190), shade=False, hl=False)
    s.outline()
    s.save('foxfire.png')


def chakram():
    s = Sprite(12)
    import math as _m
    for y in range(12):
        for x in range(12):
            d = _m.hypot(x + 0.5 - 6, y + 0.5 - 6)
            if 3.0 <= d <= 5.4:
                s.px[y][x] = STEEL
    for x, y in [(6, 0), (11, 6), (5, 11), (0, 5)]:
        s.put(x, y, STEEL)
    s.put(4, 2, WHITE)
    s.outline()
    s.save('chakram.png')


def crane():
    s = Sprite(12)
    paper = rgba(248, 245, 236)
    s.poly([(1, 7), (6, 3), (11, 7), (6, 8.6)], paper)
    s.poly([(6, 3), (7.6, 0.6), (8.4, 3.6)], paper)
    s.poly([(6, 8.6), (4, 10.6), (7.6, 9.4)], mul(paper, 0.9))
    s.put(10, 6, RED)
    s.outline()
    s.save('crane.png')


def talisman():
    s = Sprite(10)
    s.poly([(2.6, 0.6), (7.4, 0.6), (7.4, 9.4), (2.6, 9.4)], rgba(240, 210, 90))
    for x, y in [(4, 2), (5, 3), (4, 4), (5, 5), (4, 6), (5, 7)]:
        s.put(x, y, RED)
    s.outline()
    s.save('talisman.png')


def coin(name, color, size):
    s = Sprite(size)
    c = size / 2
    s.ellipse(c, c, c - 0.6, c - 0.6, color, hl=False)
    h = 1 if size < 12 else 1.4
    for y in range(size):
        for x in range(size):
            if abs(x + 0.5 - c) <= h and abs(y + 0.5 - c) <= h:
                s.px[y][x] = None
    s.put(int(c) - 3, int(c) - 3, mix(color, WHITE, 0.6))
    s.outline()
    for y in range(size):
        for x in range(size):
            if abs(x + 0.5 - c) <= h - 1 and abs(y + 0.5 - c) <= h - 1:
                s.px[y][x] = None
    s.save(name)


def peach():
    s = Sprite(12)
    s.ellipse(6, 7, 4.6, 4.2, rgba(250, 160, 160))
    s.put(6, 3, rgba(250, 160, 160))
    s.poly([(6.4, 3), (10, 1), (9.4, 3.4)], rgba(110, 170, 90))
    s.put(4, 6, WHITE)
    s.outline()
    s.save('peach.png')


def ginseng():
    s = Sprite(12)
    root = rgba(236, 210, 160)
    s.ellipse(6, 7.4, 2.0, 3.4, root)
    s.poly([(5, 9), (2.4, 11.6), (5.6, 10.4)], root)
    s.poly([(7, 9), (9.6, 11.6), (6.4, 10.4)], root)
    s.ellipse_sym(4, 2.6, 1.8, 1.2, rgba(100, 165, 80), shade=False, hl=False)
    s.put(6, 1, RED)
    s.outline()
    s.save('ginseng.png')


def gourd():
    s = Sprite(12)
    shell = rgba(214, 150, 70)
    s.ellipse(6, 8.6, 3.6, 3.0, shell)
    s.ellipse(6, 4, 2.2, 2.0, shell)
    s.poly([(5, 0.6), (7, 0.6), (7, 2.4), (5, 2.4)], rgba(140, 90, 50))
    s.poly([(3.6, 5.6), (8.4, 5.6), (8.4, 6.6), (3.6, 6.6)], RED)
    s.outline()
    s.save('gourd.png')


def thunderball():
    s = Sprite(12)
    s.ellipse(6, 6.6, 4.6, 4.4, rgba(64, 60, 76))
    s.poly([(4.6, 4), (7.4, 4), (7.4, 9.6), (4.6, 9.6)], rgba(240, 210, 90))
    s.put(5, 6, RED)
    s.put(6, 7, RED)
    s.put(6, 1, rgba(255, 200, 90))
    s.outline()
    s.save('thunderball.png')


def treasure():
    s = Sprite(14)
    lacquer = rgba(170, 40, 40)
    s.poly([(1, 5), (13, 5), (13, 12.5), (1, 12.5)], lacquer)
    s.ellipse(7, 5.4, 6, 3.0, mul(lacquer, 1.15), shade=False, hl=False, ymax=6)
    for y in (6, 11):
        s.poly([(1, y), (13, y), (13, y + 0.9), (1, y + 0.9)], GOLD)
    s.poly([(5.8, 7), (8.2, 7), (8.2, 9.6), (5.8, 9.6)], GOLD)
    s.outline()
    s.save('treasure.png')


# ============ More heroes ============

def songhwa():
    """약사: green robe, herb basket."""
    s = Sprite(24)
    s.ellipse(18.6, 17.8, 2.4, 2.0, rgba(170, 125, 80))
    s.ellipse(18.6, 16.4, 1.8, 0.8, rgba(110, 170, 90), shade=False, hl=False)
    _human(s, rgba(96, 140, 86), rgba(232, 214, 150))
    _head(s)
    s.ellipse(12, 6.0, 5.9, 3.0, HAIR, hl=False, ymax=8)
    s.ellipse(12, 3.0, 2.2, 1.6, HAIR, hl=False)
    s.put(14, 3, rgba(230, 120, 140))
    s.eyes(9, 9, h=2, w=1, shine=False)
    s.outline()
    s.save('songhwa.png')


def muyeong():
    """검귀: pale swordsman in grey with two swords."""
    s = Sprite(24)
    for sx in (1, -1):
        x0 = 12 + sx * 6
        s.poly([(x0, 13), (x0 + sx * 1.2, 13), (x0 + sx * 6, 3), (x0 + sx * 5, 2.6)], STEEL)
    _human(s, rgba(110, 112, 124), rgba(50, 48, 60))
    _head(s, 9, rgba(236, 226, 214))
    s.ellipse(12, 7.6, 6.2, 4.6, rgba(230, 230, 235), hl=False, ymax=9)
    s.poly([(6, 8), (8, 8), (7.6, 14), (6.2, 13)], rgba(230, 230, 235))
    s.poly([(16, 8), (18, 8), (17.8, 13), (16.4, 14)], rgba(230, 230, 235))
    s.eyes(9, 9, h=2, w=1, shine=False, color=rgba(120, 160, 220))
    s.outline()
    s.save('muyeong.png')


def geumbi():
    """부적술사: yellow robe covered in talismans."""
    s = Sprite(24)
    _human(s, rgba(222, 186, 80), RED)
    for x, y in [(8, 18), (15, 18), (11, 20)]:
        s.poly([(x, y), (x + 1.4, y), (x + 1.4, y + 2.4), (x, y + 2.4)], rgba(250, 236, 180))
        s.put(x, y + 1, RED)
    _head(s)
    s.ellipse(12, 6.0, 5.9, 3.0, HAIR, hl=False, ymax=8)
    s.poly([(7, 6.4), (17, 6.4), (17, 7.6), (7, 7.6)], RED)
    s.eyes(9, 9, h=2, w=1, shine=False)
    s.outline()
    s.save('geumbi.png')


def seola():
    """설녀: white hanbok, pale blue hair, snow."""
    s = Sprite(24)
    s.ellipse(12, 12.6, 6.4, 7.4, rgba(200, 225, 245), hl=False)
    _human(s, rgba(236, 244, 250), rgba(120, 170, 220))
    _head(s, 9, rgba(250, 240, 236))
    s.ellipse(12, 5.8, 5.9, 2.8, rgba(200, 225, 245), hl=False, ymax=8)
    s.eyes(9, 9, h=2, w=1, shine=False, color=rgba(90, 140, 200))
    s.outline()
    for x, y in [(3, 4), (20, 7), (2, 15)]:
        s.put(x, y, WHITE)
    s.save('seola.png')


def cheonma():
    """천마 (unlockable): black and crimson demon lord, horned crown."""
    s = Sprite(24)
    s.poly([(5, 13.4), (19, 13.4), (22, 23), (2, 23)], rgba(40, 30, 36))
    _human(s, rgba(120, 24, 36), rgba(30, 24, 28), wide=0.6)
    _head(s, 9, rgba(236, 214, 200))
    s.ellipse(12, 6.4, 6.0, 3.2, HAIR, hl=False, ymax=8)
    s.poly_sym([(7.6, 5.4), (5.4, 0.6), (9.4, 4.4)], rgba(200, 40, 40))
    s.eyes(9, 9, h=2, w=1, shine=False, color=rgba(230, 40, 40))
    s.outline()
    s.save('cheonma.png')


def sansin():
    """산신령 (unlockable): white-bearded elder with a staff."""
    s = Sprite(24)
    s.poly([(18.6, 22.6), (19.8, 22.6), (19.8, 4), (18.6, 4)], rgba(150, 105, 60))
    s.ellipse(19.2, 3.4, 1.6, 1.6, rgba(120, 190, 90), shade=False, hl=False)
    _human(s, rgba(240, 238, 228), rgba(110, 160, 90))
    _head(s, 9)
    s.ellipse(12, 6.0, 5.9, 3.0, rgba(245, 245, 245), hl=False, ymax=8)
    s.poly([(8.6, 11), (15.4, 11), (13.6, 17.6), (12, 18.6), (10.4, 17.6)], rgba(245, 245, 245))
    for x in (9, 10):
        s.put(x, 9, EYE)
        s.put(s.mirror_x(x), 9, EYE)
    s.outline()
    s.save('sansin.png')


def icicle():
    s = Sprite(10)
    s.poly([(3.4, 0.6), (6.6, 0.6), (5, 9.6)], rgba(190, 230, 255))
    s.put(4, 2, WHITE)
    s.put(4, 3, WHITE)
    s.outline()
    s.save('icicle.png')


# ============ Sect heroes ============

def baekmae():
    """화산파 검수: plum-blossom robe, sword at hip."""
    s = Sprite(24)
    s.poly([(15.6, 18), (16.6, 18.6), (21.6, 12.4), (20.8, 11.8)], STEEL)
    _human(s, rgba(70, 60, 70), rgba(230, 120, 150))
    for x, y in [(8, 15), (14, 19), (10, 20), (16, 15)]:
        s.put(x, y, rgba(250, 160, 190))
    _head(s)
    s.ellipse(12, 6.2, 5.9, 3.2, HAIR, hl=False, ymax=8)
    s.ellipse(12, 2.4, 1.7, 1.5, HAIR, hl=False)
    s.put(14, 2, rgba(250, 150, 180))
    _cool_eyes(s, 9)
    s.outline()
    s.save('baekmae.png')


def palgeol():
    """개방 거지: patched rags, staff, wine gourd."""
    s = Sprite(24)
    s.poly([(18.6, 22.6), (19.8, 22.6), (19.8, 6), (18.6, 6)], rgba(110, 160, 90))
    _human(s, rgba(150, 125, 95), rgba(90, 70, 50))
    for x, y, c in [(8, 15, rgba(120, 90, 70)), (15, 19, rgba(170, 150, 110)), (10, 20, rgba(110, 100, 90))]:
        s.poly([(x, y), (x + 1.8, y), (x + 1.8, y + 1.8), (x, y + 1.8)], c)
    s.ellipse(6, 18, 1.6, 2.0, rgba(214, 150, 70))
    _head(s, 9, rgba(230, 196, 160))
    s.ellipse(12, 5.8, 6.2, 3.4, rgba(60, 50, 45), hl=False, ymax=8)
    for x in (6, 8, 16, 18):
        s.put(x, 6, rgba(60, 50, 45))
    s.eyes(9, 9, h=1, w=1, shine=False)
    s.put(11, 12, EYE)
    s.put(12, 12, EYE)
    s.outline()
    s.save('palgeol.png')


def dangyu():
    """사천당가: dark green, masked, needles between fingers."""
    s = Sprite(24)
    _human(s, rgba(40, 80, 60), rgba(160, 200, 90))
    for x in (17, 18, 19):
        s.put(x, 13, STEEL)
        s.put(x, 14, STEEL)
    _head(s)
    s.ellipse(12, 6.0, 5.9, 3.0, HAIR, hl=False, ymax=8)
    s.poly([(7, 10.4), (17, 10.4), (16.4, 13.6), (7.6, 13.6)], rgba(40, 80, 60))
    s.eyes(9, 8, h=2, w=1, shine=False, color=rgba(130, 200, 90))
    s.outline()
    s.save('dangyu.png')


def namgung():
    """남궁세가: noble in blue and gold, crown pin."""
    s = Sprite(24)
    s.poly([(4.2, 23), (5.6, 23), (5.6, 10), (4.2, 10)], STEEL)
    s.poly([(3.2, 13), (6.6, 13), (6.6, 14), (3.2, 14)], GOLD)
    _human(s, rgba(40, 70, 150), GOLD)
    _head(s)
    s.ellipse(12, 6.2, 5.9, 3.2, HAIR, hl=False, ymax=8)
    s.poly([(10.4, 3.8), (13.6, 3.8), (13.2, 1.6), (10.8, 1.6)], GOLD)
    _cool_eyes(s, 9)
    s.outline()
    s.save('namgung.png')


def maengju():
    """무림맹주 (unlockable): white-gold robes, dragon emblem, golden aura."""
    s = Sprite(24)
    s.poly([(4.6, 13.4), (19.4, 13.4), (21.6, 23), (2.4, 23)], rgba(240, 200, 90))
    _human(s, rgba(245, 242, 232), GOLD, wide=0.6)
    s.ellipse(12, 17.6, 1.8, 1.8, rgba(200, 60, 50), shade=False, hl=False)
    _head(s)
    s.ellipse(12, 6.2, 5.9, 3.2, rgba(225, 225, 230), hl=False, ymax=8)
    s.poly([(9.6, 4.6), (14.4, 4.6), (14, 1.2), (12, 2.4), (10, 1.2)], GOLD)
    s.poly([(10.4, 13.2), (13.6, 13.2), (12, 16.6)], rgba(225, 225, 230))
    _cool_eyes(s, 9)
    s.outline()
    s.sparkle(2, 4, rgba(255, 230, 140))
    s.sparkle(21, 6, rgba(255, 230, 140))
    s.save('maengju.png')


# ============ Sect technique art ============

def petal():
    s = Sprite(10)
    s.ellipse(5, 5, 3.8, 2.6, rgba(250, 160, 190), hl=False)
    s.put(3, 4, rgba(255, 220, 230))
    s.put(5, 5, rgba(230, 90, 130))
    s.outline()
    s.save('petal.png')


def needle():
    s = Sprite(12)
    s.poly([(11.6, 6), (1, 4.9), (1, 7.1)], STEEL)
    s.put(1, 6, rgba(130, 200, 90))
    s.outline()
    s.save('needle.png')


def bottle():
    s = Sprite(12)
    s.ellipse(6, 7.6, 3.6, 3.4, rgba(214, 150, 70))
    s.poly([(5, 1), (7, 1), (7, 4.4), (5, 4.4)], rgba(214, 150, 70))
    s.poly([(4.6, 0.4), (7.4, 0.4), (7.4, 1.4), (4.6, 1.4)], RED)
    s.outline()
    s.save('bottle.png')


def palm():
    s = Sprite(20)
    gold = rgba(240, 195, 80)
    s.ellipse(10, 13, 6.4, 5.6, gold)
    for x in (5.4, 8.2, 11, 13.8):
        s.poly([(x - 1.1, 11), (x + 1.1, 11), (x + 1.1, 3), (x - 1.1, 3)], gold)
        s.ellipse(x, 3, 1.1, 1.1, gold, shade=False, hl=False)
    s.ellipse(15.6, 13, 1.6, 3.4, gold, hl=False)
    s.outline()
    s.save('palm.png')


def bigsword():
    s = Sprite(24)
    s.poly([(12, 23.6), (10, 20), (10, 6), (14, 6), (14, 20)], STEEL)
    for y in range(7, 20):
        s.put(11, y, WHITE)
    s.poly([(7, 4.6), (17, 4.6), (17, 6.2), (7, 6.2)], GOLD)
    s.poly([(11, 0.4), (13, 0.4), (13, 4.6), (11, 4.6)], rgba(110, 70, 50))
    s.outline()
    s.save('bigsword.png')


def yinyang():
    s = Sprite(14)
    import math as _m
    for y in range(14):
        for x in range(14):
            px, py = x + 0.5 - 7, y + 0.5 - 7
            if px * px + py * py > 36:
                continue
            white = px > 0
            if _m.hypot(px, py + 3) < 3:
                white = True
            if _m.hypot(px, py - 3) < 3:
                white = False
            if _m.hypot(px, py + 3) < 1:
                white = False
            if _m.hypot(px, py - 3) < 1:
                white = True
            s.px[y][x] = rgba(245, 242, 232) if white else rgba(40, 34, 38)
    s.outline()
    s.save('yinyang.png')


# ============ More sects & yokai ============

def aemi():
    """아미파 여협: lilac robe, twin daggers."""
    s = Sprite(24)
    s.ellipse(12, 12.4, 6.2, 7.0, HAIR, hl=False)
    _human(s, rgba(176, 150, 210), rgba(250, 240, 250))
    for x in (17, 18):
        s.put(x, 14, STEEL)
        s.put(x + 1, 13, STEEL)
    _head(s)
    s.ellipse(12, 5.8, 5.9, 2.8, HAIR, hl=False, ymax=8)
    s.ellipse(12, 2.6, 2.0, 1.4, HAIR, hl=False)
    s.put(13, 2, rgba(250, 240, 250))
    s.eyes(9, 9, h=2, w=1, shine=False)
    s.outline()
    s.save('aemi.png')


def gonryun():
    """곤륜파 검수: snow-white and sky-blue, fur collar."""
    s = Sprite(24)
    s.poly([(15.6, 18), (16.6, 18.6), (21.6, 12.4), (20.8, 11.8)], rgba(200, 230, 250))
    _human(s, rgba(110, 160, 210), rgba(240, 244, 250))
    s.ellipse(12, 13.6, 5.4, 1.6, rgba(245, 245, 245), hl=False)
    _head(s)
    s.ellipse(12, 6.2, 5.9, 3.2, HAIR, hl=False, ymax=8)
    s.ellipse(12, 2.4, 1.7, 1.5, HAIR, hl=False)
    s.poly([(11, 1.8), (13, 1.8), (13, 2.8), (11, 2.8)], rgba(110, 160, 210))
    _cool_eyes(s, 9)
    s.outline()
    s.save('gonryun.png')


def jegal():
    """제갈세가 군사: scholar robe, crane-feather fan, tall hat."""
    s = Sprite(24)
    s.poly([(17.4, 12.6), (21.8, 9.6), (22.4, 14.4), (18.4, 15.2)], rgba(245, 245, 240))
    s.poly([(17.6, 15), (18.6, 15), (18.6, 18.4), (17.6, 18.4)], rgba(150, 105, 60))
    _human(s, rgba(70, 120, 110), rgba(230, 220, 190))
    _head(s, 9.4)
    s.poly([(10, 5.4), (14, 5.4), (13.4, 0.8), (10.6, 0.8)], HAIR)
    s.poly([(9, 5.0), (15, 5.0), (15, 5.8), (9, 5.8)], HAIR)
    s.eyes(9, 9, h=1, w=2, shine=False)
    s.outline()
    s.save('jegal.png')


def eodukssini():
    """어둑시니: shadow that looms, glowing eyes."""
    s = Sprite(24)
    shade = rgba(40, 36, 52, 225)
    s.ellipse(12, 12, 7.2, 8.4, shade)
    s.poly([(4.8, 14), (19.2, 14), (20, 22), (17, 20.6), (14.6, 22.6), (12, 20.8), (9.4, 22.6), (7, 20.6), (4, 22)], shade)
    s.eyes(9, 10, h=1, w=2, shine=False, color=rgba(255, 220, 90))
    s.outline()
    s.save('eodukssini.png')


def bulgasari():
    """불가사리: iron-eating beast, rust and steel plates."""
    s = Sprite(24)
    body = rgba(120, 112, 110)
    s.ellipse_sym(8, 21.6, 2.4, 1.6, mul(body, 0.8), shade=False)
    s.ellipse(12, 15.6, 8.2, 6.6, body)
    for x, y in [(7, 12), (11, 10), (15, 12), (9, 16), (14, 17)]:
        s.poly([(x, y), (x + 2.4, y), (x + 2.4, y + 1.6), (x, y + 1.6)], rgba(180, 110, 70))
    s.ellipse(12, 8.6, 4.8, 3.8, body)
    s.poly_sym([(9, 6), (7.6, 2.4), (10.6, 5.2)], STEEL)
    s.eyes(10, 8, h=1, w=1, shine=False, color=rgba(255, 120, 60))
    for x in range(10, 15):
        s.put(x, 11, WHITE)
    s.outline()
    s.save('bulgasari.png')


if __name__ == '__main__':
    for fn in (cheongpung, unhak, yeoubi, cheolsan, dallae, yawol,
               wisp, dokkaebi, crow, jangseung, wongwi, meok, gangsi,
               daedokkaebi, imugi, heukyo,
               sword, foxfire, chakram, crane, talisman,
               peach, ginseng, gourd, thunderball, treasure):
        fn()
    for fn in (songhwa, muyeong, geumbi, seola, cheonma, sansin, icicle,
               baekmae, palgeol, dangyu, namgung, maengju, petal, needle, bottle, palm, bigsword, yinyang,
               aemi, gonryun, jegal, eodukssini, bulgasari):
        fn()
    coin('coin.png', rgba(205, 140, 70), 10)
    coin('coin_gold.png', rgba(235, 190, 70), 12)
