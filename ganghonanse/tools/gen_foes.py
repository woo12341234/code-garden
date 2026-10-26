"""Generates the human faction enemies (산적, 살수, 혈교, 마교 ...) into ../assets.

Same 32x32 body parts as the heroes (gen_heroes.py) so they share the art style,
but with hostile palettes, masks and glowing eyes. Run after gen_heroes.py.
Requires Pillow: pip install pillow
"""
from gen_sprites import rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL
from gen_heroes import (H, SKIN, TAN, PALE, BLACK, HAIR, BOOT, BLOODRED, legs, robe, sash, arms, head,
                        hair_cap, topknot, headband, scarf, cape, gat, sword, staff, eyes_glow)

RUST = rgba(150, 96, 60)
WOOD = rgba(110, 72, 44)


def axe(s, x0, y0, x1, y1, head_c=STEEL):
    staff(s, x0, y0, x1, y1, WOOD, 1.4)
    s.poly([(x1 - 1, y1 - 1), (x1 + 4, y1 - 4), (x1 + 5, y1 + 2), (x1 + 1, y1 + 3)], head_c)
    s.line(x1 + 4.4, y1 - 3, x1 + 4.8, y1 + 1.6, mix(head_c, WHITE, 0.6), 0.6)


def bandit():
    """녹림 산적: scruffy brigand in a hide vest with a woodcutter's axe."""
    s = H()
    legs(s, rgba(90, 76, 60), stance=1.0)
    robe(s, rgba(126, 92, 58), rgba(200, 180, 140), flare=0.8, length=25.8, slit=False)
    s.poly([(11, 14), (21, 14), (20.6, 21.2), (11.4, 21.2)], rgba(96, 74, 52))
    sash(s, rgba(70, 50, 40), tails=False)
    arms(s, TAN, skin=TAN, front_raised=True)
    head(s, skin=TAN, eye=rgba(60, 30, 30))
    hair_cap(s, HAIR, bangs=False)
    headband(s, rgba(170, 60, 40))
    s.rect(13, 11.6, 19, 13, rgba(50, 40, 34))  # stubble beard
    s.shade()
    axe(s, 24, 24, 26.4, 10)
    s.finish('bandit.png')


def archer():
    """산적 궁수: green-cloaked bandit drawing a bow."""
    s = H()
    legs(s, rgba(60, 70, 50), stance=0.6)
    robe(s, rgba(70, 96, 60), rgba(180, 170, 130), flare=0.6, length=25.6)
    sash(s, rgba(120, 80, 50), tails=False)
    arms(s, rgba(60, 84, 50), skin=TAN, front_raised=True)
    head(s, skin=TAN, eye=rgba(60, 30, 30), mouth=False)
    hair_cap(s, HAIR)
    s.rect(12.6, 10.6, 19.4, 13.2, rgba(60, 74, 50))  # face cloth
    s.shade()
    for y in range(6, 24):
        x = 27.4 - 0.05 * (y - 15) ** 2
        s.put(x, y, WOOD)
    s.line(25.2, 6.4, 25.2, 23.6, rgba(230, 230, 220), 0.5)
    s.line(18, 15, 27.4, 15, rgba(200, 180, 140), 0.6)
    s.put(28.4, 15, STEEL)
    s.finish('archer.png')


def thug():
    """흑도 칼잡이: black-garbed gang enforcer, bamboo hat pulled low, short saber."""
    s = H()
    legs(s, rgba(30, 28, 34), stance=1.2)
    robe(s, rgba(40, 38, 46), rgba(120, 30, 40), flare=1.2, length=26.4)
    sash(s, rgba(120, 30, 40))
    arms(s, rgba(36, 34, 42))
    head(s, eye=rgba(220, 200, 80))
    hair_cap(s, HAIR)
    s.blob(16, 5.4, 8.6, 1.6, rgba(150, 120, 70))
    s.poly([(11, 5), (21, 5), (16, 1)], rgba(170, 140, 80))
    s.shade()
    sword(s, 22.4, 22.8, 29.4, 28.6, blade=rgba(200, 200, 210), guard=rgba(80, 70, 60), width=2.2)
    s.finish('thug.png')


