// 3D characters built from CC0 low-poly models by Quaternius (see models/CREDITS.md).
// Each hero/foe "kind" = a base model, a palette (by material name), wuxia gear (hats, hair, blades) and a
// scale. The model's parts plus the gear are merged into ONE skinned mesh with baked vertex colours, so a
// character costs one draw call; beards are cut off the head mesh so the heroes read young.
import * as THREE from 'three';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { MeshoptDecoder } from './lib/meshopt_decoder.module.js';
import * as SkeletonUtils from './lib/SkeletonUtils.js';
import { mergeGeometries } from './lib/BufferGeometryUtils.js';

const BASES = ['adventurer', 'hooded_adventurer', 'monarch', 'wolf', 'bat', 'dragon'];
const src = (n) => (window.__GLB && window.__GLB[n]) || `models/${n}.glb`;
const base = {};

export async function loadBases() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  await Promise.all(BASES.map(async (n) => { base[n] = await loader.loadAsync(src(n)); }));
  // humans share one skeleton; the adventurer's clips drive all three
  for (const n of ['hooded_adventurer', 'monarch']) base[n].clips = base.adventurer.animations;
  for (const n of BASES) base[n].clips ??= base[n].animations;
}

// ---------- gear (built in bone-local space with world-aligned axes, metres) ----------
const C = (h) => new THREE.Color(h);
function part(geo, color, mat4) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  if (mat4) geo.applyMatrix4(mat4);
  const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = C(color);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k);
  return geo;
}
const M4 = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
const GEAR = {
  // blades lie along +z from the fist; the hand bone pitches them down into a lowered stance
  sword: (o) => [part(new THREE.BoxGeometry(0.035, 0.008, 1.0), '#dfe6ee', M4(0, 0, 0.6)), part(new THREE.ConeGeometry(0.018, 0.08, 4), '#dfe6ee', M4(0, 0, 1.14, Math.PI / 2)), part(new THREE.BoxGeometry(0.13, 0.03, 0.03), o.guard || '#c9a040', M4(0, 0, 0.09)), part(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 6), '#2a1c1c', M4(0, 0, 0, Math.PI / 2)), part(new THREE.BoxGeometry(0.02, 0.16, 0.02), o.tassel || '#a8242c', M4(0, -0.08, -0.09))],
  blade: (o) => [part(new THREE.BoxGeometry(0.1, 0.012, 1.05), '#d8dee8', M4(0, 0, 0.66)), part(new THREE.BoxGeometry(0.02, 0.014, 1.0), '#8a94a6', M4(0.05, 0, 0.64)), part(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 6), '#2a1c1c', M4(0, 0, 0.02, Math.PI / 2)), part(new THREE.BoxGeometry(0.16, 0.04, 0.04), o.guard || '#4a3a2a', M4(0, 0, 0.13))],
  staff: () => [part(new THREE.CylinderGeometry(0.022, 0.022, 2.0, 6), '#5a3a24', M4(0, 0, 0.2, Math.PI / 2)), part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), '#c9a040', M4(0, 0, 1.18, Math.PI / 2))],
  club: (o) => [part(new THREE.CylinderGeometry(0.03, 0.09, 0.95, 6), o.club || '#8a6a3a', M4(0, 0, 0.5, Math.PI / 2)), part(new THREE.ConeGeometry(0.03, 0.08, 4), '#c8ccd4', M4(0.08, 0, 0.8, 0, 0, -Math.PI / 2))],
  fan: (o) => [part(new THREE.CylinderGeometry(0.28, 0.28, 0.01, 10, 1, false, -0.9, 1.8), o.fan || '#e8e4da', M4(0, 0.02, 0.05, 0, 0, Math.PI / 2))],
  straw: () => [part(new THREE.ConeGeometry(0.36, 0.17, 14), '#b89a5a', M4(0, 0.2, 0)), part(new THREE.CylinderGeometry(0.36, 0.36, 0.01, 14), '#8a6e3a', M4(0, 0.115, 0))],
  gat: () => [part(new THREE.CylinderGeometry(0.34, 0.34, 0.01, 16), '#141216', M4(0, 0.2, 0)), part(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 10), '#141216', M4(0, 0.27, 0))],
  band: (o) => [part(new THREE.TorusGeometry(0.125, 0.018, 4, 14), o.band || '#a8242c', M4(0, 0.17, 0, Math.PI / 2)), ...[-1, 1].map((s) => part(new THREE.BoxGeometry(0.035, 0.32, 0.01), o.band || '#a8242c', M4(s * 0.03, 0.04, -0.13, 0.5, 0, s * 0.15)))],
  guan: () => [part(new THREE.BoxGeometry(0.08, 0.08, 0.12), '#141216', M4(0, 0.27, -0.02)), part(new THREE.BoxGeometry(0.22, 0.012, 0.012), '#c9a040', M4(0, 0.27, -0.02))],
  crown: () => [part(new THREE.BoxGeometry(0.1, 0.1, 0.13), '#c9a040', M4(0, 0.27, -0.02)), part(new THREE.BoxGeometry(0.26, 0.014, 0.014), '#e0c060', M4(0, 0.29, -0.02)), part(new THREE.BoxGeometry(0.03, 0.03, 0.03), '#a8242c', M4(0, 0.33, 0.03))],
  topknot: (o) => [part(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 6), o.hair || '#141216', M4(0, 0.26, -0.03))],
  horns: (o) => [-1, 1].map((s) => part(new THREE.ConeGeometry(0.045, 0.22, 5), o.horn || '#e6dcc4', M4(s * 0.09, 0.28, 0.02, -0.2, 0, -s * 0.45))),
  horn1: (o) => [part(new THREE.ConeGeometry(0.05, 0.22, 5), o.horn || '#e6dcc4', M4(0, 0.3, 0.04, -0.2))],
  ears: (o) => [-1, 1].map((s) => part(new THREE.ConeGeometry(0.06, 0.15, 4), o.hair || '#e8e4ec', M4(s * 0.1, 0.27, 0, 0, 0, -s * 0.3))),
  qing: () => [part(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 8), '#22242e', M4(0, 0.24, 0)), part(new THREE.BoxGeometry(0.07, 0.18, 0.005), '#e8d070', M4(0, 0.1, 0.13))],
  helmet: () => [part(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), '#3a3540', M4(0, 0.15, 0)), part(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 4), '#a8242c', M4(0, 0.33, 0))],
  long: (o) => [part(new THREE.BoxGeometry(0.24, o.len || 0.55, 0.05), o.hair || '#141216', M4(0, 0.12 - (o.len || 0.55) / 2, -0.11, 0.12)), ...[-1, 1].map((s) => part(new THREE.BoxGeometry(0.03, (o.len || 0.55) * 0.4, 0.03), o.hair || '#141216', M4(s * 0.115, 0.02 - (o.len || 0.55) * 0.2, -0.02)))],
  pony: (o) => [part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), '#c9a040', M4(0, 0.22, -0.1)), part(new THREE.CylinderGeometry(0.045, 0.012, o.len || 0.7, 6), o.hair || '#141216', M4(0, 0.22 - (o.len || 0.7) / 2, -0.15, 0.25))],
  mask: (o) => [part(new THREE.BoxGeometry(0.19, 0.09, 0.03), o.mask || '#1a1418', M4(0, 0.03, 0.115))],
  beard: (o) => [part(new THREE.ConeGeometry(0.07, 0.26, 5), o.beard || '#e8e4dc', M4(0, -0.05, 0.1, Math.PI))],
};
// gear → [bone, gearName, extra rotation]
const SLOT = { sword: 'WristR', blade: 'WristR', staff: 'WristR', club: 'WristR', fan: 'WristR' };
const HAND_PITCH = 1.0;

