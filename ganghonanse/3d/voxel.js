// Pixel sprite → puffy voxel mesh. Every opaque pixel becomes a column whose thickness grows toward the
// middle of the silhouette, so flat pixel art gets a rounded, toy-like body while keeping its exact look.
// Front faces are greedy-merged into rectangles; side faces only appear where the surface steps.
window.Voxel = (() => {
  const cache = {};
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });

  function pixelScale(d, w, h) {
    for (const s of [4, 3, 2]) {
      if (w % s || h % s) continue;
      let bad = 0, n = 0;
      for (let y = 0; y < h; y += s) {
        for (let x = 0; x < w; x += s) {
          const i0 = (y * w + x) * 4;
          n++;
          for (let k = 1; k < s * s; k++) {
            const i = ((y + ((k / s) | 0)) * w + x + (k % s)) * 4;
            if (Math.abs(d[i] - d[i0]) + Math.abs(d[i + 1] - d[i0 + 1]) + Math.abs(d[i + 2] - d[i0 + 2]) > 24 || (d[i + 3] > 127) !== (d[i0 + 3] > 127)) { bad++; break; }
          }
        }
      }
      if (bad / n < 0.03) return s;
    }
    return 1;
  }

  // img: loaded HTMLImageElement; width: world width of the whole image; anchor: fraction of height that sits at y=0
  function build(img, width, anchor = 0.1, depthMul = 1, maxGrid = 999) {
    const w = img.naturalWidth, h = img.naturalHeight;
    ctx.canvas.width = w; ctx.canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, w, h).data;
    let s = pixelScale(d, w, h);
    // half resolution for big grids when asked (phones): keep a cell if most of its block is solid
    const down = w / s > maxGrid ? 2 : 1;
    const gw = Math.floor(w / s / down), gh = Math.floor(h / s / down);
    const col = new Array(gw * gh).fill(null);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        let best = null, solid = 0;
        for (let k = 0; k < down * down; k++) {
          const i = (((y * down + ((k / down) | 0)) * s) * w + (x * down + (k % down)) * s) * 4;
          if (d[i + 3] <= 200) continue;
          solid++;
          const c = [d[i], d[i + 1], d[i + 2]];
          if (!best) best = c;
        }
        if (solid * 2 >= down * down) col[y * gw + x] = best;
      }
    }
    const has = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && col[y * gw + x];
    // chebyshev distance to the outside (capped), turned into half-thickness in voxel units
    const dist = new Array(gw * gh).fill(0);
    const CAP = 3;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        if (!has(x, y)) continue;
        let r = 1;
        outer: for (; r < CAP; r++) {
          for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !has(x + dx, y + dy)) break outer;
        }
        dist[y * gw + x] = r;
      }
    }
    const scaleK = Math.max(1, gw / 24); // bigger grids (finer pixels) get proportionally thicker bodies
    // a slab with one soft step: the rim is a little thinner than the body, so edges read rounded without busy terraces
    const T = (x, y) => (has(x, y) ? (dist[y * gw + x] > 1 ? 1.15 : 0.8) * scaleK * depthMul : 0);
    const vs = width / gw;
    const X = (x) => (x - gw / 2) * vs, Y = (y) => ((gh - y) / gh - anchor) * width * (gh / gw), Z = (z) => z * vs;

    const pos = [], nor = [], cols = [];
    const C = new THREE.Color();
    const pushQuad = (a, b, c, dd, n, rgb, shade) => {
      C.setRGB(rgb[0] / 255 * shade, rgb[1] / 255 * shade, rgb[2] / 255 * shade, THREE.SRGBColorSpace);
      for (const v of [a, b, c, a, c, dd]) { pos.push(v[0], v[1], v[2]); nor.push(n[0], n[1], n[2]); cols.push(C.r, C.g, C.b); }
    };
    const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    // front & back: greedy rectangles of equal color and thickness
    const used = new Uint8Array(gw * gh);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const c = col[y * gw + x];
        if (!c || used[y * gw + x]) continue;
        const t = T(x, y);
        let x1 = x + 1;
        while (x1 < gw && !used[y * gw + x1] && same(col[y * gw + x1], c) && T(x1, y) === t) x1++;
        let y1 = y + 1;
        grow: for (; y1 < gh; y1++) {
          for (let k = x; k < x1; k++) if (used[y1 * gw + k] || !same(col[y1 * gw + k], c) || T(k, y1) !== t) break grow;
        }
        for (let yy = y; yy < y1; yy++) for (let k = x; k < x1; k++) used[yy * gw + k] = 1;
        const l = X(x), r = X(x1), top = Y(y), bot = Y(y1), zf = Z(t);
        pushQuad([l, bot, zf], [r, bot, zf], [r, top, zf], [l, top, zf], [0, 0, 1], c, 1);
        pushQuad([r, bot, -zf], [l, bot, -zf], [l, top, -zf], [r, top, -zf], [0, 0, -1], c, 0.92);
      }
    }
    // sides: where a column sticks out past its neighbour
    const side = (x, y, nx, ny, n, shade) => {
      const t = T(x, y), tn = T(x + nx, y + ny);
      if (tn >= t) return;
      const c = col[y * gw + x];
      let a, b;
      if (nx === -1) { a = [X(x), Y(y + 1)]; b = [X(x), Y(y)]; }
      else if (nx === 1) { a = [X(x + 1), Y(y)]; b = [X(x + 1), Y(y + 1)]; }
      else if (ny === -1) { a = [X(x), Y(y)]; b = [X(x + 1), Y(y)]; }
      else { a = [X(x + 1), Y(y + 1)]; b = [X(x), Y(y + 1)]; }
      const spans = tn > 0 ? [[Z(tn), Z(t)], [Z(-t), Z(-tn)]] : [[Z(-t), Z(t)]];
      for (const [z0, z1] of spans) pushQuad([a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], n, c, shade);
    };
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        if (!has(x, y)) continue;
        side(x, y, -1, 0, [-1, 0, 0], 0.82);
        side(x, y, 1, 0, [1, 0, 0], 0.82);
        side(x, y, 0, -1, [0, 1, 0], 1.0);
        side(x, y, 0, 1, [0, -1, 0], 0.6);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeBoundingSphere();
    g.userData = { grid: [gw, gh], height: width * (gh / gw) };
    return g;
  }

  // async: load once, build once per (key, width)
  const imgs = {};
  function load(src) {
    if (imgs[src]) return imgs[src];
    return (imgs[src] = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }));
  }
  function get(key, src, width, depthMul = 1, maxGrid = 999) {
    const id = key + '|' + width.toFixed(3) + '|' + depthMul + '|' + maxGrid;
    if (!cache[id]) cache[id] = load(src).then((im) => build(im, width, 0.1, depthMul, maxGrid));
    return cache[id];
  }
  return { build, get, load };
})();
