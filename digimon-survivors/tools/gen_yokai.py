"""Generates the yokai sprites (menacing style) into ../assets, overwriting the old cute ones.

Regular yokai are 24x24, bosses 32x32. Run after gen_sprites.py.
Requires Pillow: pip install pillow
"""
import math

from gen_sprites import Sprite, rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL
from gen_heroes import H

BONE = rgba(236, 230, 210)
GLOW_Y = rgba(255, 220, 70)
GLOW_R = rgba(255, 60, 50)


class Y(H):
    def __init__(self, n):
        Sprite.__init__(self, n)
        self.protect = set()

    def finish(self, name, rim=(255, 210, 200, 255)):
        self.shade(0)
        self.rim(rim, 0.35)
        self.outline()
        Sprite.center(self)
        self.save(name)


def fangs(s, x0, x1, y, down=True):
    for x in range(int(x0), int(x1) + 1, 2):
        s.mark(x, y, BONE)
        if down:
            s.mark(x, y + 1, BONE)


def wisp():
    """도깨비불: a fierce blue skull-flame."""
    s = Y(24)
    deep = rgba(40, 90, 210)
    mid = rgba(90, 170, 255)
    s.poly([(5, 15), (19, 15), (17, 6), (15, 9), (13, 1.5), (11, 7), (9, 3.5), (8, 9)], deep)
    s.blob(12, 15.5, 7, 6.6, deep)
    s.poly([(7.4, 15), (16.6, 15), (14.6, 8), (12.8, 10.6), (11, 6), (9.6, 10)], mid)
    s.blob(12, 16, 5, 4.8, mid)
    s.blob(12, 16.6, 3, 2.8, rgba(220, 245, 255))
    for x in (8, 9, 14, 15):
        s.mark(x, 14, INK)
        s.mark(x, 15, INK)
    s.mark(9, 15, rgba(255, 255, 255))
    s.mark(14, 15, rgba(255, 255, 255))
    for x in range(9, 15):
        s.mark(x, 19, INK)
    for x in (9, 11, 13):
        s.mark(x, 18, INK)
    s.finish('wisp.png', rim=(200, 240, 255, 255))


def dokkaebi():
    """꼬마도깨비: red-skinned oni with a horn, fangs and a spiked club."""
    s = Y(24)
    skin = rgba(200, 54, 44)
    s.line(18, 22, 22, 6, rgba(120, 76, 44), 2.6)
    for (x, y) in [(21, 8), (22, 11), (20, 10), (21.6, 6)]:
        s.mark(x, y, BONE)
    s.blob(12, 16, 6.4, 5.6, skin)
    s.rect(7.4, 18, 16.6, 21.6, rgba(230, 150, 50))
    for x in (8.6, 11, 13.4, 15.6):
        s.line(x, 18.4, x + 0.6, 21.4, INK, 0.6)
    s.rect(8, 21.6, 10.6, 23.4, mul(skin, 0.7))
    s.rect(13.4, 21.6, 16, 23.4, mul(skin, 0.7))
    s.blob(12, 9.6, 5.4, 5, skin)
    s.blob(12, 6, 6, 2.6, rgba(34, 28, 30), ymax=7.6)
    for x in (7, 9.5, 14.5, 17):
        s.poly([(x - 1.2, 6.4), (x + 1.2, 6.4), (x, 3)], rgba(34, 28, 30))
    s.poly([(10.8, 4.4), (13.2, 4.4), (12, 0.4)], BONE)
    for x in (8, 9, 10):
        s.mark(x, 9, INK)
    for x in (13, 14, 15):
        s.mark(x, 9, INK)
    s.mark(9, 10, GLOW_Y)
    s.mark(14, 10, GLOW_Y)
    s.rect(9, 12, 15, 13.2, rgba(60, 20, 20))
    s.mark(9, 13, BONE)
    s.mark(14, 13, BONE)
    s.finish('dokkaebi.png')


