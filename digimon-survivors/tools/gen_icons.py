"""Generates the pixel-art UI icons in ../assets/icons (replacing emoji in menus and the HUD).

Each icon is a dark lacquer badge with a gold trim and a 16x16 glyph on top.
Requires Pillow: pip install pillow
"""
import math
import os
from PIL import Image

from gen_sprites import Sprite, rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL, SKIN, HAIR, EXPORT_SCALE

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'icons')

FIRE = rgba(255, 128, 60)
FLAME = rgba(255, 216, 96)
ICE = rgba(176, 226, 255)
SKY = rgba(120, 180, 255)
JADE = rgba(100, 200, 150)
LEAF = rgba(120, 200, 90)
POISON = rgba(150, 230, 90)
PURPLE = rgba(170, 110, 235)
PINK = rgba(250, 156, 190)
BROWN = rgba(160, 108, 62)
BONE = rgba(238, 232, 214)
GREY = rgba(150, 150, 165)
DARK = rgba(70, 64, 84)
BLOOD = rgba(220, 40, 50)
PAPER = rgba(246, 232, 190)


class Glyph(Sprite):
    def __init__(self):
        super().__init__(16)

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

    def ring(self, cx, cy, r, w, c, a0=0, a1=360):
        for y in range(self.h):
            for x in range(self.w):
                px, py = x + 0.5 - cx, y + 0.5 - cy
                d = math.hypot(px, py)
                if not (r - w <= d <= r):
                    continue
                a = math.degrees(math.atan2(py, px)) % 360
                if (a0 <= a <= a1) if a0 <= a1 else (a >= a0 or a <= a1):
                    self.px[y][x] = c

    def disc(self, cx, cy, r, c):
        self.ellipse(cx, cy, r, r, c, shade=False, hl=False)

    def star(self, cx, cy, r1, r2, n, c, rot=-90):
        pts = []
        for i in range(n * 2):
            r = r1 if i % 2 == 0 else r2
            a = math.radians(rot + i * 180 / n)
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
        self.poly(pts, c)

    def erase(self, x0, y0, x1, y1):
        for y in range(self.h):
            for x in range(self.w):
                if x0 <= x + 0.5 <= x1 and y0 <= y + 0.5 <= y1:
                    self.px[y][x] = None


ICONS = {}


def icon(name, emoji):
    def deco(fn):
        ICONS[name] = (emoji, fn)
        return fn
    return deco


# ---------- glyph helpers ----------

def blade(g, x0, y0, x1, y1, col=STEEL, guard=GOLD, hilt=BROWN):
    """A sword from hilt (x0,y0) to tip (x1,y1)."""
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    gx, gy = x0 + ux * 3, y0 + uy * 3
    g.line(gx, gy, x1, y1, col, 2.2)
    g.line(gx + ux, gy + uy, x1 - ux * 1.5, y1 - uy * 1.5, mix(col, WHITE, 0.6), 0.8)
    g.line(gx - uy * 2.4, gy + ux * 2.4, gx + uy * 2.4, gy - ux * 2.4, guard, 1.4)
    g.line(x0, y0, gx, gy, hilt, 1.6)


def flame(g, cx, by, h, outer=FIRE, inner=FLAME):
    g.ellipse(cx, by - h * 0.32, h * 0.36, h * 0.32, outer, shade=False, hl=False)
    g.poly([(cx - h * 0.33, by - h * 0.38), (cx + h * 0.33, by - h * 0.38), (cx + h * 0.05, by - h), (cx - h * 0.12, by - h * 0.62)], outer)
    g.ellipse(cx, by - h * 0.26, h * 0.18, h * 0.2, inner, shade=False, hl=False)
    g.poly([(cx - h * 0.16, by - h * 0.32), (cx + h * 0.16, by - h * 0.32), (cx + h * 0.02, by - h * 0.7)], inner)


def cloud(g, cy, col=WHITE):
    g.ellipse(5.4, cy + 0.6, 3.2, 2.6, col, shade=False, hl=False)
    g.ellipse(9, cy - 1, 3.8, 3.4, col, shade=False, hl=False)
    g.ellipse(11.8, cy + 0.8, 2.8, 2.4, col, shade=False, hl=False)
    g.rect(3, cy + 1, 13.6, cy + 3, col)


def flower(g, petal, center, r=3.2, d=3.6):
    for i in range(5):
        a = math.radians(-90 + i * 72)
        g.ellipse(8 + math.cos(a) * d, 8 + math.sin(a) * d, r, r, petal, shade=False, hl=False)
    g.ellipse(8, 8, 2, 2, center, shade=False, hl=False)


def palm(g, col, x=8, s=1.0):
    """Open palm drawn pixel by pixel so the fingers stay readable; s=1 full size, s<1 narrow."""
    fw = 2 if s >= 1 else 1
    step = fw + 1
    width = 4 * step - 1
    x0 = int(round(x - width / 2))
    light = mix(col, WHITE, 0.35)
    for i, top in enumerate([4, 2, 2, 3]):
        for dx in range(fw):
            for y in range(top, 9):
                g.put(x0 + i * step + dx, y, light if dx == 0 else col)
    for y in range(8, 13):
        for xx in range(x0, x0 + width):
            g.put(xx, y, col)
    for tx, ty in [(-1, 11), (-1, 10), (-2, 9), (-2, 8)]:
        g.put(x0 + tx, ty, light)
    for y in (13, 14):
        for xx in range(x0 + 1, x0 + width - 1):
            g.put(xx, y, mul(col, 0.8))


def face_horns(g, skin, horn, eyes):
    g.ellipse(8, 9.2, 5, 4.8, skin)
    g.poly([(3.4, 7), (5.2, 5.6), (2.6, 1.6)], horn)
    g.poly([(12.6, 7), (10.8, 5.6), (13.4, 1.6)], horn)
    g.put(6, 8, eyes)
    g.put(9, 8, eyes)
    g.put(5, 7, INK)
    g.put(10, 7, INK)


def cloud_drops(g, drop, n=3):
    cloud(g, 5, rgba(220, 225, 235))
    for i in range(n):
        x = 4.5 + i * 3.4
        g.line(x, 10.6, x - 1, 14, drop, 1.1)


def palm_pair(g):
    palm(g, GOLD, 4.8, 0.6)
    palm(g, mix(GOLD, WHITE, 0.15), 12.2, 0.6)


