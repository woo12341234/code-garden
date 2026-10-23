"""Chunky heroes in the bold "survivors-like" style (replaces gen_heroes2 output).

24x24 cells, no fine grid: big head, short stout body, bold black outline, 3-tone flat colours
and an oversized signature hat/hair/weapon so every hero reads instantly at a glance.
Run after gen_heroes.py / gen_heroes2.py (same output names). Requires Pillow.
"""
from gen_sprites import Sprite, rgba, mul, mix, WHITE, INK, RED, GOLD, STEEL
from gen_heroes import H

SKIN = rgba(250, 210, 170)
PALE = rgba(240, 232, 226)
TAN = rgba(214, 156, 110)
HAIR = rgba(40, 32, 44)
BOOT = rgba(48, 38, 44)
WOOD = rgba(120, 80, 50)


class C(H):
    def __init__(self):
        super().__init__(24, k=1)
        self.raw = True  # export as crisp low-res pixels (no Scale2x)

    def outline(self):
        # bold, uniform ink outline
        out = [row[:] for row in self.px]
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is not None:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and self.px[ny][nx] is not None:
                        out[y][x] = INK
                        break
        self.px = out


def body(s, o, skin, pose, wide=0):
    tr = o.get('trousers', mul(o['robe'], 0.55))
    s.rect(8.6 - wide, 19, 11.2, 22, tr)
    s.rect(12.8, 19, 15.4 + wide, 22, tr)
    s.rect(8.2 - wide, 21.6, 11.4, 23.4, BOOT)
    s.rect(12.6, 21.6, 15.8 + wide, 23.4, BOOT)
    if o.get('cape'):
        c, lin = o['cape']
        s.poly([(7.4, 11), (16.6, 11), (18.2, 21.6), (5.2, 21.8)], lin)
        s.poly([(7.4, 11), (16.6, 11), (17, 20.4), (6, 20.6)], c)
    s.poly([(7.4 - wide * 0.5, 11.2), (16.6 + wide * 0.5, 11.2), (17.4 + wide, 20.6), (6.6 - wide, 20.6)], o['robe'])
    s.poly([(10.4, 11.2), (13.6, 11.2), (12, 14.2)], o['inner'])
    s.poly([(11.4, 14), (12.6, 14), (13, 20.6), (11, 20.6)], o['inner'])
    s.rect(7 - wide * 0.6, 15.6, 17 + wide * 0.6, 17, o['sash'])
    sl = o.get('sleeve', o['robe'])
    s.poly([(7.6, 11.6), (5.6, 12.4), (4.6, 16.6), (7, 16.8)], sl)
    s.blob(5.6, 17.2, 1.2, 1.1, skin)
    if pose == 'raised':
        s.poly([(16.2, 11.8), (18, 11.2), (20.4, 7.8), (18.8, 7)], sl)
        s.blob(19.8, 7.2, 1.2, 1.1, skin)
        return (19.8, 7.2)
    if pose == 'forward':
        s.poly([(16.2, 11.8), (17.6, 11.8), (20.6, 13.2), (20, 15)], sl)
        s.blob(20.8, 14.2, 1.2, 1.1, skin)
        return (20.8, 14.2)
    s.poly([(16.4, 11.6), (18.4, 12.4), (19.2, 16.6), (17, 16.8)], sl)
    s.blob(18.4, 17.2, 1.2, 1.1, skin)
    return (18.4, 17.2)


def head(s, skin):
    s.blob(12, 7, 4.7, 4.4, skin)


def eyes(s, kind, col):
    if kind == 'glow':
        for x in (9, 10, 13, 14):
            s.mark(x, 8, col)
        return
    if kind == 'closed':
        for x in (9, 10, 13, 14):
            s.mark(x, 8, INK)
        return
    for x in (10, 13):
        s.mark(x, 7, INK)
        s.mark(x, 8, col if kind == 'cute' else INK)
    if kind == 'angry':
        s.mark(9, 6, INK)
        s.mark(14, 6, INK)
    if kind == 'cute':
        s.mark(9, 7, INK)
        s.mark(14, 7, INK)
        s.mark(9, 9, rgba(255, 150, 160))
        s.mark(14, 9, rgba(255, 150, 160))