def crow():
    """까마귀요괴: three-eyed crow demon with jagged wings."""
    s = Y(24)
    black = rgba(40, 36, 52)
    s.poly([(12, 9), (1, 4), (3, 8), (0.4, 9), (3, 11), (1.4, 13.6), (7, 13), (12, 15)], black)
    s.poly([(12, 9), (23, 4), (21, 8), (23.6, 9), (21, 11), (22.6, 13.6), (17, 13), (12, 15)], black)
    s.blob(12, 13, 4, 5, mul(black, 1.3))
    s.poly([(10.4, 17), (13.6, 17), (12, 21.6)], mul(black, 1.2))
    s.blob(12, 9, 3.4, 3, mul(black, 1.3))
    s.poly([(10.6, 10), (13.4, 10), (12, 14)], GOLD)
    for x in (10, 12, 14):
        s.mark(x, 8, GLOW_R)
    s.line(10.4, 21, 9.6, 23.4, GOLD, 0.6)
    s.line(13.6, 21, 14.4, 23.4, GOLD, 0.6)
    s.finish('crow.png', rim=(190, 170, 255, 255))


def meok():
    """먹물요괴: an ink blot with many white eyes and a toothy maw, dripping."""
    s = Y(24)
    ink = rgba(30, 26, 38)
    s.blob(12, 13, 8, 7.4, ink)
    for x, h in [(5, 5), (8, 3.4), (16, 4), (19, 5.4)]:
        s.rect(x - 0.8, 17, x + 0.8, 18 + h, ink)
        s.blob(x, 18 + h, 1.2, 1.2, ink)
    s.blob(6, 6, 2, 2, ink)
    s.blob(18, 5, 1.6, 1.6, ink)
    for (x, y) in [(8, 10), (15, 9), (11, 8), (17, 13), (6, 13)]:
        s.mark(x, y, WHITE)
        s.mark(x + 1, y, WHITE)
        s.mark(x, y + 1, rgba(255, 80, 80))
    s.rect(9, 14, 15.4, 16.6, rgba(110, 20, 30))
    for x in range(9, 16, 2):
        s.mark(x, 14, BONE)
        s.mark(x + 1, 16, BONE)
    s.finish('meok.png', rim=(150, 140, 200, 255))


def jangseung():
    """돌장승: carved stone totem with a furious face and glowing slits."""
    s = Y(24)
    stone = rgba(150, 120, 92)
    s.rect(7, 4, 17, 23.6, stone)
    s.blob(12, 4, 6, 3.4, rgba(36, 30, 32))
    s.rect(6, 3, 18, 4.6, rgba(36, 30, 32))
    for y in (8, 13):
        s.line(7.6, y, 11, y + 1.4, INK, 1)
        s.line(16.4, y, 13, y + 1.4, INK, 1)
    s.mark(9, 9, GLOW_R)
    s.mark(10, 10, GLOW_R)
    s.mark(14, 9, GLOW_R)
    s.mark(13, 10, GLOW_R)
    s.rect(11, 10, 13, 15, mul(stone, 0.8))
    s.rect(8.4, 16, 15.6, 18.6, INK)
    for x in (9, 11, 13, 15):
        s.mark(x, 16, BONE)
        s.mark(x - 1, 18, BONE)
    s.line(9, 20, 12, 22.6, mul(stone, 0.6), 0.6)
    s.line(15, 19, 14, 23, mul(stone, 0.6), 0.6)
    s.rect(7, 21, 9, 23.6, rgba(90, 130, 70))
    s.finish('jangseung.png')


def wongwi():
    """원귀: ghost woman in white, black hair over her face, one red eye, tattered hem."""
    s = Y(24)
    white = rgba(236, 236, 232)
    hair = rgba(24, 20, 28)
    s.poly([(6, 10), (18, 10), (20, 22), (18, 20), (16, 23.4), (14, 20.6), (12, 23.6), (10, 20.6), (8, 23.4), (6, 20), (4, 22)], white)
    s.poly([(6, 12), (3, 15), (2.6, 17.4), (6.4, 15.6)], white)
    s.poly([(18, 12), (21, 15), (21.4, 17.4), (17.6, 15.6)], white)
    s.blob(2.8, 17.6, 1.2, 1, rgba(220, 225, 230))
    s.blob(21.2, 17.6, 1.2, 1, rgba(220, 225, 230))
    s.blob(12, 6.6, 5, 5, hair)
    s.poly([(7, 6), (17, 6), (18, 17), (15, 14), (13.4, 18), (12, 13), (10.6, 18), (9, 14), (6, 17)], hair)
    s.rect(11, 7, 13, 11, rgba(210, 214, 220))
    s.mark(12, 9, GLOW_R)
    s.mark(12, 8, INK)
    s.finish('wongwi.png', rim=(200, 230, 255, 255))


