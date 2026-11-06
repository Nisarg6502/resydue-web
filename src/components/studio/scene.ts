/**
 * Resydue logo studio: the three.js side.
 *
 * Loaded on demand (dynamic import) only when the studio nears the viewport.
 * Budget decisions:
 *  - No model files: every pack is built procedurally from a lathe or an extruded outline,
 *    so there is nothing to download beyond three itself.
 *  - No shadow maps: a radial-gradient contact shadow does the job for one draw call.
 *  - Render on demand: frames are only drawn while the camera moves, the turntable spins
 *    or a transition runs. Off-screen, the loop stops entirely.
 *  - Pixel ratio is capped (2 desktop, 1.75 touch) and the print texture is redrawn only
 *    when the logo, ink or size changes.
 */
import {
  NeutralToneMapping,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  RepeatWrapping,
  Scene,
  Shape,
  SRGBColorSpace,
  Texture,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type ProductKey = "bowl" | "box" | "cup" | "tray";
export type Paper = "natural" | "white";
export type Ink = "original" | "ink" | "olive" | "terra" | "linen";

export type StudioState = {
  product: ProductKey;
  paper: Paper;
  ink: Ink;
  /** 0.3 – 1: share of the print area the logo may fill */
  scale: number;
  autoRotate: boolean;
  lidOpen: boolean;
  logo: HTMLCanvasElement;
  reducedMotion: boolean;
};

export type Studio = {
  set: (patch: Partial<StudioState>) => void;
  resetView: () => void;
  snapshot: (caption: { font: string; label: string }) => Promise<Blob | null>;
  onInteract: (fn: () => void) => void;
  dispose: () => void;
};

/* Brand palette (globals.css @theme). The scene never introduces a new hue. */
const C = {
  linen: "#f3e9dc",
  ink: "#010101",
  sand: "#e2cba2",
  olive: "#3e3f20",
  gold: "#ce8a39",
  terra: "#a44819",
};

/** Unbleached bagasse reads as a pale grey-beige: linen pulled slightly toward olive. White = linen. */
const PAPER: Record<Paper, Color> = {
  natural: new Color(C.linen).lerp(new Color(C.olive), 0.14),
  white: new Color(C.linen),
};
const INK: Record<Exclude<Ink, "original">, string> = { ink: "#1a1a14", olive: C.olive, terra: C.terra, linen: C.linen };

/* ── Textures ─────────────────────────────────────────────────── */

/** Paper tooth: grey noise plus short fibres. Used as colour multiplier and bump. */
function makeFibre(): CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const img = g.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 238 + (Math.random() - 0.5) * 18;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.lineCap = "round";
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const a = Math.random() * Math.PI;
    const l = 3 + Math.random() * 12;
    const dark = Math.random() < 0.7;
    g.strokeStyle = dark ? `rgba(60,50,30,${0.05 + Math.random() * 0.09})` : `rgba(255,255,255,${0.12 + Math.random() * 0.15})`;
    g.lineWidth = 0.5 + Math.random() * 0.9;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function makeShadowTexture(): CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(62,63,32,0.55)");
  grd.addColorStop(0.45, "rgba(62,63,32,0.28)");
  grd.addColorStop(1, "rgba(62,63,32,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return new CanvasTexture(c);
}

/* ── Geometry helpers ─────────────────────────────────────────── */

/** World-scale UVs so paper tooth is the same size on every pack. */
const UVS = 0.55;

type Ring = { y: number; w: number; d: number; r: number };

function ringLoop(w: number, d: number, r: number, perCorner: number): [number, number][] {
  r = Math.min(r, w / 2 - 0.001, d / 2 - 0.001);
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  const corners: [number, number, number][] = [
    [hw, hd, 0],
    [-hw, hd, Math.PI / 2],
    [-hw, -hd, Math.PI],
    [hw, -hd, (3 * Math.PI) / 2],
  ];
  const pts: [number, number][] = [];
  for (const [cx, cz, a0] of corners) {
    for (let i = 0; i <= perCorner; i++) {
      const a = a0 + (i / perCorner) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  }
  return pts;
}

/**
 * Lofts a stack of rounded rectangles into one surface: the way moulded pulp actually looks
 * (sloped walls, soft radii, flat flanges). Optional caps close the first/last ring.
 */
function loft(rings: Ring[], { capStart = false, capEnd = false, perCorner = 10 } = {}): BufferGeometry {
  const loops = rings.map((g) => ringLoop(g.w, g.d, g.r, perCorner));
  const n = loops[0].length;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let v = 0;
  loops.forEach((loop, i) => {
    if (i > 0) {
      const [ax, az] = loops[i - 1][0];
      const [bx, bz] = loop[0];
      v += Math.hypot(bx - ax, rings[i].y - rings[i - 1].y, bz - az);
    }
    let u = 0;
    for (let j = 0; j <= n; j++) {
      const [x, z] = loop[j % n];
      if (j > 0) {
        const [px, pz] = loop[(j - 1) % n];
        u += Math.hypot(x - px, z - pz);
      }
      pos.push(x, rings[i].y, z);
      uv.push(u * UVS, v * UVS);
    }
  });
  const row = n + 1;
  for (let i = 0; i < loops.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * row + j;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const cap = (ri: number) => {
    const start = pos.length / 3;
    const y = rings[ri].y;
    pos.push(0, y, 0);
    uv.push(0, 0);
    for (const [x, z] of loops[ri]) {
      pos.push(x, y, z);
      uv.push(x * UVS, z * UVS);
    }
    for (let j = 0; j < n; j++) idx.push(start, start + 1 + j, start + 1 + ((j + 1) % n));
  };
  if (capStart) cap(0);
  if (capEnd) cap(rings.length - 1);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A moulded divider ridge. Trapezoid in (s, y): runs from sFrom to sBottom at the floor and
 * sFrom to sTop at its crest (so it meets a sloped wall), extruded t thick and centred.
 */
function ridge(sFrom: number, sBottom: number, sTop: number, h: number, t: number, sFromTop = sFrom): ExtrudeGeometry {
  const s = new Shape();
  s.moveTo(sFrom, 0.03);
  s.lineTo(sBottom, 0.03);
  s.lineTo(sTop, h);
  s.lineTo(sFromTop, h);
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  g.translate(0, 0, -t / 2);
  return g;
}

function lathe(points: [number, number][], segments = 96): LatheGeometry {
  return new LatheGeometry(
    points.map(([x, y]) => new Vector2(x, y)),
    segments,
  );
}

/* ── Print surfaces ───────────────────────────────────────────── */

type Print = {
  mesh: Mesh;
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  /** physical width / height of the print area */
  aspect: number;
};

function makePrint(geo: BufferGeometry, aspect: number, bump: Texture): Print {
  const canvas = document.createElement("canvas");
  const long = 1024;
  canvas.width = aspect >= 1 ? long : Math.round(long * aspect);
  canvas.height = aspect >= 1 ? Math.round(long / aspect) : long;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const mat = new MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.78,
    metalness: 0,
    bumpMap: bump,
    bumpScale: 0.6,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const mesh = new Mesh(geo, mat);
  mesh.renderOrder = 2;
  return { mesh, canvas, texture, aspect };
}

/** Draws the logo into a print canvas: contained, centred, optionally flattened to one ink. */
function drawPrint(p: Print, logo: HTMLCanvasElement, ink: Ink, scale: number) {
  const { canvas } = p;
  const g = canvas.getContext("2d")!;
  g.clearRect(0, 0, canvas.width, canvas.height);
  const maxW = canvas.width * scale;
  const maxH = canvas.height * scale;
  const k = Math.min(maxW / logo.width, maxH / logo.height);
  const w = logo.width * k;
  const h = logo.height * k;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  if (ink === "original") {
    g.globalAlpha = 0.96; // ink sits in the fibre, not on top of it
    g.drawImage(logo, x, y, w, h);
  } else {
    const tmp = document.createElement("canvas");
    tmp.width = Math.max(1, Math.round(w));
    tmp.height = Math.max(1, Math.round(h));
    const tg = tmp.getContext("2d")!;
    tg.drawImage(logo, 0, 0, tmp.width, tmp.height);
    tg.globalCompositeOperation = "source-in";
    tg.fillStyle = INK[ink];
    tg.fillRect(0, 0, tmp.width, tmp.height);
    g.globalAlpha = 0.94;
    g.drawImage(tmp, x, y, w, h);
  }
  g.globalAlpha = 1;
  p.texture.needsUpdate = true;
}

/* ── Products ─────────────────────────────────────────────────── */
/* Shapes follow the product photography in /public/images (clamshell-*.jpg, bowls-stacked-salad.jpg,
   cups-trio.jpg, tray-stack-dark.jpg). Proportions are matched by eye, not from spec drawings:
   swap in measured values (or GLB models) once the dimension sheet is final. */

/** Default camera azimuth. Wrap-around prints turn to face it. */
const AZ = -0.38;

type Pose = { p: Vector3; rx: number };
type Lid = { obj: Object3D; closed: Pose; open: Pose };

type Built = {
  root: Group;
  print: Print;
  /** camera framing, lid closed / open */
  target: Vector3;
  distance: number;
  polar: number; // radians from the top
  openTarget?: Vector3;
  openDistance?: number;
  shadow: number; // contact shadow diameter
  lid?: Lid;
};

type Kit = { fibre: CanvasTexture; dark: MeshStandardMaterial };

function paperMaterial(fibre: CanvasTexture, color: Color, repeat: [number, number] = [1, 1], smooth = false) {
  // Coated paperboard (cups) is smooth; moulded bagasse shows its fibre.
  if (smooth) return new MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, side: DoubleSide });
  const map = fibre.clone();
  map.repeat.set(repeat[0], repeat[1]);
  map.needsUpdate = true;
  // Double-sided: open shells show their inner faces.
  return new MeshStandardMaterial({ color, map, bumpMap: map, bumpScale: 0.5, roughness: 0.9, metalness: 0, side: DoubleSide });
}

/** Side-wall ribs, instanced so each set is one draw call. hw = wall half-width at y0 / y1. */
function ribs(mat: MeshStandardMaterial, y0: number, y1: number, hw0: number, hw1: number, span = 0.82, count = 11) {
  const rib = new CylinderGeometry(0.026, 0.026, 1, 8);
  const im = new InstancedMesh(rib, mat, count * 2);
  const m = new Matrix4();
  const q = new Quaternion();
  const axis = new Vector3(0, 0, 1);
  const len = Math.hypot(y1 - y0, hw1 - hw0);
  let k = 0;
  for (const side of [1, -1]) {
    q.setFromAxisAngle(axis, side * Math.atan2(hw0 - hw1, y1 - y0));
    for (let i = 0; i < count; i++) {
      const z = -span + (2 * span * i) / (count - 1);
      m.compose(new Vector3(side * ((hw0 + hw1) / 2 + 0.004), (y0 + y1) / 2, z), q, new Vector3(1, len, 1));
      im.setMatrixAt(k++, m);
    }
  }
  return im;
}

/** Square three-compartment clamshell: one-piece hinge, sloped walls, side ribs, recessed lid panel, front latches. */
function buildBox(kit: Kit, color: Color): Built {
  const root = new Group();
  const mat = paperMaterial(kit.fibre, color);
  const H = 0.72; // base wall height
  const HALF = 1.44; // half the flange width

  // Base
  root.add(
    new Mesh(
      loft(
        [
          { y: 0, w: 2.2, d: 2.2, r: 0.3 },
          { y: 0.05, w: 2.27, d: 2.27, r: 0.33 },
          { y: H - 0.06, w: 2.5, d: 2.5, r: 0.4 },
          { y: H, w: 2.55, d: 2.55, r: 0.42 },
          { y: H + 0.012, w: 2.84, d: 2.84, r: 0.5 },
          { y: H - 0.03, w: 2.88, d: 2.88, r: 0.52 },
        ],
        { capStart: true },
      ),
      mat,
    ),
  );

  // Compartments: one large at the front, two small at the back (as in clamshell-lid-open.jpg)
  const rh = 0.46;
  const across = new Mesh(ridge(-1.12, 1.12, 1.21, rh, 0.09, -1.21), mat);
  across.position.z = 0.08;
  const back = new Mesh(ridge(0.06, -1.12, -1.21, rh, 0.09), mat);
  back.geometry.rotateY(-Math.PI / 2);
  root.add(across, back);
  root.add(ribs(mat, 0.14, 0.6, 1.15, 1.24));

  // Hinge strip along the back
  const hinge = new Mesh(new CylinderGeometry(0.035, 0.035, 2.2, 12), mat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, H + 0.005, -HALF);
  root.add(hinge);

  // Lid: built in pivot space (pivot = hinge line), centred at z = +HALF
  const pivot = new Group();
  pivot.position.set(0, H + 0.012, -HALF);
  const lid = new Group();
  lid.position.z = HALF;
  lid.add(
    new Mesh(
      loft(
        [
          { y: -0.04, w: 2.88, d: 2.88, r: 0.52 },
          { y: 0, w: 2.84, d: 2.84, r: 0.5 },
          { y: 0.012, w: 2.56, d: 2.56, r: 0.42 },
          { y: 0.07, w: 2.51, d: 2.51, r: 0.4 },
          { y: 0.52, w: 2.32, d: 2.32, r: 0.36 },
          { y: 0.6, w: 2.2, d: 2.2, r: 0.3 },
          { y: 0.62, w: 2.08, d: 2.08, r: 0.26 },
          { y: 0.62, w: 1.74, d: 1.74, r: 0.2 },
          { y: 0.598, w: 1.68, d: 1.68, r: 0.18 },
        ],
        { capEnd: true },
      ),
      mat,
    ),
  );
  lid.add(ribs(mat, 0.1, 0.5, 1.25, 1.17));
  // two front latch tabs
  for (const x of [-0.55, 0.55]) {
    const tab = new Mesh(new BoxGeometry(0.34, 0.13, 0.045), mat);
    tab.position.set(x, -0.075, HALF + 0.005);
    lid.add(tab);
  }
  // Print sits in the recessed panel on top
  const pw = 1.56;
  const geo = new PlaneGeometry(pw, pw);
  geo.rotateX(-Math.PI / 2);
  const print = makePrint(geo, 1, kit.fibre);
  print.mesh.position.y = 0.601;
  lid.add(print.mesh);
  pivot.add(lid);
  root.add(pivot);

  return {
    root,
    print,
    target: new Vector3(0, 0.62, 0),
    distance: 7.4,
    polar: 0.98,
    openTarget: new Vector3(0, 1.05, -0.55),
    openDistance: 8.8,
    shadow: 4.4,
    lid: {
      obj: pivot,
      closed: { p: pivot.position.clone(), rx: 0 },
      open: { p: pivot.position.clone(), rx: -1.9 },
    },
  };
}

/** Round bowl with a rolled rim and a flat snap-on lid (bowls-stacked-salad.jpg). */
function buildBowl(kit: Kit, color: Color): Built {
  const root = new Group();
  const mat = paperMaterial(kit.fibre, color, [7, 2]);
  const r0 = 0.97;
  const r1 = 1.32;
  const y0w = 0.04;
  const H = 0.95;
  root.add(
    new Mesh(
      lathe([
        [0, 0.05],
        [0.86, 0.05],
        [0.9, 0.0],
        [0.95, 0.0],
        [r0, y0w],
        [r1, H],
        [1.355, 0.972],
        [1.378, 1.0],
        [1.37, 1.026],
        [1.34, 1.032],
        [1.312, 1.0],
        [1.3, 0.96],
        [0.965, 0.09],
        [0, 0.09],
      ]),
      mat,
    ),
  );

  const lidGroup = new Group();
  lidGroup.add(
    new Mesh(
      lathe([
        [0, 1.07],
        [0.82, 1.07],
        [0.88, 1.098],
        [1.06, 1.098],
        [1.11, 1.08],
        [1.3, 1.072],
        [1.39, 1.066],
        [1.425, 1.04],
        [1.43, 0.985],
        [1.41, 0.975],
        [1.398, 1.03],
        [1.36, 1.05],
        [0, 1.05],
      ]),
      paperMaterial(kit.fibre, color, [5, 2]),
    ),
  );
  root.add(lidGroup);

  const ya = 0.15;
  const yb = 0.8;
  const rAt = (y: number) => r0 + (r1 - r0) * ((y - y0w) / (H - y0w)) + 0.004;
  const theta = 1.75;
  const geo = new CylinderGeometry(rAt(yb), rAt(ya), yb - ya, 96, 1, true, -theta / 2, theta);
  const print = makePrint(geo, (rAt((ya + yb) / 2) * theta) / (yb - ya), kit.fibre);
  print.mesh.position.y = (ya + yb) / 2;
  print.mesh.rotation.y = AZ;
  root.add(print.mesh);

  return {
    root,
    print,
    target: new Vector3(0, 0.5, 0),
    distance: 6.8,
    polar: 1.1,
    openTarget: new Vector3(0, 0.85, -0.15),
    openDistance: 7.6,
    shadow: 3.4,
    lid: { obj: lidGroup, closed: { p: new Vector3(), rx: 0 }, open: { p: new Vector3(0, 0.7, -0.55), rx: -0.6 } },
  };
}

/** Double-wall hot cup with a stepped base and rolled rim (cups-trio.jpg), plus a sip lid. */
function buildCup(kit: Kit, color: Color): Built {
  const root = new Group();
  const mat = paperMaterial(kit.fibre, color, [6, 3], true);
  const r0 = 0.625;
  const y0w = 0.165;
  const r1 = 0.85;
  const H = 2.0;
  root.add(
    new Mesh(
      lathe([
        [0, 0.07],
        [0.53, 0.07],
        [0.55, 0.0],
        [0.578, 0.0],
        [0.582, 0.14],
        [0.6, 0.152],
        [r0, y0w],
        [r1, H],
        [0.872, 2.018],
        [0.884, 2.045],
        [0.874, 2.072],
        [0.852, 2.076],
        [0.838, 2.058],
        [0.828, H],
        [0.6, 0.22],
        [0, 0.22],
      ]),
      mat,
    ),
  );

  const lidGroup = new Group();
  lidGroup.add(
    new Mesh(
      lathe([
        [0, 2.135],
        [0.46, 2.135],
        [0.52, 2.19],
        [0.66, 2.19],
        [0.72, 2.13],
        [0.86, 2.115],
        [0.905, 2.085],
        [0.912, 2.02],
        [0.892, 1.995],
        [0.876, 2.03],
        [0.86, 2.08],
        [0, 2.08],
      ]),
      paperMaterial(kit.fibre, color, [4, 2], true),
    ),
  );
  const slot = new Mesh(new BoxGeometry(0.2, 0.012, 0.045), kit.dark);
  slot.position.set(Math.sin(AZ) * 0.59, 2.192, Math.cos(AZ) * 0.59);
  slot.rotation.y = AZ;
  lidGroup.add(slot);
  root.add(lidGroup);

  const ya = 0.34;
  const yb = 1.78;
  const rAt = (y: number) => r0 + (r1 - r0) * ((y - y0w) / (H - y0w)) + 0.004;
  const theta = 2.3;
  const geo = new CylinderGeometry(rAt(yb), rAt(ya), yb - ya, 96, 1, true, -theta / 2, theta);
  const print = makePrint(geo, (rAt((ya + yb) / 2) * theta) / (yb - ya), kit.fibre);
  print.mesh.position.y = (ya + yb) / 2;
  print.mesh.rotation.y = AZ;
  root.add(print.mesh);

  return {
    root,
    print,
    target: new Vector3(0, 1.1, 0),
    distance: 6.7,
    polar: 1.28,
    openTarget: new Vector3(0, 1.35, 0),
    openDistance: 7.6,
    shadow: 2.4,
    lid: { obj: lidGroup, closed: { p: new Vector3(), rx: 0 }, open: { p: new Vector3(0, 0.55, -0.35), rx: -0.5 } },
  };
}

/** Rectangular three-compartment tray: one large, two small, sloped walls, wide flange (tray-stack-dark.jpg). */
function buildTray(kit: Kit, color: Color): Built {
  const root = new Group();
  const mat = paperMaterial(kit.fibre, color);
  const H = 0.55;
  root.add(
    new Mesh(
      loft(
        [
          { y: 0, w: 2.62, d: 2.02, r: 0.3 },
          { y: 0.05, w: 2.68, d: 2.08, r: 0.32 },
          { y: H - 0.05, w: 2.92, d: 2.32, r: 0.4 },
          { y: H, w: 2.96, d: 2.36, r: 0.42 },
          { y: H + 0.012, w: 3.2, d: 2.6, r: 0.54 },
          { y: H - 0.03, w: 3.24, d: 2.64, r: 0.56 },
        ],
        { capStart: true },
      ),
      mat,
    ),
  );
  // Long ridge splits the large compartment (right) from the two small ones (left)
  const rh = 0.42;
  const long = new Mesh(ridge(-1.03, 1.03, 1.13, rh, 0.09, -1.13), mat);
  long.geometry.rotateY(Math.PI / 2);
  long.position.x = -0.2;
  const short = new Mesh(ridge(-0.2, -1.33, -1.43, rh, 0.09), mat);
  short.position.z = -0.32;
  root.add(long, short);

  // Print on the front wall, tilted to the wall's slope
  const slope = Math.atan2(0.12, H - 0.1);
  const pw = 1.9;
  const ph = 0.34;
  const print = makePrint(new PlaneGeometry(pw, ph), pw / ph, kit.fibre);
  print.mesh.rotation.x = slope;
  print.mesh.position.set(0, 0.28, 1.04 + 0.12 * ((0.28 - 0.05) / (H - 0.1)) + 0.008);
  root.add(print.mesh);

  return { root, print, target: new Vector3(0, 0.25, 0), distance: 7.8, polar: 1.02, shadow: 4.8 };
}

const BUILDERS: Record<ProductKey, (k: Kit, c: Color) => Built> = {
  bowl: buildBowl,
  box: buildBox,
  cup: buildCup,
  tray: buildTray,
};

/* ── Studio ───────────────────────────────────────────────────── */

const ease = (t: number) => 1 - Math.pow(1 - t, 3);


export function createStudio(canvas: HTMLCanvasElement, initial: StudioState): Studio {
  let state = { ...initial };
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose?.();
  scene.environment = env;
  scene.environmentIntensity = 0.42;

  const hemi = new HemisphereLight(new Color(C.linen), new Color(C.sand), 0.6);
  const key = new DirectionalLight(new Color(C.linen), 2.1);
  key.position.set(-4, 7, 5);
  const rim = new DirectionalLight(new Color(C.sand), 0.9);
  rim.position.set(5, 3, -4);
  scene.add(hemi, key, rim);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false; // wheel stays with the page scroll
  controls.rotateSpeed = 0.75;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.5;
  controls.autoRotateSpeed = 1.6;

  const fibre = makeFibre();
  const dark = new MeshStandardMaterial({ color: C.olive, roughness: 0.9 });
  const kit: Kit = { fibre, dark };

  const shadowTex = makeShadowTexture();
  const shadow = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.012; // just below every floor so it never shows through
  scene.add(shadow);

  const built = new Map<ProductKey, Built>();
  let current: Built | null = null;
  let dirty = true;
  let visible = false;
  let interacting = false;
  let resumeTimer = 0;
  const interactFns: (() => void)[] = [];

  // Transitions
  type Tween = { t: number; dur: number; step: (k: number) => void; done?: () => void };
  const tweens: Tween[] = [];
  const tween = (dur: number, step: (k: number) => void, done?: () => void) => {
    if (state.reducedMotion) {
      step(1);
      done?.();
      dirty = true;
      return;
    }
    tweens.push({ t: 0, dur, step, done });
  };

  const paperMats = (b: Built) => {
    const mats = new Set<MeshStandardMaterial>();
    b.root.traverse((o) => {
      const m = (o as Mesh).material as MeshStandardMaterial | undefined;
      if (m && m !== b.print.mesh.material && m !== dark && m.isMeshStandardMaterial) mats.add(m);
    });
    return mats;
  };

  function get(key: ProductKey) {
    let b = built.get(key);
    if (!b) {
      b = BUILDERS[key](kit, PAPER[state.paper]);
      built.set(key, b);
    }
    return b;
  }

  function aspectDistance(d: number) {
    const a = camera.aspect || 1;
    return d * Math.max(0.95, 1.12 / a);
  }

  function frame(b: Built, animate: boolean) {
    const open = !!b.lid && state.lidOpen;
    const tgt = open && b.openTarget ? b.openTarget : b.target;
    const dist = aspectDistance(open && b.openDistance ? b.openDistance : b.distance);
    const az = AZ;
    const goal = new Vector3(
      tgt.x + dist * Math.sin(b.polar) * Math.sin(az),
      tgt.y + dist * Math.cos(b.polar),
      tgt.z + dist * Math.sin(b.polar) * Math.cos(az),
    );
    if (!animate) {
      controls.target.copy(tgt);
      camera.position.copy(goal);
      controls.update();
      dirty = true;
      return;
    }
    const fromP = camera.position.clone();
    const fromT = controls.target.clone();
    tween(750, (k) => {
      camera.position.lerpVectors(fromP, goal, k);
      controls.target.lerpVectors(fromT, tgt, k);
    });
  }

  function refreshPrint(b: Built) {
    drawPrint(b.print, state.logo, state.ink, state.scale);
    dirty = true;
  }

  function poseLid(lid: Lid, k: number, from: Pose, to: Pose) {
    lid.obj.position.lerpVectors(from.p, to.p, k);
    lid.obj.rotation.x = from.rx + (to.rx - from.rx) * k;
  }

  function setLid(b: Built, open: boolean) {
    const lid = b.lid;
    if (!lid) return;
    const from: Pose = { p: lid.obj.position.clone(), rx: lid.obj.rotation.x };
    const to = open ? lid.open : lid.closed;
    tween(900, (k) => poseLid(lid, k, from, to));
  }

  function show(key: ProductKey, animate: boolean) {
    const next = get(key);
    if (current === next) return;
    if (current) scene.remove(current.root);
    current = next;
    for (const m of paperMats(next)) m.color.copy(PAPER[state.paper]);
    refreshPrint(next);
    if (next.lid) poseLid(next.lid, 1, next.lid.closed, state.lidOpen ? next.lid.open : next.lid.closed);
    next.root.rotation.y = 0;
    scene.add(next.root);
    shadow.scale.setScalar(next.shadow);
    if (animate) {
      next.root.scale.setScalar(0.86);
      next.root.position.y = -0.15;
      tween(650, (k) => {
        next.root.scale.setScalar(0.86 + 0.14 * k);
        next.root.position.y = -0.15 * (1 - k);
      });
    }
    frame(next, animate);
  }

  // Resize
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (current) frame(current, false);
    dirty = true;
  });
  ro.observe(canvas);

  // Only run while on screen
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      renderer.setAnimationLoop(visible ? tick : null);
      if (visible) timer.reset();
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  controls.addEventListener("start", () => {
    interacting = true;
    controls.autoRotate = false;
    window.clearTimeout(resumeTimer);
    interactFns.forEach((f) => f());
  });
  controls.addEventListener("end", () => {
    interacting = false;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      if (state.autoRotate && !state.reducedMotion) controls.autoRotate = true;
    }, 2600);
  });
  controls.addEventListener("change", () => {
    dirty = true;
  });

  const timer = new Timer();
  function tick(time?: number) {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.05);
    let moving = false;
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      tw.t += dt * 1000;
      const k = Math.min(1, tw.t / tw.dur);
      tw.step(ease(k));
      moving = true;
      if (k >= 1) {
        tweens.splice(i, 1);
        tw.done?.();
      }
    }
    const changed = controls.update(dt);
    if (changed || moving || dirty || interacting) {
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  // Initial
  controls.autoRotate = state.autoRotate && !state.reducedMotion;
  {
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 600;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  show(state.product, false);
  renderer.render(scene, camera);

  return {
    set(patch) {
      const prev = state;
      state = { ...state, ...patch };
      if (patch.reducedMotion !== undefined || patch.autoRotate !== undefined) {
        controls.autoRotate = state.autoRotate && !state.reducedMotion && !interacting;
      }
      if (patch.product && patch.product !== prev.product) show(patch.product, true);
      if (patch.paper && patch.paper !== prev.paper && current) {
        const to = PAPER[state.paper].clone();
        const mats = [...paperMats(current)];
        const from = mats[0]?.color.clone() ?? to;
        tween(400, (k) => mats.forEach((m) => m.color.copy(from).lerp(to, k)));
        // other built products pick the colour up when shown
      }
      if ((patch.logo && patch.logo !== prev.logo) || (patch.ink && patch.ink !== prev.ink) || (patch.scale !== undefined && patch.scale !== prev.scale)) {
        if (current) refreshPrint(current);
      }
      if (patch.lidOpen !== undefined && patch.lidOpen !== prev.lidOpen && current?.lid) {
        setLid(current, state.lidOpen);
        frame(current, true);
      }
      dirty = true;
    },
    resetView() {
      if (current) frame(current, true);
    },
    onInteract(fn) {
      interactFns.push(fn);
    },
    async snapshot({ font, label }) {
      // Render once at a print-friendly resolution, then compose on linen with a caption.
      const prevRatio = renderer.getPixelRatio();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ratio = Math.max(2, Math.min(3, 2400 / w));
      renderer.setPixelRatio(ratio);
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
      const out = document.createElement("canvas");
      out.width = canvas.width;
      out.height = canvas.height;
      const g = out.getContext("2d")!;
      g.fillStyle = C.linen;
      g.fillRect(0, 0, out.width, out.height);
      g.drawImage(canvas, 0, 0);
      renderer.setPixelRatio(prevRatio);
      renderer.setSize(w, h, false);
      dirty = true;

      const pad = Math.round(out.width * 0.03);
      const size = Math.max(12, Math.round(out.width * 0.016));
      g.fillStyle = "rgba(1,1,1,0.55)";
      g.font = `600 ${size}px ${font}`;
      g.textBaseline = "bottom";
      g.fillText(label, pad, out.height - pad);
      g.textAlign = "right";
      g.fillText("resydue.com", out.width - pad, out.height - pad);
      return new Promise((res) => out.toBlob(res, "image/png"));
    },
    dispose() {
      renderer.setAnimationLoop(null);
      window.clearTimeout(resumeTimer);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      timer.dispose();
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          x.map?.dispose();
          x.dispose();
        });
      });
      built.forEach((b) => {
        b.root.traverse((o) => {
          const m = o as Mesh;
          if (m.geometry) m.geometry.dispose();
        });
        b.print.texture.dispose();
      });
      fibre.dispose();
      shadowTex.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