def back_hair(s, st, c):
    """Hair that hangs behind the body (drawn first)."""
    if st in ('long', 'verylong'):
        L = 21 if st == 'verylong' else 16
        s.poly([(7.2, 5), (16.8, 5), (17.8, L - 3), (15, L), (9, L), (5.8, L - 2)], c)
    if st == 'ponytail':
        s.poly([(13, 2), (9, 1.6), (4.4, 3.6), (2, 7.4), (5, 6.4), (3.4, 10), (8, 5.6)], c)


def hair(s, st, c):
    if st in ('bald', 'hood'):
        return
    s.blob(12, 4.4, 5.0, 3.3, c, ymax=6.2)
    s.rect(7, 4.6, 8.4, 9.6, c)
    s.rect(15.6, 4.6, 17, 9.6, c)
    s.poly([(7.6, 4.2), (14.4, 3.8), (10.4, 6.6), (8.4, 6.8)], c)
    s.poly([(13.6, 4), (16.6, 4.6), (15.6, 6.6)], c)
    if st == 'wild':
        for (x0, y0, x1, y1) in ((8, 3, 5.4, 0.6), (11, 1.6, 10, -0.6), (13.6, 1.6, 15.6, -0.4), (16, 3, 18.8, 1.8)):
            s.poly([(x0 - 1.4, y0 + 1.2), (x0 + 1.4, y0 + 0.8), (x1, y1)], c)
    if st == 'topknot':
        s.blob(12, 0.9, 1.6, 1.3, c)
    if st == 'bun':
        s.blob(12, 0.8, 2.2, 1.6, c)
    if st == 'twinbuns':
        s.blob(7.4, 1.8, 1.9, 1.7, c)
        s.blob(16.6, 1.8, 1.9, 1.7, c)


def hat(s, kind, c):
    if kind == 'headband':
        s.rect(7, 4.2, 17, 5.2, c)
        s.poly([(7.2, 4.4), (3.6, 5.6), (0.6, 4.4), (2.6, 6.6), (0.4, 8.6), (4.4, 7.2), (7.2, 5.6)], c)
    elif kind == 'gat':
        s.blob(12, 3.4, 9.4, 1.4, c)
        s.rect(8.6, -0.6, 15.4, 3.4, c)
        s.rect(8.6, 2.2, 15.4, 2.9, mix(c, WHITE, 0.3))
    elif kind == 'guan':
        s.rect(10.4, -0.4, 13.6, 2.4, c)
        s.mark(12, 0, rgba(130, 230, 180))
    elif kind == 'foxears':
        s.poly([(7.4, 4), (6.6, -1.6), (10.4, 2.4)], c)
        s.poly([(16.6, 4), (17.4, -1.6), (13.6, 2.4)], c)
        s.poly([(7.8, 2.6), (7.6, 0.2), (9.2, 2.2)], rgba(255, 170, 180))
        s.poly([(16.2, 2.6), (16.4, 0.2), (14.8, 2.2)], rgba(255, 170, 180))
    elif kind == 'horns':
        s.poly([(8, 3), (3.6, -2), (9.6, 1.4)], c)
        s.poly([(16, 3), (20.4, -2), (14.4, 1.4)], c)
    elif kind == 'hood':
        s.blob(12, 6, 5.6, 5.6, c, ymax=7.4)
        s.rect(6.4, 5, 8.4, 12, c)
        s.rect(15.6, 5, 17.6, 12, c)
        s.rect(8.4, 9, 15.6, 11.2, mul(c, 0.7))  # face cloth
    elif kind == 'strawhat':
        s.poly([(1.6, 5), (22.4, 5), (12, -1.4)], c)
        s.line(2.6, 4.8, 21.4, 4.8, mul(c, 0.7), 1)
    elif kind == 'scholarcap':
        s.rect(8.6, 0, 15.4, 3.8, c)
        s.poly([(15.4, 1), (19.2, 0), (19.2, 2)], c)
        s.poly([(8.6, 1), (4.8, 0), (4.8, 2)], c)
    elif kind == 'crown':
        s.poly([(8.4, 3.2), (15.6, 3.2), (16.4, -1), (14.2, 1.2), (12, -1.6), (9.8, 1.2), (7.6, -1)], c)
        s.mark(12, 1, RED)
    elif kind == 'pin':
        s.line(7.6, 1.8, 16.6, 0.4, c, 1)
        s.mark(17, 0, rgba(255, 140, 190))
    elif kind == 'brow_talisman':
        s.rect(11, 2.6, 13, 6.4, rgba(240, 214, 100))
        s.mark(12, 4, RED)