def gangsi():
    """강시: qing hat, talisman on the brow, grey-green skin, arms locked forward with long nails."""
    s = Y(24)
    robe = rgba(36, 44, 86)
    skin = rgba(150, 180, 160)
    s.poly([(7, 11), (17, 11), (18, 23.6), (6, 23.6)], robe)
    s.rect(11.4, 11, 12.6, 23.6, GOLD)
    s.rect(1.4, 12, 8, 14.6, robe)
    s.rect(16, 12, 22.6, 14.6, robe)
    s.rect(0.4, 12.4, 2, 14.2, skin)
    s.rect(22, 12.4, 23.6, 14.2, skin)
    s.mark(0, 13, BONE)
    s.mark(23, 13, BONE)
    s.blob(12, 7.6, 4.2, 4, skin)
    s.rect(7, 3, 17, 5.4, rgba(30, 28, 40))
    s.rect(9, 1, 15, 3, rgba(30, 28, 40))
    s.blob(12, 1.4, 1, 1, RED)
    s.rect(11, 3.6, 13, 9.4, rgba(240, 214, 100))
    s.mark(12, 5, RED)
    s.mark(12, 7, RED)
    s.mark(9, 8, INK)
    s.mark(15, 8, INK)
    s.mark(9, 9, GLOW_Y)
    s.mark(15, 9, GLOW_Y)
    s.finish('gangsi.png', rim=(190, 255, 210, 255))


def eodukssini():
    """어둑시니: a looming shadow with a wide yellow grin and reaching tendrils."""
    s = Y(24)
    shade = rgba(30, 26, 40)
    s.blob(12, 11, 8, 9, shade)
    s.poly([(4, 14), (20, 14), (22, 23.6), (18, 20.6), (15, 23.6), (12, 20.6), (9, 23.6), (6, 20.6), (2, 23.6)], shade)
    s.poly([(4.6, 9), (0.4, 4), (2, 10), (4.6, 13)], shade)
    s.poly([(19.4, 9), (23.6, 4), (22, 10), (19.4, 13)], shade)
    for x in (8, 9, 15, 16):
        s.mark(x, 9, GLOW_Y)
    s.mark(8, 8, GLOW_Y)
    s.mark(16, 8, GLOW_Y)
    for x in range(7, 18):
        y = 14 + (1 if 9 <= x <= 15 else 0)
        s.mark(x, y, GLOW_Y)
    for x in range(8, 17, 2):
        s.mark(x, 13, GLOW_Y)
    s.finish('eodukssini.png', rim=(170, 150, 220, 255))


def bulgasari():
    """불가사리: iron-eating beast, spiked steel plates, molten glow in its belly."""
    s = Y(24)
    iron = rgba(110, 104, 110)
    s.blob(12, 15, 9, 7, iron)
    for x in (5, 8.6, 12, 15.4, 19):
        s.poly([(x - 1.6, 10), (x + 1.6, 10), (x, 4.6)], STEEL)
    s.blob(12, 17, 4.6, 3, rgba(255, 120, 40))
    s.blob(12, 17, 2.4, 1.6, rgba(255, 220, 120))
    s.blob(4.4, 12, 3.6, 3, iron)
    s.mark(3, 11, GLOW_R)
    s.mark(5, 11, GLOW_R)
    s.rect(1.4, 13.4, 6.6, 14.6, INK)
    s.mark(2, 13, BONE)
    s.mark(5, 13, BONE)
    for x in (6, 10, 14, 18):
        s.rect(x - 1, 20.6, x + 1, 23.6, mul(iron, 0.75))
    s.finish('bulgasari.png', rim=(255, 190, 140, 255))


# ---------- bosses (32x32) ----------