// cut beard/moustache triangles: hair-material verts below eye level on the face side (head meshes are z-up, -y forward)
function shave(mesh, eyeZ) {
  const g = mesh.geometry, p = g.attributes.position, idx = g.index.array, keep = [];
  for (let t = 0; t < idx.length; t += 3) {
    let low = 0;
    for (let k = 0; k < 3; k++) { const v = idx[t + k]; if (p.getZ(v) < eyeZ && p.getY(v) < 0.05) low++; }
    if (low < 2) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const ng = g.clone(); ng.setIndex(keep); return ng;
}
const EYE_Z = { adventurer: 0.17, monarch: -0.03 };
// bind-pose heights everything is normalised to (metres before the game's CHAR_SCALE)
const TARGET_H = { adventurer: 1.8, hooded_adventurer: 1.72, monarch: 1.85, wolf: 1.0, bat: 0.9, dragon: 1.4 };

const kinds = {};
// spec: { base, col: {material: hex}, hide: [mesh prefixes], gear: [names], hairColor, scale, shave, opacity, emissive, opts }
export function defineKind(id, spec) { kinds[id] = { spec, built: null }; }

function buildKind(id) {
  const k = kinds[id];
  if (k.built) return k.built;
  const sp = k.spec, B = base[sp.base];
  const root = SkeletonUtils.clone(B.scene);
  root.updateMatrixWorld(true);
  const skinned = [];
  root.traverse((c) => { if (c.isSkinnedMesh) skinned.push(c); });
  // parts each carry a skin with only the bones they use: build one skeleton from the union
  // (gltfpack folds each part's quantisation into that part's inverse bind matrices, so every vertex is
  //  first resolved to its true bind-pose position, then all parts share clean inverses = bone world^-1)
  const allBones = [], seen = new Map();
  root.traverse((c) => { if (c.isBone && !seen.has(c.name)) { seen.set(c.name, allBones.length); allBones.push(c); } });
  const skeleton = new THREE.Skeleton(allBones, allBones.map((b) => b.matrixWorld.clone().invert()));
  const geos = [];
  const master = seen;
  for (const m of skinned) {
    if ((sp.hide || []).some((h) => m.name.startsWith(h))) continue;
    const mat = [].concat(m.material)[0];
    let g = m.geometry;
    if (sp.shave && /^Hair/.test(mat.name) && /Head/.test(m.name) && EYE_Z[sp.base] !== undefined) g = shave(m, EYE_Z[sp.base]);
    g = g.index ? g.toNonIndexed() : g.clone();
    // dequantise to float and bake the bind transform so every part shares an identity bind matrix
    const out = new THREE.BufferGeometry();
    for (const a of ['position', 'normal', 'skinIndex', 'skinWeight']) {
      const at = g.attributes[a]; if (!at) continue;
      const arr = new Float32Array(at.count * at.itemSize);
      for (let i = 0; i < at.count; i++) for (let j = 0; j < at.itemSize; j++) arr[i * at.itemSize + j] = at.getComponent(i, j);
      out.setAttribute(a, new THREE.BufferAttribute(arr, at.itemSize));
    }
    if (out.attributes.skinIndex) {
      // resolve to bind-pose world space through this part's own skin, then remap bone indices
      const Mj = m.skeleton.bones.map((b, j) => new THREE.Matrix4().multiplyMatrices(b.matrixWorld, m.skeleton.boneInverses[j]).multiply(m.bindMatrix));
      const P = out.attributes.position.array, N = out.attributes.normal?.array, SI = out.attributes.skinIndex.array, SW = out.attributes.skinWeight.array;
      const v = new THREE.Vector3(), acc = new THREE.Vector3(), nv = new THREE.Vector3(), nm = new THREE.Matrix3();
      for (let i = 0; i < P.length / 3; i++) {
        acc.set(0, 0, 0);
        let wsum = 0, best = 0, bw = -1;
        for (let k = 0; k < 4; k++) {
          const w = SW[i * 4 + k]; if (w <= 0) continue;
          v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).applyMatrix4(Mj[SI[i * 4 + k]]);
          acc.addScaledVector(v, w); wsum += w;
          if (w > bw) { bw = w; best = SI[i * 4 + k]; }
        }
        if (wsum > 0) acc.multiplyScalar(1 / wsum); else acc.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).applyMatrix4(m.bindMatrix);
        if (N) { nm.getNormalMatrix(Mj[best]); nv.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]).applyMatrix3(nm).normalize(); N[i * 3] = nv.x; N[i * 3 + 1] = nv.y; N[i * 3 + 2] = nv.z; }
        P[i * 3] = acc.x; P[i * 3 + 1] = acc.y; P[i * 3 + 2] = acc.z;
      }
      const map = m.skeleton.bones.map((b) => master.get(b.name) ?? 0);
      for (let i = 0; i < SI.length; i++) SI[i] = map[SI[i]];
    } else out.applyMatrix4(m.bindMatrix);
    const n = out.attributes.position.count, col = new Float32Array(n * 3), c = C(sp.col?.[mat.name] || '#' + mat.color.getHexString());
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geos.push(out);
  }
  // gear rides one bone: weight 1 to that bone, placed with world-aligned axes in the bind pose
  const boneIdx = (name) => skeleton.bones.findIndex((b) => b.name === name);
  for (const gname of sp.gear || []) {
    const bone = SLOT[gname] || 'Head', bi = boneIdx(bone);
    if (bi < 0) continue;
    const bw = skeleton.bones[bi].matrixWorld, wp = new THREE.Vector3().setFromMatrixPosition(bw);
    const rot = bone === 'WristR' ? M4(0, -0.02, 0.02, HAND_PITCH) : M4();
    const S = 1 / (root.scale.x || 1);
    for (const g of GEAR[gname]({ hair: sp.hairColor, ...(sp.opts || {}) })) {
      g.applyMatrix4(rot);
      g.applyMatrix4(new THREE.Matrix4().makeScale(S, S, S));
      g.applyMatrix4(new THREE.Matrix4().makeTranslation(wp.x, wp.y, wp.z));
      const n = g.attributes.position.count;
      g.setAttribute('skinIndex', new THREE.BufferAttribute(new Float32Array(n * 4).map((_, i) => (i % 4 === 0 ? bi : 0)), 4));
      g.setAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(n * 4).map((_, i) => (i % 4 === 0 ? 1 : 0)), 4));
      geos.push(g);
    }
  }
  for (const g of geos) for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'skinIndex', 'skinWeight', 'color'].includes(a)) g.deleteAttribute(a);
  const merged = mergeGeometries(geos, false);
  merged.computeBoundingSphere();
  // the template: one skinned mesh under the cloned armature; instances clone this
  for (const m of skinned) m.removeFromParent();
  const mesh = new THREE.SkinnedMesh(merged, null);
  mesh.name = 'body';
  root.add(mesh);
  mesh.bind(skeleton, new THREE.Matrix4());
  mesh.frustumCulled = false;
  const box = new THREE.Box3().setFromBufferAttribute(merged.attributes.position);
  const native = box.max.y - box.min.y, norm = (TARGET_H[sp.base] || 1.8) / native;
  root.scale.multiplyScalar(norm);
  k.built = { root, height: native * norm, clips: B.clips };
  return k.built;
}