def weapon(s, kind, hand, c=None):
    hx, hy = hand
    if kind in ('sword', 'sword_up', 'greatsword', 'dao'):
        tip = {'sword': (hx + 5.6, hy + 6.2), 'sword_up': (hx + 2, hy - 8.6), 'greatsword': (hx + 2.4, hy - 10.6), 'dao': (hx + 6, hy + 6)}[kind]
        w = 2.4 if kind in ('greatsword', 'dao') else 1.5
        s.line(hx, hy, tip[0], tip[1], c or rgba(220, 226, 236), w)
        dx, dy = tip[0] - hx, tip[1] - hy
        L = (dx * dx + dy * dy) ** 0.5
        ux, uy = dx / L, dy / L
        s.line(hx - uy * 1.8, hy + ux * 1.8, hx + uy * 1.8, hy - ux * 1.8, GOLD, 1.2)
        s.line(hx - ux * 2, hy - uy * 2, hx, hy, WOOD, 1.2)
        s.mark(int(tip[0]), int(tip[1]), WHITE)
    elif kind == 'twin':
        weapon(s, 'sword', hand, c)
        s.line(5.6, 17.2, 1.4, 22.4, rgba(220, 226, 236), 1.4)
    elif kind == 'staff':
        s.line(hx - 0.6, hy + 9, hx + 1.4, hy - 9, c or WOOD, 1.4)
    elif kind == 'bamboo':
        s.line(hx - 1, hy + 9, hx + 2, hy - 9, rgba(110, 180, 80), 1.6)
        for k in range(3):
            s.mark(int(hx + 0.4 + k * 0.4), int(hy - 5 + k * 5), rgba(60, 120, 50))
    elif kind == 'talismans':
        for i in range(3):
            x, y = hx + 1 + i * 1.6, hy - 2 - (i == 1)
            s.rect(x - 0.6, y - 1.8, x + 0.6, y + 1.4, rgba(250, 220, 100))
            s.mark(int(x), int(y), RED)
    elif kind == 'orb':
        s.blob(hx + 1, hy - 1.4, 1.9, 1.9, c)
        s.mark(int(hx), int(hy - 2), WHITE)
    elif kind == 'flame':
        s.poly([(hx - 1, hy), (hx + 3, hy), (hx + 2, hy - 4.6), (hx + 1, hy - 2.4), (hx, hy - 5)], rgba(255, 120, 40))
        s.poly([(hx, hy - 0.4), (hx + 2, hy - 0.4), (hx + 1, hy - 2.6)], rgba(255, 230, 100))
    elif kind == 'fan':
        s.poly([(hx, hy), (hx + 5, hy - 4), (hx + 5.6, hy + 2.4)], rgba(245, 245, 235))
    elif kind == 'bell':
        s.line(hx, hy + 1, hx + 1, hy - 6, GOLD, 1)
        s.blob(hx + 1, hy - 6.6, 1.3, 1.3, GOLD)
        s.line(hx + 1, hy - 5, hx + 3.6, hy - 1, RED, 1)
        s.line(hx + 1, hy - 5, hx + 2.4, hy, rgba(80, 160, 255), 1)
    elif kind == 'gourd':
        s.blob(hx + 0.6, hy - 1.6, 1.6, 1.6, rgba(206, 156, 70))
        s.blob(hx + 0.6, hy - 4, 1.1, 1.1, rgba(206, 156, 70))
        s.mark(int(hx + 0.6), int(hy - 2.8), RED)
    elif kind == 'chakram':
        s.blob(hx + 2, hy - 1, 2.6, 2.6, rgba(210, 214, 226))
        s.erase_disc(hx + 2, hy - 1, 1.3)
    elif kind == 'needles':
        for k in range(3):
            s.line(hx + 0.4, hy, hx + 4.4, hy - 3 + k * 1.6, rgba(230, 234, 240), 1)
    elif kind == 'piercer':
        s.line(hx, hy, hx + 4.6, hy - 4, rgba(220, 226, 236), 1)
        s.line(5.6, 17.2, 1.6, 21, rgba(220, 226, 236), 1)
    elif kind == 'vial':
        s.blob(hx + 0.8, hy - 1.4, 1.3, 1.6, rgba(120, 230, 120))
        s.mark(int(hx + 0.8), int(hy - 3.4), WHITE)
    elif kind == 'frost':
        s.poly([(hx, hy), (hx + 1.8, hy - 6), (hx + 3, hy - 0.6)], rgba(190, 236, 255))
    elif kind == 'club':
        s.line(hx, hy, hx + 5, hy - 9, WOOD, 2.6)
        for k in range(3):
            s.mark(int(hx + 3 + k), int(hy - 5 - k * 1.6), rgba(210, 214, 226))
    elif kind == 'fist':
        s.blob(hx, hy, 1.7, 1.6, rgba(240, 236, 220))