# ---------- weapons ----------

@icon('sword', '🗡️')
def _(g): blade(g, 3, 13, 13.4, 2.6)


@icon('fire', '🔥')
def _(g): flame(g, 8, 15, 13)


@icon('chakram', '⭕')
def _(g):
    g.ring(8, 8, 6.6, 2.6, STEEL)
    for a in range(0, 360, 60):
        r = math.radians(a)
        g.poly([(8 + math.cos(r) * 6, 8 + math.sin(r) * 6), (8 + math.cos(r + 0.5) * 6, 8 + math.sin(r + 0.5) * 6), (8 + math.cos(r + 0.2) * 7.8, 8 + math.sin(r + 0.2) * 7.8)], WHITE)
    g.ring(8, 8, 4.2, 0.9, mix(STEEL, WHITE, 0.6))


@icon('bolt', '⚡')
def _(g):
    g.poly([(9.6, 1), (3.6, 9), (7.6, 9), (6, 15), (12.4, 6.4), (8.4, 6.4), (10.6, 1)], FLAME)
    g.line(9.4, 2.4, 6, 8, WHITE, 0.8)


@icon('taiji', '☯️')
def _(g):
    g.disc(8, 8, 6.6, WHITE)
    for y in range(16):
        for x in range(16):
            if g.px[y][x] is None:
                continue
            px, py = x + 0.5, y + 0.5
            right = px > 8
            if math.hypot(px - 8, py - 4.7) <= 3.3:
                right = True
            if math.hypot(px - 8, py - 11.3) <= 3.3:
                right = False
            if right:
                g.px[y][x] = rgba(40, 34, 44)
    g.disc(8, 4.7, 1, WHITE)
    g.disc(8, 11.3, 1, rgba(40, 34, 44))


@icon('swirl', '🌀')
def _(g):
    for i in range(140):
        t = i / 140 * 3.2 * math.pi
        r = 1 + t * 0.62
        g.disc(8 + math.cos(t) * r, 8 + math.sin(t) * r, 0.9, SKY if i % 30 > 4 else ICE)


@icon('qi', '💫')
def _(g):
    g.ring(9, 9, 7, 2.4, ICE, 150, 330)
    g.ring(9, 9, 5.2, 0.9, WHITE, 170, 310)
    g.star(4, 4, 3.2, 1.2, 4, FLAME)


@icon('firework', '🎇')
def _(g):
    for i in range(8):
        a = math.radians(i * 45)
        g.line(8 + math.cos(a) * 2, 8 + math.sin(a) * 2, 8 + math.cos(a) * 6.8, 8 + math.sin(a) * 6.8, FLAME if i % 2 else FIRE, 1.2)
    g.disc(8, 8, 1.6, WHITE)
    g.put(2, 13, PINK)
    g.put(13, 2, PINK)


@icon('crane', '🕊️')
def _(g):
    g.poly([(1.4, 9), (8, 3), (8.6, 10)], PAPER)
    g.poly([(14.6, 7), (8, 3), (8.6, 10)], mul(PAPER, 0.85))
    g.poly([(4, 10), (12, 10), (8, 13.4)], WHITE)
    g.line(12, 10, 14.4, 8, WHITE, 1)
    g.put(14, 8, RED)


@icon('poison_skull', '☠️')
def _(g):
    g.line(2.4, 13, 13.6, 3, BONE, 1.6)
    g.line(2.4, 3, 13.6, 13, BONE, 1.6)
    g.ellipse(8, 7, 4.6, 4.2, POISON, shade=False, hl=False)
    g.rect(5.6, 9.6, 10.4, 12.4, POISON)
    g.rect(5, 6, 7, 8, INK)
    g.rect(9, 6, 11, 8, INK)
    g.put(7, 11, INK)
    g.put(9, 11, INK)


@icon('slash', '🔪')
def _(g):
    g.ring(1, 15, 13.6, 3, STEEL, 270, 360)
    g.ring(1, 15, 12.4, 0.9, WHITE, 275, 355)
    g.ring(15, 1, 9, 1.4, mix(STEEL, WHITE, 0.4), 95, 175)


@icon('icecube', '🧊')
def _(g):
    g.poly([(8, 1.4), (14, 4.6), (8, 7.8), (2, 4.6)], mix(ICE, WHITE, 0.5))
    g.poly([(2, 4.6), (8, 7.8), (8, 14.6), (2, 11.4)], ICE)
    g.poly([(14, 4.6), (8, 7.8), (8, 14.6), (14, 11.4)], SKY)
    g.line(4, 7, 4, 10, WHITE, 0.8)


@icon('tornado', '🌪️')
def _(g):
    for i, (y, w) in enumerate([(3, 6.4), (6, 5), (9, 3.6), (12, 2.4), (14.4, 1.2)]):
        g.ellipse(8 + (i % 2) * 0.8 - 0.4, y, w, 1.4, rgba(200, 210, 225) if i % 2 else WHITE, shade=False, hl=False)


@icon('talisman', '📯')
def _(g):
    g.rect(4, 1, 12, 15, rgba(240, 210, 90))
    g.rect(5.2, 2.4, 10.8, 3.6, RED)
    g.line(8, 5, 8, 13, RED, 1.2)
    g.line(5.6, 7, 10.4, 7, RED, 1)
    g.line(5.6, 10.4, 10.4, 9, RED, 1)


@icon('sakura', '🌸')
def _(g): flower(g, PINK, FLAME)


@icon('plumfall', '🏵️')
def _(g):
    flower(g, rgba(236, 90, 130), FLAME, 2.6, 3.4)
    g.ellipse(2.4, 13.6, 1.4, 1.2, PINK, shade=False, hl=False)
    g.ellipse(13.4, 2.6, 1.2, 1.4, PINK, shade=False, hl=False)


@icon('palm', '🖐️')
def _(g): palm(g, GOLD)


@icon('vajra', '🛕')
def _(g):
    g.poly([(8, 0.6), (15, 5), (1, 5)], GOLD)
    g.rect(3, 5, 13, 6.4, mul(GOLD, 0.7))
    g.rect(4.4, 6.4, 11.6, 13.4, GOLD)
    g.rect(7, 8.6, 9, 13.4, rgba(120, 40, 30))
    g.rect(2, 13.4, 14, 15, mul(GOLD, 0.7))