def daedokkaebi():
    """대도깨비: blue oni lord, twin horns, wild mane, armour and a golden spiked club."""
    s = Y(32)
    skin = rgba(60, 100, 190)
    s.line(25, 30, 29.6, 6, rgba(200, 160, 60), 3.6)
    for (x, y) in [(29, 8), (30.4, 11), (28, 12), (29.6, 15), (27.6, 17)]:
        s.mark(x, y, BONE)
    s.blob(16, 21, 9, 8, skin)
    s.rect(8, 22, 24, 27, rgba(230, 150, 50))
    for x in (9.6, 12.6, 15.6, 18.6, 21.6):
        s.line(x, 22.4, x + 0.8, 26.6, INK, 0.7)
    s.poly([(8, 15), (24, 15), (22, 21), (10, 21)], rgba(70, 60, 70))
    s.line(9, 18, 23, 18, GOLD, 1)
    s.rect(10, 27, 14, 31.4, mul(skin, 0.7))
    s.rect(18, 27, 22, 31.4, mul(skin, 0.7))
    s.blob(16, 11, 7, 6.4, skin)
    s.blob(16, 7, 9, 4, rgba(30, 26, 30), ymax=9)
    s.poly([(6, 9), (2, 12), (5, 13), (3, 16), (8, 14)], rgba(30, 26, 30))
    s.poly([(26, 9), (30, 12), (27, 13), (29, 16), (24, 14)], rgba(30, 26, 30))
    s.poly([(10, 6), (6, 0.4), (12, 4.6)], BONE)
    s.poly([(22, 6), (26, 0.4), (20, 4.6)], BONE)
    for x in (11, 12, 13, 19, 20, 21):
        s.mark(x, 10, INK)
    s.mark(12, 11, GLOW_Y)
    s.mark(20, 11, GLOW_Y)
    s.rect(12, 14, 20, 15.6, rgba(60, 16, 20))
    s.mark(12, 13, BONE)
    s.mark(19, 13, BONE)
    s.finish('daedokkaebi.png')


def imugi():
    """이무기: coiled serpent-dragon, glowing eyes, fanged jaws, whiskers."""
    s = Y(32)
    scale = rgba(50, 120, 80)
    belly = rgba(220, 200, 120)
    for cy, rx in [(26, 13), (20, 10.6), (15, 8)]:
        s.blob(16, cy, rx, 4.6, scale)
        s.blob(16, cy + 1.6, rx - 3, 1.8, belly)
    for x in range(6, 27, 3):
        s.mark(x, 25, mul(scale, 1.4))
    s.blob(16, 8, 6, 4.6, scale)
    s.poly([(10, 9), (22, 9), (20, 13.4), (12, 13.4)], scale)
    s.rect(12, 11, 20, 13, rgba(120, 20, 30))
    for x in range(12, 20, 2):
        s.mark(x, 11, BONE)
        s.mark(x + 1, 12, BONE)
    s.mark(12, 7, GLOW_Y)
    s.mark(13, 7, GLOW_Y)
    s.mark(19, 7, GLOW_Y)
    s.mark(18, 7, GLOW_Y)
    s.line(10, 10, 3, 6, rgba(230, 210, 140), 0.7)
    s.line(22, 10, 29, 6, rgba(230, 210, 140), 0.7)
    for x in (12, 16, 20):
        s.poly([(x - 1.4, 4.6), (x + 1.4, 4.6), (x, 1.6)], mul(scale, 0.7))
    s.finish('imugi.png', rim=(200, 255, 200, 255))


def heukyo():
    """흑요장군: black-armoured ghost general, horned helm, red plume, glowing eyes, halberd."""
    s = Y(32)
    armor = rgba(48, 44, 58)
    s.line(27, 31, 28, 2, rgba(90, 70, 60), 1.6)
    s.poly([(26, 3), (30.6, 6), (28, 9), (26.6, 7)], STEEL)
    s.poly([(7, 13), (25, 13), (28, 30), (4, 30)], rgba(120, 20, 30))
    s.poly([(9, 14), (23, 14), (24, 29), (8, 29)], armor)
    for y in (17, 20, 23, 26):
        s.line(9, y, 23, y, mul(armor, 1.6), 0.8)
    s.blob(6.6, 15.6, 3.6, 3, mul(armor, 1.3))
    s.blob(25.4, 15.6, 3.6, 3, mul(armor, 1.3))
    s.blob(16, 9, 5.6, 5, rgba(30, 28, 36))
    s.poly([(9.6, 8), (22.4, 8), (21, 4), (11, 4)], armor)
    s.poly([(10, 6), (5, 1), (11, 4)], GOLD)
    s.poly([(22, 6), (27, 1), (21, 4)], GOLD)
    s.poly([(14, 4), (18, 4), (19, 0.4), (16, 2), (13, 0.4)], RED)
    for x in (13, 14, 18, 19):
        s.mark(x, 10, GLOW_R)
    s.rect(12, 12, 20, 13, rgba(80, 76, 90))
    s.finish('heukyo.png', rim=(255, 160, 160, 255))


if __name__ == '__main__':
    for fn in (wisp, dokkaebi, crow, meok, jangseung, wongwi, gangsi, eodukssini, bulgasari, daedokkaebi, imugi, heukyo):
        fn()