def make(name, sex, hair_st, hair_c, robe, inner, sash, pose, wpn, skin=SKIN, eye_kind=None, eye_c=rgba(60, 40, 40),
         hat_kind=None, hat_c=None, cape=None, wpn_c=None, extra=None, sleeve=None, trousers=None, wide=0):
    s = C()
    o = {'robe': robe, 'inner': inner, 'sash': sash}
    if cape:
        o['cape'] = cape
    if sleeve:
        o['sleeve'] = sleeve
    if trousers:
        o['trousers'] = trousers
    back_hair(s, hair_st, hair_c)
    if extra and 'behind' in extra:
        extra['behind'](s)
    hand = body(s, o, skin, pose, wide)
    head(s, skin)
    ek = eye_kind or ('angry' if sex == 'm' else 'cute')
    eyes(s, ek, eye_c)
    hair(s, hair_st, hair_c)
    if hat_kind:
        hat(s, hat_kind, hat_c)
    if hat_kind == 'hood':
        eyes(s, ek, eye_c)  # eyes peer out from under the hood
    if extra and 'front' in extra:
        extra['front'](s)
    s.shade(0)
    if wpn:
        weapon(s, wpn, hand, wpn_c)
    if extra and 'after' in extra:
        extra['after'](s)
    s.outline()
    s.save(name + '.png')


def fox_tails(s):
    for x, y in ((3, 18), (2, 13), (4.4, 9)):
        s.poly([(8, 18), (x + 2.4, y + 2.4), (x, y), (x + 1, y - 2), (7, 15)], rgba(250, 226, 190))


def beard(s):
    s.poly([(8.6, 9.2), (15.4, 9.2), (14, 15.6), (12, 17.6), (10, 15.6)], rgba(244, 244, 248))