@icon('staff', '🥢')
def _(g):
    g.line(3, 14, 13.4, 2, LEAF, 2.2)
    g.line(4, 12, 12.6, 2.4, mix(LEAF, WHITE, 0.4), 0.7)
    for t in (0.3, 0.6):
        g.line(3 + 10.4 * t - 1.4, 14 - 12 * t - 1.2, 3 + 10.4 * t + 1.4, 14 - 12 * t + 1.2, mul(LEAF, 0.6), 0.9)


@icon('bottle', '🍶')
def _(g):
    g.ellipse(8, 11, 5, 4, WHITE)
    g.ellipse(8, 5.4, 2.6, 2.4, WHITE)
    g.rect(6.8, 1, 9.2, 3.6, BROWN)
    g.rect(3.4, 10, 12.6, 11.6, SKY)


@icon('needles', '📍')
def _(g):
    for a in (-30, 0, 30):
        r = math.radians(a - 90)
        g.line(8, 14.6, 8 + math.cos(r) * 12, 14.6 + math.sin(r) * 12, STEEL, 1.1)
        g.put(int(8 + math.cos(r) * 12.4), int(14.6 + math.sin(r) * 12.4), POISON)
    g.rect(6.4, 13, 9.6, 15, RED)


@icon('flask', '🧪')
def _(g):
    g.rect(6.4, 1.4, 9.6, 6, rgba(220, 230, 240))
    g.poly([(6.4, 6), (9.6, 6), (14, 14.4), (2, 14.4)], rgba(220, 230, 240))
    g.poly([(4.6, 10), (11.4, 10), (14, 14.4), (2, 14.4)], PURPLE)
    g.put(7, 12, POISON)
    g.put(10, 11, POISON)


@icon('crossed', '⚔️')
def _(g):
    blade(g, 2.4, 13.6, 13.6, 2.4)
    blade(g, 13.6, 13.6, 2.4, 2.4)


@icon('crown', '👑')
def _(g):
    g.poly([(1.6, 12.6), (1.6, 4), (5, 8), (8, 2.4), (11, 8), (14.4, 4), (14.4, 12.6)], GOLD)
    g.rect(1.6, 12.4, 14.4, 14.4, mul(GOLD, 0.75))
    g.put(7, 9, RED)
    g.put(8, 9, RED)
    g.put(3, 10, SKY)
    g.put(12, 10, SKY)


@icon('icepalm', '🥶')
def _(g):
    palm(g, ICE)
    g.put(4, 3, WHITE)
    g.put(13, 5, WHITE)


@icon('snowcloud', '🌨️')
def _(g):
    cloud(g, 5, rgba(220, 225, 235))
    for x, y in [(4, 11), (8, 13), (12, 11), (6, 14.6), (10, 15)]:
        g.put(x, y, WHITE)
        g.put(x, y - 1, ICE)


@icon('demon', '😈')
def _(g):
    face_horns(g, PURPLE, rgba(60, 40, 70), FLAME)
    g.poly([(5.4, 11), (10.6, 11), (8, 12.6)], INK)


@icon('blood', '🩸')
def _(g):
    g.ellipse(8, 10.4, 4.6, 4.4, BLOOD)
    g.poly([(3.6, 9.4), (12.4, 9.4), (8, 1)], BLOOD)
    g.rect(5.4, 8.4, 6.6, 11, rgba(255, 140, 140))


@icon('lotus', '🪷')
def _(g):
    for a, c in [(-60, PINK), (60, PINK), (-28, mix(PINK, WHITE, 0.3)), (28, mix(PINK, WHITE, 0.3)), (0, mix(PINK, WHITE, 0.5))]:
        r = math.radians(a - 90)
        cx, cy = 8 + math.cos(r) * 3.2, 11 + math.sin(r) * 3.2
        g.poly([(8, 12), (cx + math.cos(r + 1.5) * 2, cy + math.sin(r + 1.5) * 2), (8 + math.cos(r) * 7.6, 11 + math.sin(r) * 7.6), (cx + math.cos(r - 1.5) * 2, cy + math.sin(r - 1.5) * 2)], c)
    g.rect(2.4, 12, 13.6, 14, JADE)


@icon('mountain', '🏔️')
def _(g):
    g.poly([(0.4, 15), (8, 2), (15.6, 15)], rgba(110, 130, 170))
    g.poly([(5.1, 7), (8, 2), (10.9, 7), (9.4, 6), (8, 7.6), (6.6, 6)], WHITE)
    g.poly([(8, 15), (11.6, 8.6), (15.6, 15)], rgba(80, 96, 140))


@icon('cloud', '☁️')
def _(g): cloud(g, 7)


@icon('formation', '🔯')
def _(g):
    pts = [(8 + math.cos(math.radians(22.5 + i * 45)) * 7, 8 + math.sin(math.radians(22.5 + i * 45)) * 7) for i in range(8)]
    for i in range(8):
        g.line(*pts[i], *pts[(i + 1) % 8], GOLD, 1.2)
    for i in range(0, 8, 2):
        g.line(*pts[i], *pts[(i + 3) % 8], mul(GOLD, 0.75), 0.9)
    g.disc(8, 8, 1.4, RED)


@icon('feather', '🪶')
def _(g):
    g.poly([(3, 14), (6, 5), (11, 1.4), (13, 4), (10, 10)], WHITE)
    g.poly([(3, 14), (10, 10), (13, 4), (12, 9)], rgba(200, 220, 225))
    g.line(2, 15, 11.4, 3, BROWN, 0.9)


@icon('fist', '👊')
def _(g):
    skin = rgba(240, 200, 160)
    g.rect(3, 4, 12, 12, skin)
    for i, x in enumerate((3, 5.4, 7.8, 10.2)):
        g.rect(x, 3, x + 2, 5.4, mix(skin, WHITE, 0.25) if i % 2 else skin)
        g.line(x + 2, 4, x + 2, 7, mul(skin, 0.7), 0.5)
    g.rect(1.6, 7, 4.6, 10.4, skin)
    g.rect(4, 12, 11, 15, RED)
    g.line(12.4, 3, 15.4, 1, FLAME, 0.9)
    g.line(12.6, 7, 15.6, 7, FLAME, 0.9)
    g.line(12.4, 11, 15.4, 13, FLAME, 0.9)