def assassin():
    """살수: hooded killer in midnight blue, only red eyes showing, twin daggers."""
    s = H()
    scarf(s, rgba(60, 20, 30))
    legs(s, rgba(26, 26, 40), stance=1.4)
    robe(s, rgba(32, 34, 54), rgba(60, 60, 90), flare=0.6, length=25)
    sash(s, rgba(60, 20, 30), tails=False)
    arms(s, rgba(28, 30, 48), front_raised=True)
    head(s, eye=rgba(255, 60, 60), mouth=False)
    s.blob(16, 7, 5.2, 5.2, rgba(24, 26, 42), ymax=8.6)
    s.rect(11.2, 6, 12.8, 13.6, rgba(24, 26, 42))
    s.rect(19.2, 6, 20.8, 13.6, rgba(24, 26, 42))
    s.rect(12.4, 9.8, 19.6, 13.4, rgba(18, 18, 30))
    eyes_glow(s, rgba(255, 50, 50))
    s.shade()
    sword(s, 25.6, 14.6, 30.4, 8.6, width=1.4, guard=rgba(90, 30, 40))
    sword(s, 9.8, 23, 5, 28.6, width=1.4, guard=rgba(90, 30, 40))
    s.finish('assassin.png')


def cultist():
    """혈교 신도: crimson-robed blood cult zealot with a bone mask and a dripping bowl."""
    s = H()
    legs(s, rgba(70, 20, 26))
    robe(s, rgba(150, 24, 34), rgba(60, 10, 16), trim=GOLD, flare=1.4, length=28.4, slit=False)
    sash(s, rgba(40, 10, 14), tails=False)
    arms(s, rgba(130, 20, 30), wide=True, front_raised=True)
    head(s, skin=PALE, mouth=False)
    s.blob(16, 6.6, 5.6, 5.4, rgba(120, 16, 26), ymax=9)
    s.rect(10.6, 6, 12.6, 15, rgba(120, 16, 26))
    s.rect(19.4, 6, 21.4, 15, rgba(120, 16, 26))
    s.blob(16, 10.6, 3.2, 2.8, rgba(236, 228, 210))
    s.mark(14, 10, INK)
    s.mark(18, 10, INK)
    s.mark(16, 12, rgba(150, 20, 30))
    s.shade()
    s.blob(26.4, 13.6, 2.6, 1.4, rgba(200, 190, 170))
    s.blob(26.4, 13.2, 1.8, 0.7, BLOODRED)
    s.put(27, 16, BLOODRED)
    s.finish('cultist.png')


def brawler():
    """사파 권사: hulking bare-chested outlaw fist fighter with iron bracers."""
    s = H()
    legs(s, rgba(60, 50, 60), stance=1.6)
    s.poly([(10, 14), (22, 14), (21, 21.6), (11, 21.6)], TAN)
    s.line(16, 15, 16, 21, mul(TAN, 0.8), 0.6)
    s.line(12, 17, 20, 17, mul(TAN, 0.85), 0.6)
    s.poly([(10.6, 21), (21.4, 21), (22.6, 26.6), (9.4, 26.6)], rgba(70, 60, 74))
    sash(s, rgba(200, 160, 40), tails=False)
    arms(s, TAN, skin=TAN, wide=True)
    s.rect(7.4, 19.6, 11, 22.6, STEEL)
    s.rect(21.4, 19.6, 25, 22.6, STEEL)
    head(s, skin=TAN, eye=rgba(70, 30, 30))
    topknot(s, HAIR)
    s.blob(16, 6, 4, 2.2, HAIR, ymax=6.4)
    s.line(13, 9.2, 15, 10.4, rgba(150, 70, 60), 0.6)  # scar
    s.shade()
    s.finish('brawler.png')


