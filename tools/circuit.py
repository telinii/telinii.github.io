#!/usr/bin/env python3
"""
Gerador de circuitos estilo PCB para o fundo das seções.

Trilhas em Manhattan (ortogonais) com os cantos chanfrados em 45 graus,
que é como繪desenhada uma placa de verdade: o designer recua o canto
em diagonal para o cobre não fazer curva fechada.

Cada trilha sai duas vezes no SVG:
  - uma estática e fraca (a placa sem corrente)
  - uma animada por CSS (o pulso)

O pulso é stroke-dashoffset, então nenhuma animação fica no arquivo:
o SVG só descreve os caminhos.

Uso: python3 circuit.py <saida.svg> <seed> [nº de trilhas]
"""

import random
import sys

W, H = 1440, 900
GRID = 40
CHAMFER = 40
MARGIN = 3 * GRID


def cell(v, lo=MARGIN, hi=None):
    hi = W - MARGIN if hi is None else hi
    return max(lo, min(hi, round(v / GRID) * GRID))


def walk(rng):
    """Caminho ortogonal que respeita os limites do canvas."""
    x = cell(rng.uniform(MARGIN, W - MARGIN))
    y = cell(rng.uniform(MARGIN, H - MARGIN))
    pts = [(x, y)]

    for _ in range(rng.randint(4, 8)):
        dx, dy = rng.choice([(1, 0), (-1, 0), (0, 1), (0, -1)])
        steps = rng.randint(2, 6)
        nx, ny = x + dx * steps * GRID, y + dy * steps * GRID
        if not (MARGIN <= nx <= W - MARGIN and MARGIN <= ny <= H - MARGIN):
            continue
        pts.append((nx, ny))
        x, y = nx, ny

    return pts


def chamfer(pts):
    """Insere um ponto diagonal em cada canto de 90 graus."""
    if len(pts) < 3:
        return pts
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        (ax, ay), (bx, by), (cx, cy) = pts[i - 1], pts[i], pts[i + 1]
        # recua 1 célula em cada perna do canto
        sx = CHAMFER if ax > bx else -CHAMFER
        sy = CHAMFER if ay > by else -CHAMFER
        ex = CHAMFER if cx > bx else -CHAMFER
        ey = CHAMFER if cy > by else -CHAMFER
        out.append((bx + sx, by + sy))
        out.append((bx + ex, by + ey))
    out.append(pts[-1])
    # remove pontos consecutivos repetidos (chanfro degenerado)
    clean = [out[0]]
    for p in out[1:]:
        if p != clean[-1]:
            clean.append(p)
    return clean


def to_path(pts):
    return 'M ' + ' L '.join(f'{x} {y}' for x, y in pts)


def build(seed, n):
    rng = random.Random(seed)
    traces, pads, vias = [], [], []
    starts = set()

    guard = 0
    while len(traces) < n and guard < n * 12:
        guard += 1
        pts = walk(rng)
        if len(pts) < 3:
            continue
        pts = chamfer(pts)

        start = pts[0]
        if start in starts:
            continue
        # descarta trilhas quase retas
        if len({p[0] for p in pts}) < 2 and len({p[1] for p in pts}) < 2:
            continue
        starts.add(start)

        traces.append(to_path(pts))
        pads.append(pts[0])
        # Só uma em cada duas juntas. Com todas elas, o total de animações
        # passa de 300 e o frame rate despenca durante a rolagem.
        vias.extend(pts[1:-1][::2])

    return traces, pads, vias


def render(traces, pads, vias):
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">']

    o.append('<g class="pc-trace">')
    o += [f'<path d="{d}"/>' for d in traces]
    o.append('</g>')

    # Duas camadas animadas fazem o brilho: um halo largo e fraco e um
    # núcleo fino e vivo. Mais barato que filtro SVG, que rasteriza por frame.
    o.append('<g class="pc-glow">')
    for i, d in enumerate(traces):
        o.append(f'<path d="{d}" style="--pd:{i * 0.9:.1f}s"/>')
    o.append('</g>')

    o.append('<g class="pc-pulse">')
    for i, d in enumerate(traces):
        o.append(f'<path d="{d}" style="--pd:{i * 0.9:.1f}s"/>')
    o.append('</g>')

    o.append('<g class="pc-pad">')
    o += [f'<rect x="{x-8}" y="{y-8}" width="16" height="16" rx="2"/>' for x, y in pads]
    o.append('</g>')

    o.append('<g class="pc-via">')
    for x, y in vias:
        o.append(f'<circle cx="{x}" cy="{y}" r="3.4"/>')
        o.append(f'<circle class="pc-core" cx="{x}" cy="{y}" r="1.3"/>')
    o.append('</g>')

    o.append('</svg>')
    return '\n'.join(o)


if __name__ == '__main__':
    out = sys.argv[1]
    seed = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 7

    t, p, v = build(seed, n)
    svg = render(t, p, v)
    open(out, 'w', encoding='utf-8').write(svg)
    print(f'{out}: {len(t)} trilhas, {len(p)} pads, {len(v)} vias, {len(svg)} bytes')