# ---------- combos ----------

@icon('fox', '🦊')
def _(g):
    g.poly([(1.6, 2), (6.4, 5), (3, 8)], FIRE)
    g.poly([(14.4, 2), (9.6, 5), (13, 8)], FIRE)
    g.poly([(1.6, 5.6), (14.4, 5.6), (8, 14.6)], FIRE)
    g.poly([(4, 9), (12, 9), (8, 14.6)], WHITE)
    g.put(5, 7, INK)
    g.put(10, 7, INK)
    g.put(7, 13, INK)
    g.put(8, 13, INK)


@icon('moon', '🌕')
def _(g):
    g.ellipse(8, 8, 6.6, 6.6, FLAME)
    g.disc(10, 6, 1.2, mul(FLAME, 0.85))
    g.disc(6, 10.4, 1.6, mul(FLAME, 0.85))


@icon('thunder', '🌩️')
def _(g):
    cloud(g, 4.6, rgba(110, 106, 130))
    g.poly([(9, 7), (5.4, 11.4), (7.8, 11.4), (6.4, 15.4), (11, 10), (8.6, 10), (10.4, 7)], FLAME)


@icon('trident', '🔱')
def _(g):
    g.line(8, 4, 8, 15, GOLD, 1.6)
    g.ring(8, 3, 5.4, 1.4, GOLD, 0, 180)
    g.poly([(1.6, 3.4), (3.6, 3.4), (2.6, 0.6)], GOLD)
    g.poly([(12.4, 3.4), (14.4, 3.4), (13.4, 0.6)], GOLD)
    g.poly([(6.8, 4), (9.2, 4), (8, 0.4)], GOLD)
    g.rect(6, 9.4, 10, 10.6, RED)


@icon('rockmount', '⛰️')
def _(g):
    g.poly([(0.4, 15), (5.6, 4), (9, 9), (11, 6), (15.6, 15)], BROWN)
    g.poly([(5.6, 4), (9, 9), (7.4, 9.4), (5.6, 7.4), (4.2, 7)], mix(BROWN, WHITE, 0.4))
    g.poly([(6, 15), (11, 6), (15.6, 15)], mul(BROWN, 0.75))


@icon('sparkles', '✨')
def _(g):
    g.star(6.4, 9, 6, 1.6, 4, FLAME)
    g.star(12.6, 3.6, 3.2, 0.9, 4, WHITE)
    g.star(12.6, 12.6, 2.4, 0.8, 4, FLAME)


def dragon(g, body, belly):
    for i in range(60):
        t = i / 60
        x = 2 + t * 9
        y = 13 - math.sin(t * math.pi * 1.4) * 4 - t * 4
        g.disc(x, y, 1.9 - t * 0.3, body)
    g.ellipse(11.8, 4.6, 3, 2.6, body)
    g.poly([(12, 3.4), (15.6, 4.6), (12.4, 6.6)], body)
    g.line(10, 2.4, 8.4, 0.4, FLAME, 0.9)
    g.line(12.4, 2.4, 13, 0.2, FLAME, 0.9)
    g.put(12, 4, FLAME)
    for i in range(4):
        g.put(3 + i * 2, 12 - i, belly)


@icon('dragon', '🐉')
def _(g): dragon(g, rgba(70, 170, 110), FLAME)


@icon('dragon_red', '🐲')
def _(g): dragon(g, rgba(210, 60, 50), FLAME)


@icon('swan', '🦢')
def _(g):
    g.ellipse(7, 10.4, 5, 3.4, WHITE)
    g.poly([(3, 9), (1, 4), (7, 8)], mul(WHITE, 0.85))
    g.line(10.6, 9, 12, 3.6, WHITE, 1.4)
    g.ellipse(12, 3, 1.6, 1.4, WHITE, shade=False, hl=False)
    g.put(12, 1, RED)
    g.line(13, 3, 15, 4, rgba(70, 64, 60), 0.8)
    g.rect(4, 12.6, 10, 13.6, INK)


@icon('snowflake', '❄️')
def _(g):
    for a in range(0, 180, 60):
        r = math.radians(a)
        g.line(8 - math.cos(r) * 7, 8 - math.sin(r) * 7, 8 + math.cos(r) * 7, 8 + math.sin(r) * 7, ICE, 1.3)
        for s in (-1, 1):
            bx, by = 8 + s * math.cos(r) * 4.4, 8 + s * math.sin(r) * 4.4
            for da in (0.8, -0.8):
                g.line(bx, by, bx + s * math.cos(r + da) * 2.4, by + s * math.sin(r + da) * 2.4, WHITE, 0.9)
    g.disc(8, 8, 1.2, WHITE)


@icon('web', '🕸️')
def _(g):
    for a in range(0, 360, 45):
        r = math.radians(a)
        g.line(8, 8, 8 + math.cos(r) * 7.4, 8 + math.sin(r) * 7.4, rgba(220, 220, 230), 0.8)
    for rad in (2.6, 4.8, 7):
        g.ring(8, 8, rad, 0.8, rgba(220, 220, 230))
    g.disc(10.6, 10.6, 1.4, RED)


@icon('whiteflower', '💮')
def _(g): flower(g, WHITE, RED, 3, 3.8)


@icon('pray', '🙏')
def _(g): palm_pair(g)


@icon('rain', '🌧️')
def _(g): cloud_drops(g, SKY, 4)


@icon('oni', '👹')
def _(g):
    face_horns(g, rgba(210, 60, 50), BONE, FLAME)
    g.rect(5, 11, 11, 12.6, INK)
    g.put(5, 11, WHITE)
    g.put(10, 11, WHITE)


# ---------- passives ----------

@icon('heart', '💗')
def _(g):
    g.ellipse(5.4, 6, 3.6, 3.4, rgba(240, 80, 110))
    g.ellipse(10.6, 6, 3.6, 3.4, rgba(240, 80, 110))
    g.poly([(1.9, 7), (14.1, 7), (8, 14.6)], rgba(240, 80, 110))
    g.put(4, 4, WHITE)