const findClip = (clips, names) => { for (const n of names) { const c = clips.find((a) => a.name === n || a.name.endsWith('|' + n)); if (c) return c; } return null; };
const ANIMS = {
  run: ['Run', 'Gallop', 'Bat_Flying', 'Fast_Flying'], idle: ['Idle_Sword', 'Idle', 'Bat_Flying', 'Flying_Idle'],
  slash: ['Sword_Slash', 'Attack', 'Bat_Attack', 'Headbutt'], punch: ['Punch_Right', 'Attack', 'Bat_Attack2', 'Punch'],
  hit: ['HitRecieve', 'Idle_HitReact_Left', 'Bat_Hit', 'HitReact'], die: ['Death', 'Bat_Death'], roll: ['Roll', 'Gallop_Jump'],
};

// one live character
export function spawnChar(id, scale = 1) {
  const t = buildKind(id), sp = kinds[id].spec;
  const root = SkeletonUtils.clone(t.root);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, transparent: !!sp.opacity, opacity: sp.opacity || 1 });
  if (sp.emissive) mat.emissive.set(sp.emissive);
  let body; root.traverse((c) => { if (c.name === 'body') body = c; });
  body.material = mat; body.castShadow = true;
  const s = (sp.scale || 1) * scale;
  root.scale.multiplyScalar(s);
  const holder = new THREE.Group(); holder.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const actions = {};
  for (const [k, names] of Object.entries(ANIMS)) { const c = findClip(t.clips, names); if (c) actions[k] = mixer.clipAction(c); }
  for (const k of ['slash', 'punch', 'hit', 'die', 'roll']) if (actions[k]) { actions[k].setLoop(THREE.LoopOnce); actions[k].clampWhenFinished = true; }
  let cur = null, oneShot = 0;
  const baseEmissive = mat.emissive.clone();
  const ch = {
    obj: holder, mat, height: t.height * s, mixer, yaw: 0,
    play(name, fade = 0.15, speed = 1) {
      const a = actions[name] || actions.idle; if (!a) return;
      if (cur === a && name !== 'slash' && name !== 'punch' && name !== 'hit') { a.timeScale = speed; return; }
      a.reset(); a.timeScale = speed; a.enabled = true; a.setEffectiveWeight(1); a.play();
      if (cur && cur !== a) cur.crossFadeTo(a, fade, false);
      cur = a;
      oneShot = ['slash', 'punch', 'hit', 'roll'].includes(name) ? a.getClip().duration / speed : 0;
    },
    // returns true while a one-shot (attack/hit/roll) is still playing
    busy() { return oneShot > 0; },
    update(dt) { if (oneShot > 0) oneShot -= dt; mixer.update(dt); },
    flash(on) { mat.emissive.copy(on ? new THREE.Color(0xffffff) : baseEmissive); mat.emissiveIntensity = on ? 0.9 : 1; },
    tint(color) { mat.color.set(color || 0xffffff); },
    dispose() { holder.removeFromParent(); mat.dispose(); mixer.stopAllAction(); },
  };
  ch.play('idle', 0);
  return ch;
}
export function kindHeight(id) { return buildKind(id).height * (kinds[id].spec.scale || 1); }