def poisoner():
    """독문 독인: purple-masked poison sect adept juggling a venom flask."""
    s = H()
    legs(s, rgba(50, 40, 60))
    robe(s, rgba(80, 60, 110), rgba(120, 190, 70), flare=1.0, length=27)
    sash(s, rgba(120, 190, 70))
    arms(s, rgba(70, 50, 96), front_raised=True)
    head(s, skin=PALE, eye=rgba(140, 230, 80))
    hair_cap(s, rgba(60, 50, 80))
    s.rect(12.4, 10.6, 19.6, 13.4, rgba(90, 160, 60))
    eyes_glow(s, rgba(160, 255, 90))
    s.shade()
    s.blob(26.6, 11.8, 2.4, 2.6, rgba(150, 240, 90))
    s.rect(25.8, 8.2, 27.4, 9.6, rgba(200, 200, 210))
    s.put(26, 11, WHITE)
    s.finish('poisoner.png')


def demon_guard():
    """마교 무사: black-lacquered demonic cult warrior, horned helm, great saber."""
    s = H()
    cape(s, rgba(30, 22, 30), BLOODRED)
    legs(s, rgba(30, 26, 34), stance=1.2)
    robe(s, rgba(46, 36, 50), BLOODRED, trim=GOLD, flare=1.2)
    s.rect(11, 14, 21, 19, rgba(70, 60, 76))
    for y in (15.4, 17.4):
        s.line(11.4, y, 20.6, y, GOLD, 0.5)
    sash(s, BLOODRED, tails=False)
    arms(s, rgba(60, 50, 66), front_raised=True)
    head(s, skin=PALE, eye=rgba(255, 60, 60), mouth=False)
    s.blob(16, 6, 5, 3.6, rgba(50, 40, 56), ymax=8)
    s.poly([(11.6, 5), (8.4, 0.6), (13, 3.6)], GOLD)
    s.poly([(20.4, 5), (23.6, 0.6), (19, 3.6)], GOLD)
    s.rect(12.4, 10.8, 19.6, 13.2, rgba(40, 30, 44))
    eyes_glow(s, rgba(255, 50, 50))
    s.shade()
    sword(s, 25.4, 14.4, 30.6, 1.4, blade=rgba(190, 40, 50), guard=GOLD, width=2.6)
    s.finish('demonguard.png')


def chief():
    """두목: a huge faction boss in a fur mantle with a two-handed glaive."""
    s = H()
    cape(s, rgba(120, 90, 60), rgba(80, 56, 40))
    legs(s, rgba(60, 46, 40), stance=2.0)
    robe(s, rgba(140, 40, 34), rgba(230, 200, 120), trim=GOLD, flare=2.0)
    s.blob(16, 14.6, 7.4, 2.4, rgba(200, 180, 150))  # fur collar
    sash(s, GOLD, tails=False)
    arms(s, rgba(120, 34, 30), wide=True, front_raised=True)
    head(s, skin=TAN, eye=rgba(255, 210, 60))
    hair_cap(s, HAIR, bangs=False)
    s.poly([(12.4, 10.6), (19.6, 10.6), (18.6, 14.4), (16, 15.4), (13.4, 14.4)], HAIR)  # beard
    s.rect(13.6, 1.6, 18.4, 4.2, GOLD)
    eyes_glow(s, rgba(255, 210, 60))
    s.shade()
    staff(s, 28, 30, 25.6, 4, WOOD, 1.5)
    s.poly([(25.6, 4), (22.6, 0.4), (29.4, 1.6), (27.6, 6)], STEEL)
    s.line(23.6, 1, 28.6, 2, mix(STEEL, WHITE, 0.6), 0.5)
    s.finish('chief.png')


FOES = [bandit, archer, thug, assassin, cultist, brawler, poisoner, demon_guard, chief]

if __name__ == '__main__':
    for fn in FOES:
        fn()