@icon('hourglass', '⏳')
def _(g):
    g.rect(3, 1, 13, 2.6, BROWN)
    g.rect(3, 13.4, 13, 15, BROWN)
    g.poly([(4, 2.6), (12, 2.6), (8.6, 8), (12, 13.4), (4, 13.4), (7.4, 8)], rgba(210, 225, 235))
    g.poly([(5.4, 4), (10.6, 4), (8, 7.4)], FLAME)
    g.poly([(5, 13.4), (11, 13.4), (8, 10.6)], FLAME)


@icon('leaf', '🍃')
def _(g):
    g.ellipse(6, 9, 4.8, 2.6, LEAF)
    g.ellipse(10.6, 5.4, 4, 2.2, mix(LEAF, WHITE, 0.25))
    g.line(1.6, 13, 13.6, 3.6, mul(LEAF, 0.55), 0.8)


@icon('magnet', '🧲')
def _(g):
    g.ring(8, 8, 6.4, 3, RED, 180, 360)
    g.rect(1.6, 8, 4.6, 12, RED)
    g.rect(11.4, 8, 14.4, 12, RED)
    g.rect(1.6, 12, 4.6, 14.6, STEEL)
    g.rect(11.4, 12, 14.4, 14.6, STEEL)


@icon('tea', '🍵')
def _(g):
    g.poly([(2, 7), (14, 7), (12, 14), (4, 14)], JADE)
    g.rect(2, 6.4, 14, 7.6, rgba(150, 200, 120))
    g.rect(5, 9, 11, 10.4, mix(JADE, WHITE, 0.4))
    for x in (6, 9):
        g.line(x, 4.6, x + 1, 1, rgba(230, 230, 230), 0.8)


@icon('target', '🎯')
def _(g):
    g.disc(8, 8, 6.8, RED)
    g.disc(8, 8, 4.8, WHITE)
    g.disc(8, 8, 2.8, RED)
    g.line(8, 8, 15, 1, BROWN, 1.1)
    g.poly([(13, 1), (15, 1), (15, 3)], FLAME)


@icon('scroll', '📜')
def _(g):
    g.rect(3, 3, 13, 13, PAPER)
    g.rect(1.4, 1.6, 14.6, 3.4, BROWN)
    g.rect(1.4, 12.6, 14.6, 14.4, BROWN)
    for y in (5.4, 7.6, 9.8):
        g.rect(5, y, 11, y + 0.9, mul(PAPER, 0.6))


@icon('shield', '🛡️')
def _(g):
    g.poly([(2, 2), (14, 2), (14, 8), (8, 15), (2, 8)], STEEL)
    g.poly([(4, 3.6), (12, 3.6), (12, 8), (8, 12.6), (4, 8)], RED)
    g.rect(7.2, 3.6, 8.8, 12, GOLD)


@icon('clones', '👥')
def _(g):
    for x, c in [(10.4, rgba(120, 120, 150)), (5.6, rgba(190, 200, 230))]:
        g.ellipse(x, 5, 2.6, 2.6, c, shade=False, hl=False)
        g.ellipse(x, 13, 4, 4, c, shade=False, hl=False, ymax=15)


@icon('luckbag', '🧧')
def _(g):
    g.rect(3, 1.4, 13, 14.6, RED)
    g.poly([(3, 1.4), (13, 1.4), (8, 6)], mul(RED, 0.75))
    g.disc(8, 9.6, 2.6, GOLD)
    g.rect(7.4, 8, 8.6, 11.2, mul(RED, 0.8))


@icon('candle', '🕯️')
def _(g):
    g.rect(5.6, 7, 10.4, 14.6, BONE)
    g.rect(4, 13.6, 12, 15, BROWN)
    flame(g, 8, 6.6, 6)


@icon('bow', '🏹')
def _(g):
    g.ring(3, 8, 10, 1.6, BROWN, 300, 60)
    g.line(10.6, 1.6, 10.6, 14.4, BONE, 0.7)
    g.line(1.4, 8, 14, 8, STEEL, 1)
    g.poly([(13, 6.4), (15.6, 8), (13, 9.6)], STEEL)
    g.poly([(1, 6.4), (3, 8), (1, 9.6)], RED)


@icon('peach', '🍑')
def _(g):
    g.ellipse(8, 9.4, 5.6, 5.2, rgba(250, 160, 160))
    g.line(8, 5, 8, 14, rgba(230, 120, 130), 0.7)
    g.poly([(8.4, 4.4), (14, 1.4), (12.6, 5)], LEAF)
    g.put(5, 7, WHITE)


# ---------- shop / tools ----------

@icon('money', '💰')
def _(g):
    g.ellipse(8, 10, 6, 4.8, rgba(200, 50, 60))
    g.poly([(5, 3), (11, 3), (9.4, 6), (6.6, 6)], rgba(200, 50, 60))
    g.rect(5, 5, 11, 6.4, GOLD)
    g.poly([(4.4, 10), (11.6, 10), (10, 13), (6, 13)], rgba(220, 226, 236))
    g.ellipse(8, 10.4, 2.4, 1.6, WHITE, shade=False, hl=False)


@icon('reroll', '🔄')
def _(g):
    g.ring(8, 8, 6.4, 2, JADE, 200, 340)
    g.ring(8, 8, 6.4, 2, JADE, 20, 160)
    g.poly([(12.4, 1.4), (15.4, 5.6), (10.6, 6)], JADE)
    g.poly([(3.6, 14.6), (0.6, 10.4), (5.4, 10)], JADE)


@icon('skip', '⏭️')
def _(g):
    g.poly([(1.4, 3), (7.4, 8), (1.4, 13)], SKY)
    g.poly([(7, 3), (13, 8), (7, 13)], SKY)
    g.rect(13, 3, 14.8, 13, SKY)


@icon('banish', '🚫')
def _(g):
    g.ring(8, 8, 7, 2.2, BLOOD)
    g.line(3.4, 3.4, 12.6, 12.6, BLOOD, 2.2)


@icon('skull', '💀')
def _(g):
    g.ellipse(8, 7, 6, 5.6, BONE, shade=False, hl=False)
    g.rect(4.6, 10, 11.4, 14.4, BONE)
    g.rect(4.4, 6, 7, 9, INK)
    g.rect(9, 6, 11.6, 9, INK)
    g.put(7, 10, INK)
    g.put(8, 10, INK)
    for x in (6, 8, 10):
        g.put(x, 13, mul(BONE, 0.6))


# ---------- achievements / misc ----------