// ---------- crowds: many foes of one kind share a few animated "puppet" skeletons ----------
// Each foe is a SkinnedMesh in 'detached' bind mode bound to a puppet's skeleton that sits at the origin, so
// the mesh's own transform places it in the world. Puppets run at staggered phases; per frame the cost is a
// handful of mixers per kind instead of one per foe, and the skinning matrices upload once per puppet.
const crowds = {};
const RUN_PHASES = 2;
function crowdOf(id) {
  if (crowds[id]) return crowds[id];
  const t = buildKind(id), sp = kinds[id].spec;
  let geo = null; t.root.traverse((c) => { if (c.name === 'body') geo = c.geometry; });
  const base = { vertexColors: true, flatShading: true, transparent: !!sp.opacity, opacity: sp.opacity || 1 };
  const mats = {
    normal: new THREE.MeshLambertMaterial({ ...base, emissive: sp.emissive || 0x000000 }),
    flash: new THREE.MeshLambertMaterial({ ...base, emissive: 0xffffff, emissiveIntensity: 0.85 }),
    elite: new THREE.MeshLambertMaterial({ ...base, color: 0xffd890, emissive: 0x3a2400 }),
    wind: new THREE.MeshLambertMaterial({ ...base, emissive: 0x6a0c0c }),
  };
  const puppets = {};
  const mk = (state, names, phase, speed = 1) => {
    const root = SkeletonUtils.clone(t.root);
    let skel = null; root.traverse((c) => { if (c.isSkinnedMesh) { skel = c.skeleton; c.visible = false; } });
    const mixer = new THREE.AnimationMixer(root);
    const clip = findClip(t.clips, names);
    if (clip) { const a = mixer.clipAction(clip); a.play(); a.time = clip.duration * phase; a.timeScale = speed; }
    root.updateMatrixWorld(true);
    return { root, skel, mixer };
  };
  for (let i = 0; i < RUN_PHASES; i++) (puppets.run ??= []).push(mk('run', ANIMS.run, i / RUN_PHASES));
  puppets.idle = [mk('idle', ANIMS.idle, 0)];
  puppets.slash = [mk('slash', ANIMS.slash, 0, 1.2)];
  const h = t.height;
  const sphere = new THREE.Sphere(new THREE.Vector3(0, h * 0.5, 0), h * 0.75);
  return (crowds[id] = { geo, mats, puppets, height: h, sphere, scale: kinds[id].spec.scale || 1 });
}
export function updateCrowds(dt) {
  for (const c of Object.values(crowds)) for (const list of Object.values(c.puppets)) for (const p of list) { p.mixer.update(dt); p.root.updateMatrixWorld(true); }
}
export function spawnCrowdChar(id, scale = 1) {
  const c = crowdOf(id);
  const mesh = new THREE.SkinnedMesh(c.geo, c.mats.normal);
  mesh.bindMode = 'detached';
  const s = c.scale * scale;
  mesh.scale.setScalar(s);
  mesh.boundingSphere = c.sphere.clone();
  mesh.frustumCulled = true;
  mesh.castShadow = true;
  const holder = new THREE.Group(); holder.add(mesh);
  const pick = (state) => { const list = c.puppets[state] || c.puppets.idle; return list[(Math.random() * list.length) | 0]; };
  let cur = null, look = 'normal', oneShot = 0;
  const bindTo = (state) => { const p = pick(state); if (cur === p) return; cur = p; mesh.bind(p.skel, new THREE.Matrix4()); };
  bindTo('run');
  const ch = {
    obj: holder, mesh, height: c.height * s, crowd: true,
    mat: { emissive: { set: () => {} }, color: { set: () => {} } }, // compatibility no-ops
    play(name) {
      if (name === 'run' || name === 'idle') { if (oneShot <= 0) bindTo(name); return; }
      if (name === 'die') { oneShot = 99; bindTo('idle'); return; }
      if (name === 'hit') return;
      bindTo(name === 'punch' ? 'punch' : 'slash'); oneShot = 0.55;
    },
    busy() { return oneShot > 0; },
    update(dt) { if (oneShot > 0 && oneShot < 50) { oneShot -= dt; if (oneShot <= 0) bindTo('run'); } },
    setLook(k) { if (k !== look) { look = k; mesh.material = c.mats[k] || c.mats.normal; } },
    flash(on) { ch.setLook(on ? 'flash' : ch.base || 'normal'); },
    tint(color) { if (color) { ch.base = 'elite'; ch.setLook('elite'); } },
    dispose() { holder.removeFromParent(); },
  };
  return ch;
}