def beads(s):
    for i in range(7):
        s.mark(9 + i, 12 + abs(i - 3) // 2, rgba(130, 70, 40))


def shoulder(s):
    s.poly([(7.6, 11.4), (11.4, 11.4), (11, 15), (7.2, 15)], TAN)


def tiger(s):
    for y in (19.5, 21):
        s.mark(9, int(y), HAIR)
        s.mark(14, int(y), HAIR)


def feathers(s):
    for i, col in enumerate((rgba(255, 120, 40), rgba(255, 200, 60), rgba(230, 60, 40))):
        s.poly([(7, 18 + i), (1, 21 + i), (3.6, 18.4 + i)], col)


def petals(s):
    for x, y in ((22, 21), (21, 23), (23, 19)):
        s.mark(x, y, rgba(255, 160, 200))


def patches(s):
    s.rect(8, 17.6, 9.6, 19.2, rgba(170, 140, 100))
    s.rect(14, 12.6, 15.6, 14.2, rgba(170, 140, 100))


def pelt(s):
    s.blob(12, 4, 5.6, 3.6, rgba(140, 130, 120), ymax=6)
    s.mark(8, 1, rgba(140, 130, 120))
    s.mark(16, 1, rgba(140, 130, 120))


CAST = [
    lambda: make('cheongpung', 'm', 'topknot', HAIR, rgba(36, 110, 118), rgba(236, 228, 210), RED, 'low', 'sword', hat_kind='headband', hat_c=RED),
    lambda: make('unhak', 'm', 'long', HAIR, rgba(232, 230, 220), rgba(40, 40, 46), rgba(40, 40, 46), 'raised', 'talismans', hat_kind='gat', hat_c=rgba(34, 30, 38)),
    lambda: make('yeoubi', 'f', 'verylong', rgba(236, 236, 244), rgba(206, 48, 66), rgba(255, 206, 214), rgba(255, 206, 214), 'forward', 'orb', eye_c=rgba(230, 130, 40), hat_kind='foxears', hat_c=rgba(236, 236, 244), wpn_c=rgba(110, 190, 255), extra={'behind': fox_tails}),
    lambda: make('cheolsan', 'm', 'bald', SKIN, rgba(210, 128, 52), rgba(160, 84, 40), rgba(120, 60, 30), 'raised', 'fist', skin=TAN, sleeve=TAN, extra={'front': lambda s: (shoulder(s), beads(s))}, wide=1),
    lambda: make('dallae', 'f', 'long', HAIR, rgba(210, 40, 46), rgba(248, 244, 236), rgba(60, 80, 170), 'raised', 'bell', sleeve=rgba(248, 244, 236)),
    lambda: make('yawol', 'm', 'hood', HAIR, rgba(46, 44, 76), rgba(86, 80, 120), RED, 'forward', 'chakram', eye_kind='glow', eye_c=rgba(255, 70, 70), hat_kind='hood', hat_c=rgba(40, 38, 66)),
    lambda: make('songhwa', 'f', 'ponytail', rgba(60, 44, 36), rgba(100, 150, 90), rgba(236, 244, 224), rgba(236, 206, 90), 'forward', 'vial', eye_c=rgba(60, 130, 70), hat_kind='pin', hat_c=GOLD),
    lambda: make('muyeong', 'm', 'wild', rgba(236, 236, 242), rgba(112, 114, 126), rgba(62, 62, 72), rgba(170, 40, 50), 'low', 'twin', skin=PALE, eye_kind='glow', eye_c=rgba(220, 50, 60)),
    lambda: make('geumbi', 'f', 'ponytail', rgba(44, 32, 32), rgba(210, 52, 46), rgba(246, 206, 90), GOLD, 'forward', 'talismans', eye_c=rgba(210, 150, 40)),
    lambda: make('seola', 'f', 'verylong', rgba(244, 248, 255), rgba(170, 218, 244), rgba(252, 254, 255), rgba(110, 170, 226), 'forward', 'frost', skin=PALE, eye_c=rgba(90, 170, 236)),
    lambda: make('cheonma', 'm', 'long', HAIR, rgba(44, 34, 48), rgba(200, 26, 40), rgba(200, 26, 40), 'forward', 'orb', skin=PALE, eye_kind='glow', eye_c=rgba(255, 50, 50), cape=(rgba(34, 26, 36), rgba(200, 26, 40)), wpn_c=rgba(180, 20, 40)),
    lambda: make('sansin', 'm', 'long', rgba(244, 244, 248), rgba(248, 242, 224), rgba(222, 190, 110), rgba(206, 164, 70), 'raised', 'staff', eye_kind='closed', extra={'front': beard, 'after': lambda s: weapon(s, 'gourd', (21, 1))}),
    lambda: make('baekmae', 'f', 'bun', HAIR, rgba(44, 36, 46), rgba(246, 242, 238), rgba(244, 110, 160), 'low', 'sword', eye_c=rgba(210, 80, 130), hat_kind='pin', hat_c=rgba(255, 170, 200), extra={'after': petals, 'front': lambda s: [s.mark(x, y, rgba(255, 150, 190)) for x, y in ((9, 18), (15, 13), (14, 19))]}),
    lambda: make('palgeol', 'm', 'wild', rgba(80, 60, 44), rgba(136, 104, 72), rgba(96, 74, 52), rgba(80, 150, 60), 'raised', 'bamboo', skin=TAN, extra={'front': patches}),
    lambda: make('dangyu', 'm', 'hood', HAIR, rgba(38, 88, 62), rgba(150, 224, 120), rgba(150, 224, 120), 'forward', 'needles', eye_kind='glow', eye_c=rgba(130, 240, 120), hat_kind='hood', hat_c=rgba(32, 74, 52)),
    lambda: make('namgung', 'm', 'topknot', HAIR, rgba(42, 74, 160), rgba(240, 228, 190), GOLD, 'raised', 'sword_up', hat_kind='guan', hat_c=rgba(110, 210, 160)),
    lambda: make('maengju', 'm', 'long', HAIR, rgba(248, 244, 232), rgba(224, 184, 80), GOLD, 'raised', 'greatsword', hat_kind='guan', hat_c=GOLD, cape=(rgba(252, 250, 244), rgba(224, 190, 110))),
    lambda: make('aemi', 'f', 'bun', HAIR, rgba(176, 144, 222), rgba(248, 242, 254), rgba(112, 80, 176), 'forward', 'piercer', eye_c=rgba(130, 80, 200), hat_kind='pin', hat_c=rgba(220, 200, 255)),
    lambda: make('gonryun', 'm', 'ponytail', HAIR, rgba(156, 206, 244), rgba(252, 254, 255), rgba(60, 112, 186), 'raised', 'sword_up', wpn_c=rgba(206, 240, 255)),
    lambda: make('jegal', 'f', 'twinbuns', HAIR, rgba(84, 156, 136), rgba(242, 246, 238), rgba(34, 44, 54), 'forward', 'fan', eye_c=rgba(50, 120, 96)),
    lambda: make('dokgo', 'm', 'long', rgba(176, 176, 184), rgba(124, 124, 132), rgba(64, 64, 70), rgba(54, 54, 60), 'low', 'sword', eye_kind='closed', hat_kind='strawhat', hat_c=rgba(206, 176, 112), cape=(rgba(144, 144, 150), rgba(94, 94, 100))),
    lambda: make('hyeolrang', 'm', 'wild', rgba(70, 44, 40), rgba(74, 58, 56), rgba(190, 30, 40), rgba(190, 30, 40), 'low', 'dao', skin=TAN, eye_kind='glow', eye_c=rgba(230, 40, 40), sleeve=TAN, extra={'front': pelt}),
    lambda: make('hyeonmu', 'm', 'hood', HAIR, rgba(100, 66, 146), rgba(42, 32, 62), rgba(206, 176, 84), 'raised', 'bell', skin=PALE, eye_c=rgba(180, 130, 255), hat_kind='hood', hat_c=rgba(84, 52, 126), extra={'front': lambda s: hat(s, 'brow_talisman', None)}),
    lambda: make('jusun', 'm', 'wild', HAIR, rgba(210, 126, 72), SKIN, rgba(124, 72, 40), 'raised', 'gourd', eye_kind='closed', extra={'front': lambda s: (s.mark(9, 9, rgba(240, 110, 100)), s.mark(14, 9, rgba(240, 110, 100)))}),
    lambda: make('hwaryeon', 'f', 'verylong', rgba(236, 74, 42), rgba(210, 52, 36), rgba(255, 214, 96), GOLD, 'forward', 'flame', eye_c=rgba(240, 160, 40), extra={'behind': feathers}),
    lambda: make('dueok', 'm', 'wild', rgba(34, 34, 46), rgba(64, 96, 160), rgba(236, 176, 64), rgba(236, 176, 64), 'raised', 'club', skin=rgba(110, 154, 226), eye_c=rgba(255, 220, 60), hat_kind='horns', hat_c=rgba(244, 240, 226), trousers=rgba(236, 176, 64), extra={'front': lambda s: (hat(s, 'crown', GOLD), tiger(s))}, wide=1),
    lambda: make('nameless', 'm', 'hood', HAIR, rgba(124, 124, 132), rgba(84, 84, 92), rgba(84, 84, 92), 'low', 'sword', eye_kind='glow', eye_c=rgba(240, 240, 250), hat_kind='hood', hat_c=rgba(112, 112, 120), cape=(rgba(112, 112, 120), rgba(80, 80, 88))),
]

if __name__ == '__main__':
    for mk in CAST:
        mk()