@icon('castle', '🏯')
def _(g):
    for y, w, c in [(2.6, 4, RED), (7, 6, RED), (11.6, 7, RED)]:
        g.poly([(8 - w - 1, y + 1.6), (8 + w + 1, y + 1.6), (8 + w * 0.5, y - 1), (8 - w * 0.5, y - 1)], rgba(60, 70, 100))
        g.rect(8 - w * 0.6, y + 1.6, 8 + w * 0.6, y + 3.4, BONE)
    g.rect(6.6, 13.2, 9.4, 15, RED)


@icon('crescent', '🌙')
def _(g):
    g.disc(8, 8, 6.6, FLAME)
    g.disc(11, 6, 5.4, None)
    for y in range(16):
        for x in range(16):
            if math.hypot(x + 0.5 - 11, y + 0.5 - 6) <= 5.4:
                g.px[y][x] = None


@icon('darkmoon', '🌒')
def _(g):
    g.disc(8, 8, 6.6, DARK)
    for y in range(16):
        for x in range(16):
            if math.hypot(x + 0.5 - 8, y + 0.5 - 8) <= 6.6 and math.hypot(x + 0.5 - 5.2, y + 0.5 - 8) > 6:
                g.px[y][x] = FLAME


@icon('sunrise', '🌅')
def _(g):
    g.ellipse(8, 11, 5.6, 5.6, FIRE, shade=False, hl=False, ymax=11)
    for a in (-150, -120, -90, -60, -30):
        r = math.radians(a)
        g.line(8 + math.cos(r) * 7, 11 + math.sin(r) * 7, 8 + math.cos(r) * 8.6, 11 + math.sin(r) * 8.6, FLAME, 1.2)
    g.rect(0.6, 11, 15.4, 12.4, SKY)
    g.rect(2, 13.4, 14, 14.4, mul(SKY, 0.8))


@icon('book', '📖')
def _(g):
    g.poly([(0.8, 3), (8, 4.6), (8, 14.4), (0.8, 12.6)], PAPER)
    g.poly([(15.2, 3), (8, 4.6), (8, 14.4), (15.2, 12.6)], mul(PAPER, 0.9))
    for y in (6.4, 8.6, 10.6):
        g.line(2.6, y, 6.6, y + 0.6, mul(PAPER, 0.55), 0.7)
        g.line(9.4, y + 0.6, 13.4, y, mul(PAPER, 0.55), 0.7)
    g.line(8, 4.6, 8, 14.4, RED, 0.8)


@icon('books', '📚')
def _(g):
    for y, c, dx in [(11, RED, 0), (7, SKY, 0.8), (3, JADE, -0.6)]:
        g.rect(2 + dx, y, 14 + dx, y + 3.6, c)
        g.rect(11 + dx, y + 0.8, 13.4 + dx, y + 2.8, PAPER)


@icon('bundle', '🎒')
def _(g):
    g.ellipse(8, 10, 6.4, 5, rgba(70, 110, 170))
    g.poly([(4, 6), (8, 7.6), (6, 2)], rgba(70, 110, 170))
    g.poly([(12, 6), (8, 7.6), (10, 2)], rgba(70, 110, 170))
    g.disc(8, 7.4, 1.6, mul(rgba(70, 110, 170), 0.75))
    for x, y in [(5, 11), (10, 9), (8, 13)]:
        g.put(x, y, WHITE)


@icon('chest', '🎁')
def _(g):
    g.rect(1.6, 6, 14.4, 14.4, rgba(170, 40, 40))
    g.ellipse(8, 6.4, 6.4, 3.6, rgba(196, 54, 48), shade=False, hl=False, ymax=7)
    g.rect(1.6, 7, 14.4, 8.2, GOLD)
    g.rect(6.4, 8, 9.6, 11.6, GOLD)
    g.put(7, 9, INK)


@icon('lantern', '🏮')
def _(g):
    g.ellipse(8, 8.4, 5.6, 5.4, RED)
    g.rect(5, 2, 11, 3.6, INK)
    g.rect(5, 13.2, 11, 14.6, INK)
    g.line(8, 0.4, 8, 2, GOLD, 0.8)
    g.line(3, 8.4, 13, 8.4, mul(RED, 0.7), 0.8)
    for x in (5.4, 10.6):
        g.line(x, 4, x, 13, mul(RED, 0.72), 0.7)
    g.ellipse(8, 8.4, 1.8, 2.6, FLAME, shade=False, hl=False)
    g.line(8, 14.6, 8, 15.8, GOLD, 0.8)


@icon('sun', '☀️')
def _(g):
    for i in range(8):
        r = math.radians(i * 45)
        g.line(8 + math.cos(r) * 5, 8 + math.sin(r) * 5, 8 + math.cos(r) * 7.4, 8 + math.sin(r) * 7.4, FIRE, 1.4)
    g.ellipse(8, 8, 4.4, 4.4, FLAME)


@icon('rainbow', '🌈')
def _(g):
    for i, c in enumerate([RED, FIRE, FLAME, LEAF, SKY, PURPLE]):
        g.ring(8, 13, 7.6 - i * 1.1, 1.1, c, 180, 360)


@icon('coffin', '⚰️')
def _(g):
    g.poly([(5, 1), (11, 1), (13.4, 4.4), (11.4, 15), (4.6, 15), (2.6, 4.4)], BROWN)
    g.line(8, 3.4, 8, 11, GOLD, 1)
    g.line(5.6, 6, 10.4, 6, GOLD, 1)


@icon('star', '🌟')
def _(g):
    g.star(8, 8.6, 7.4, 3, 5, FLAME)
    g.star(8, 8.6, 3.6, 1.4, 5, WHITE)


@icon('gi', '🥋')
def _(g):
    g.poly([(1, 4), (5, 1.4), (8, 6), (11, 1.4), (15, 4), (13.4, 8), (12, 7), (12, 15), (4, 15), (4, 7), (2.6, 8)], WHITE)
    g.poly([(5, 1.4), (8, 6), (11, 1.4), (9.6, 1.4), (8, 4), (6.4, 1.4)], mul(WHITE, 0.8))
    g.rect(4, 9.4, 12, 11, INK)
    g.rect(9, 11, 10.6, 14, INK)


@icon('compass', '🧭')
def _(g):
    g.disc(8, 8, 7, GOLD)
    g.disc(8, 8, 5.6, PAPER)
    g.poly([(8, 2.6), (9.6, 8), (6.4, 8)], RED)
    g.poly([(8, 13.4), (9.6, 8), (6.4, 8)], DARK)


@icon('lock', '🔒')
def _(g):
    g.ring(8, 6.4, 4.4, 1.6, STEEL, 180, 360)
    g.rect(3.6, 6, 5.2, 8, STEEL)
    g.rect(10.8, 6, 12.4, 8, STEEL)
    g.rect(2.4, 7.6, 13.6, 15, GOLD)
    g.rect(7.2, 10, 8.8, 13, INK)


@icon('trophy', '🏆')
def _(g):
    g.poly([(3, 1.6), (13, 1.6), (12, 7), (8, 10), (4, 7)], GOLD)
    g.ring(3, 4.4, 2.6, 1, GOLD, 90, 270)
    g.ring(13, 4.4, 2.6, 1, GOLD, 270, 90)
    g.rect(7, 9.4, 9, 12.4, mul(GOLD, 0.8))
    g.rect(4, 12.4, 12, 14.6, BROWN)
    g.rect(5, 3, 6.4, 6, mix(GOLD, WHITE, 0.6))


@icon('firecracker', '🧨')
def _(g):
    g.line(4, 13, 11, 6, RED, 4)
    g.line(5, 11, 9, 7, rgba(240, 90, 80), 1)
    g.line(11.4, 5.6, 13.4, 2.4, BONE, 0.8)
    g.star(13.6, 2, 2.4, 0.8, 4, FLAME)


# ---------- dedicated technique glyphs ----------
WGLYPH = {}


def wglyph(name):
    def deco(fn):
        WGLYPH[name] = fn
        return fn
    return deco


@wglyph('orbit')
def _(g):
    for i in range(3):
        a = math.radians(-90 + i * 120)
        x, y = 8 + math.cos(a) * 4.6, 8.6 + math.sin(a) * 4.6
        g.ellipse(x, y + 1, 2, 2, SKY, shade=False, hl=False)
        g.poly([(x - 1.8, y + 1), (x + 1.8, y + 1), (x + 0.4, y - 3)], SKY)
        g.put(x, y + 1, WHITE)
    g.ring(8, 8.6, 5.6, 0.6, rgba(150, 200, 255))


@wglyph('lightning')
def _(g):
    g.rect(2.6, 1, 9.4, 15, PAPER)
    g.line(6, 3, 6, 12, RED, 1)
    g.line(4, 6, 8, 6, RED, 0.8)
    g.poly([(12.6, 1), (9.6, 8), (12, 8), (10.4, 15), (15, 6.4), (12.6, 6.4), (14.6, 1)], FLAME)


@wglyph('aura')
def _(g):
    pts = [(8 + math.cos(math.radians(30 + i * 60)) * 7, 8 + math.sin(math.radians(30 + i * 60)) * 7) for i in range(6)]
    g.poly(pts, rgba(120, 90, 40))
    inner = [(8 + math.cos(math.radians(30 + i * 60)) * 5, 8 + math.sin(math.radians(30 + i * 60)) * 5) for i in range(6)]
    g.poly(inner, rgba(255, 220, 120))
    for i in range(6):
        g.line(*pts[i], *pts[(i + 1) % 6], GOLD, 1.2)
    g.ellipse(8, 8, 2, 2, WHITE, shade=False, hl=False)


@wglyph('quake')
def _(g):
    g.ring(9, 8, 7.4, 1.2, rgba(220, 230, 240), 300, 60)
    g.ring(9, 8, 5, 1, rgba(220, 230, 240), 310, 50)
    g.ellipse(5, 9, 3.6, 3.6, rgba(240, 200, 160))
    for i, y in enumerate((4.4, 6.2, 8, 9.8)):
        g.rect(7, y, 10.4 - i * 0.4, y + 1.4, rgba(240, 200, 160))
    g.rect(1, 7.4, 3, 11, rgba(200, 60, 50))


@wglyph('firework')
def _(g):
    g.rect(4, 4, 10.6, 15, PAPER)
    g.line(7.3, 6, 7.3, 13, RED, 1)
    flame(g, 11, 8.4, 8)
    g.put(3, 2, FLAME)
    g.put(13, 12, FIRE)


@wglyph('thorn')
def _(g):
    cloud(g, 8, rgba(140, 210, 90))
    g.ellipse(6, 6, 2.4, 2, rgba(170, 120, 220), shade=False, hl=False)
    g.ellipse(8, 11, 1.6, 1.6, BONE, shade=False, hl=False)
    g.put(7, 11, INK)
    g.put(9, 11, INK)


@wglyph('slash')
def _(g):
    g.line(2, 2, 14, 14, WHITE, 2)
    g.line(14, 2, 2, 14, WHITE, 2)
    g.line(3, 3, 13, 13, rgba(200, 60, 60), 0.6)
    g.line(13, 3, 3, 13, rgba(200, 60, 60), 0.6)


@wglyph('icicle')
def _(g):
    for x, y0, L in [(4, 1, 9), (8.4, 2, 12), (12.6, 1, 8)]:
        g.poly([(x - 1.6, y0), (x + 1.6, y0), (x, y0 + L)], ICE)
        g.line(x - 0.4, y0 + 1, x - 0.2, y0 + L - 3, WHITE, 0.6)


@wglyph('geomsul')
def _(g):
    g.ring(8, 9, 7.4, 1.6, rgba(220, 240, 255), 190, 350)
    blade(g, 4, 14, 12.6, 3.4)


@wglyph('plum')
def _(g):
    blade(g, 3, 14, 13, 3)
    for x, y in [(11.6, 11), (4, 4.6)]:
        for i in range(5):
            a = math.radians(-90 + i * 72)
            g.ellipse(x + math.cos(a) * 1.6, y + math.sin(a) * 1.6, 1.3, 1.3, PINK, shade=False, hl=False)
        g.put(x, y, FLAME)


@wglyph('taiji')
def _(g):
    ICONS['taiji'][1](g)
    g.line(3, 13, 13, 3, STEEL, 1.4)
    g.line(3.4, 12.6, 5, 11, GOLD, 1.2)


@wglyph('yangui')
def _(g):
    g.ring(8, 8, 6.6, 0.8, rgba(150, 190, 255))
    blade(g, 2.6, 8, 13.4, 3, guard=WHITE)
    blade(g, 13.4, 8, 2.6, 13, guard=rgba(40, 34, 44))


@wglyph('geumgang')
def _(g):
    g.ellipse(8, 9, 5.6, 5.6, GOLD, ymax=10)
    g.rect(2.4, 9, 13.6, 12.6, GOLD)
    g.rect(1.6, 12, 14.4, 13.6, mul(GOLD, 0.7))
    g.rect(7, 1.4, 9, 3.6, mul(GOLD, 0.7))
    g.rect(5, 6, 11, 7, mix(GOLD, WHITE, 0.4))


@wglyph('skysword')
def _(g):
    blade(g, 8, 1, 8, 15.4, guard=GOLD)
    for x in (3, 13):
        g.line(x, 1, x, 6, rgba(220, 230, 240), 0.6)


@wglyph('jewang')
def _(g):
    blade(g, 2.6, 13.4, 13.4, 2.6, col=rgba(255, 230, 140), guard=GOLD)
    g.poly([(1, 4), (1, 1), (3, 2.4), (4.4, 0.6), (5.8, 2.4), (7.6, 1), (7.6, 4)], GOLD)


@wglyph('hyeolma')
def _(g):
    blade(g, 3, 14, 13.4, 2.6, col=rgba(200, 30, 40), guard=rgba(60, 20, 30))
    g.put(13, 6, rgba(255, 90, 90))
    g.put(11, 9, rgba(255, 90, 90))
    g.ellipse(4.6, 4, 1.4, 1.8, BLOOD, shade=False, hl=False)


@wglyph('emeija')
def _(g):
    for x0, y0, x1, y1 in [(2, 14, 12, 4), (14, 14, 4, 4)]:
        g.line(x0, y0, x1, y1, STEEL, 1.2)
        g.ellipse((x0 + x1) / 2, (y0 + y1) / 2, 1.2, 1.2, GOLD, shade=False, hl=False)
    g.put(12, 4, WHITE)
    g.put(4, 4, WHITE)


@wglyph('seolgeom')
def _(g):
    blade(g, 3, 14, 13.4, 2.6, col=ICE, guard=rgba(150, 200, 250))
    for x, y in [(4, 4), (12, 12), (2, 9)]:
        g.put(x, y, WHITE)


@wglyph('leap')
def _(g):
    cloud(g, 10.4, rgba(230, 236, 250))
    g.poly([(5, 3), (8.4, 3), (8.4, 6.4), (13, 6.6), (13.4, 8.4), (4.6, 8.4)], rgba(70, 60, 90))
    g.rect(4.6, 8, 13.4, 9, rgba(200, 180, 120))
    for y in (3.6, 5.6, 7.4):
        g.line(0.6, y, 3.4, y, rgba(180, 200, 230), 0.6)


REUSE = {
    'shot': 'sword', 'boomerang': 'chakram', 'beam': 'qi', 'fairy': 'crane', 'tornado': 'tornado', 'mine': 'talisman',
    'gwonbeop': 'fist', 'plumrain': 'plumfall', 'yeorae': 'palm', 'tagu': 'staff', 'bottle': 'bottle', 'needles': 'needles',
    'dokmu': 'flask', 'binbaek': 'icepalm', 'hanbing': 'snowcloud', 'cheonmasingong': 'demon', 'geumjeong': 'lotus',
    'formation': 'formation', 'fan': 'feather',
}


# ---------- badge & export ----------

BG_TOP = rgba(64, 48, 66)
BG_BOT = rgba(30, 24, 34)
TRIM = rgba(176, 134, 58)


def badge(glyph_px, evolved=False):
    size = 20
    top, bot, trimc = (BG_TOP, BG_BOT, TRIM) if not evolved else (rgba(140, 34, 34), rgba(60, 14, 20), rgba(255, 210, 90))
    px = [[None] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            corner = (x in (0, size - 1)) and (y in (0, size - 1))
            if corner:
                continue
            edge = x in (0, size - 1) or y in (0, size - 1)
            trim = x in (1, size - 2) or y in (1, size - 2)
            if edge:
                px[y][x] = INK
            elif trim:
                px[y][x] = mix(trimc, WHITE, 0.25) if (x + y) % 9 == 0 else trimc
            else:
                px[y][x] = mix(top, bot, (y - 2) / (size - 5))
    if evolved:
        for cx, cy in ((1, 1), (18, 1), (1, 18), (18, 18)):
            px[cy][cx] = rgba(255, 250, 220)
    for y in range(16):
        for x in range(16):
            if glyph_px[y][x] is not None:
                px[y + 2][x + 2] = glyph_px[y][x]
    return px


def export(name, px):
    h, w = len(px), len(px[0])
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    p = img.load()
    for y in range(h):
        for x in range(w):
            if px[y][x] is not None:
                p[x, y] = px[y][x]
    img.resize((w * EXPORT_SCALE, h * EXPORT_SCALE), Image.NEAREST).save(os.path.join(OUT_DIR, name + '.png'))


def disc_none_patch():
    """Glyph.disc with color None erases; Sprite.ellipse would crash on mul(None)."""
    orig = Glyph.disc

    def disc(self, cx, cy, r, c):
        if c is None:
            for y in range(self.h):
                for x in range(self.w):
                    if math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r:
                        self.px[y][x] = None
            return
        orig(self, cx, cy, r, c)
    Glyph.disc = disc


if __name__ == '__main__':
    disc_none_patch()
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (emoji, fn) in ICONS.items():
        g = Glyph()
        fn(g)
        g.outline()
        export(name, badge(g.px))
    print(len(ICONS), 'icons')
    for wid in list(WGLYPH) + list(REUSE):
        for evolved in (False, True):
            g = Glyph()
            (WGLYPH.get(wid) or ICONS[REUSE[wid]][1])(g)
            g.outline()
            export(('e_' if evolved else 'w_') + wid, badge(g.px, evolved))
    print(len(WGLYPH) + len(REUSE), 'technique icons')
    # emoji -> icon name map for game.js
    with open(os.path.join(OUT_DIR, 'map.txt'), 'w', encoding='utf-8') as f:
        for name, (emoji, _) in ICONS.items():
            f.write(f'{emoji}\t{name}\n')
