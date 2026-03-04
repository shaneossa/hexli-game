// ============================================================
// HEXLI'S WORLD — a top-down adventure game
// ============================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TILE = 16;
const SCALE = 3;
const TS = TILE * SCALE; // 48px per tile on screen

// ── Resize canvas to window ──────────────────────────────────
function resize() {
  canvas.width = Math.floor(window.innerWidth / SCALE) * SCALE;
  canvas.height = Math.floor(window.innerHeight / SCALE) * SCALE;
}
resize();
window.addEventListener('resize', resize);

// ── Input ────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

function pressed(k) {
  return !!(keys[k]);
}
function moving() {
  return pressed('ArrowUp')||pressed('ArrowDown')||pressed('ArrowLeft')||pressed('ArrowRight')
      || pressed('w')||pressed('s')||pressed('a')||pressed('d');
}

// ── Palette ──────────────────────────────────────────────────
const C = {
  // Outdoors
  grass:      '#5a8a3c',
  grassDark:  '#4a7a2c',
  grassLight: '#6aaa4c',
  dirt:       '#8b7355',
  stone:      '#9a9a8a',
  stoneDark:  '#7a7a6a',
  fenceWood:  '#a0836a',
  fenceDark:  '#7a6350',
  treeGreen:  '#2d6a2d',
  treeDark:   '#1d4a1d',
  treeTrunk:  '#6b4f2a',
  houseSide:  '#8a9aaa',
  houseTrim:  '#b060c0',
  houseWall:  '#7a8a9a',
  skyBlue:    '#87ceeb',
  trampoGrey: '#888',
  trampoBlue: '#4488cc',
  slideBlue:  '#44bbcc',
  // Indoors
  floorWood:  '#c4933f',
  floorDark:  '#a07830',
  wallCream:  '#e8dfc8',
  wallPanel:  '#5a3820',
  wallPanelL: '#7a5030',
  tableWood:  '#c8a060',
  chairWood:  '#b89050',
  darkWood:   '#3a2010',
  medWood:    '#5a3820',
  stringLit:  '#ffee44',
  // Kitchen
  tileFloor:  '#d8d0c0',
  tileDark:   '#b8b0a0',
  counter:    '#c0b090',
  counterTop: '#e8e0d0',
  stove:      '#555',
  stoveDark:  '#333',
  // Cats
  hexliBody:  '#b0a090',
  hexliPoint: '#8a7a6a',
  hexliWhite: '#f5f0e8',
  hexliEye:   '#90c8f0',
  hexliNose:  '#e8a0a0',
  // NPC cats
  orangeCat:  '#e07830',
  blackCat:   '#222',
  calico1:    '#e07830',
  calico2:    '#222',
  calico3:    '#f5f0e8',
  // Collectibles
  yarnPink:   '#f080a0',
  yarnBlue:   '#4080f0',
  feather:    '#e0e060',
  mouseToy:   '#888888',
  bell:       '#f0d040',
};

// ── Rooms ────────────────────────────────────────────────────
// Each room is a grid of tiles + objects + entities
// Room IDs: 'backyard', 'dining', 'living', 'kitchen'

const ROOMS = {};

// ── Tile types ───────────────────────────────────────────────
const T = {
  GRASS: 0, GRASS2: 1, GRASS3: 2,
  STONE_PATH: 3, STONE_DARK: 4,
  FENCE_H: 5, FENCE_V: 6, FENCE_POST: 7,
  TREE: 8,
  HOUSE_WALL: 9, HOUSE_TRIM: 10, HOUSE_DOOR: 11,
  FLOOR_WOOD: 12, FLOOR_DARK: 13,
  WALL_CREAM: 14, WALL_PANEL: 15,
  TABLE: 16, CHAIR: 17,
  COUNTER: 18, COUNTER_TOP: 19,
  TILE_FLOOR: 20, TILE_DARK: 21,
  DOOR_OPEN: 22,
  DIRT: 23,
  TRAMPOLINE: 24,
  SLIDE: 25,
  DARK_WOOD_OBJ: 26,
};

// Tile render function
function drawTile(tx, ty, type, wx, wy) {
  const x = wx; const y = wy;
  const s = TS;
  switch(type) {
    case T.GRASS:
      ctx.fillStyle = C.grass;
      ctx.fillRect(x,y,s,s);
      // grass texture
      ctx.fillStyle = C.grassDark;
      ctx.fillRect(x+4,y+8,2,4);
      ctx.fillRect(x+12,y+4,2,6);
      ctx.fillRect(x+22,y+10,2,4);
      ctx.fillRect(x+32,y+6,2,5);
      ctx.fillRect(x+40,y+12,2,3);
      break;
    case T.GRASS2:
      ctx.fillStyle = C.grassLight;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.grass;
      ctx.fillRect(x+8,y+6,2,5);
      ctx.fillRect(x+20,y+10,2,4);
      ctx.fillRect(x+36,y+4,2,6);
      break;
    case T.GRASS3:
      ctx.fillStyle = C.grassDark;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.grass;
      ctx.fillRect(x+6,y+10,2,4);
      ctx.fillRect(x+18,y+6,2,5);
      ctx.fillRect(x+30,y+8,2,4);
      break;
    case T.STONE_PATH:
      ctx.fillStyle = C.stone;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.stoneDark;
      ctx.fillRect(x+2,y+2,s-4,s-4);
      ctx.fillStyle = C.stone;
      ctx.fillRect(x+4,y+4,s-8,s-8);
      break;
    case T.STONE_DARK:
      ctx.fillStyle = C.stoneDark;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.stone;
      ctx.fillRect(x+2,y+2,s-4,s-4);
      break;
    case T.FENCE_H:
      ctx.fillStyle = C.grass; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.fenceWood;
      ctx.fillRect(x,y+s/2-3,s,6);
      ctx.fillStyle = C.fenceDark;
      ctx.fillRect(x,y+s/2-3,s,2);
      break;
    case T.FENCE_V:
      ctx.fillStyle = C.grass; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.fenceWood;
      ctx.fillRect(x+s/2-3,y,6,s);
      ctx.fillStyle = C.fenceDark;
      ctx.fillRect(x+s/2-3,y,2,s);
      break;
    case T.FENCE_POST:
      ctx.fillStyle = C.grass; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.fenceDark;
      ctx.fillRect(x+s/2-4,y,8,s);
      ctx.fillRect(x,y+s/2-3,s,6);
      break;
    case T.HOUSE_WALL:
      ctx.fillStyle = C.houseWall;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.houseSide;
      ctx.fillRect(x,y,s,4);
      ctx.fillRect(x,y,4,s);
      break;
    case T.HOUSE_TRIM:
      ctx.fillStyle = C.houseTrim;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.houseWall;
      ctx.fillRect(x+3,y+3,s-6,s-6);
      break;
    case T.HOUSE_DOOR:
      ctx.fillStyle = C.houseWall; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.houseTrim;
      ctx.fillRect(x+s/4,y,s/2,s);
      ctx.fillStyle = C.darkWood;
      ctx.fillRect(x+s/4+2,y+2,s/2-4,s-4);
      ctx.fillStyle = '#d4aa40';
      ctx.fillRect(x+s/2+2,y+s/2-2,4,4);
      break;
    case T.FLOOR_WOOD:
      ctx.fillStyle = C.floorWood;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.floorDark;
      ctx.fillRect(x,y+s/3,s,1);
      ctx.fillRect(x,y+2*s/3,s,1);
      ctx.fillRect(x+s/2,y,1,s/3);
      ctx.fillRect(x+s/4,y+s/3,1,s/3);
      ctx.fillRect(x+3*s/4,y+2*s/3,1,s/3);
      break;
    case T.FLOOR_DARK:
      ctx.fillStyle = C.floorDark;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = '#8a6420';
      ctx.fillRect(x,y+s/3,s,1);
      ctx.fillRect(x,y+2*s/3,s,1);
      break;
    case T.WALL_CREAM:
      ctx.fillStyle = C.wallCream;
      ctx.fillRect(x,y,s,s);
      break;
    case T.WALL_PANEL:
      ctx.fillStyle = C.wallPanel;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.wallPanelL;
      ctx.fillRect(x+2,y+2,s-4,s/2-2);
      ctx.fillRect(x+2,y+s/2+2,s-4,s/2-4);
      break;
    case T.TILE_FLOOR:
      ctx.fillStyle = C.tileFloor;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.tileDark;
      ctx.fillRect(x,y,s,1);
      ctx.fillRect(x,y,1,s);
      break;
    case T.TILE_DARK:
      ctx.fillStyle = C.tileDark;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.tileFloor;
      ctx.fillRect(x+1,y+1,s-2,s-2);
      ctx.fillStyle = C.tileDark;
      ctx.fillRect(x,y,s,1);
      ctx.fillRect(x,y,1,s);
      break;
    case T.DOOR_OPEN:
      ctx.fillStyle = C.floorWood; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.houseTrim;
      ctx.fillRect(x,y,s,4);
      ctx.fillRect(x,y,4,s);
      ctx.fillRect(x+s-4,y,4,s);
      break;
    case T.DIRT:
      ctx.fillStyle = C.dirt;
      ctx.fillRect(x,y,s,s);
      ctx.fillStyle = '#7a6345';
      ctx.fillRect(x+4,y+4,4,4);
      ctx.fillRect(x+20,y+16,4,4);
      ctx.fillRect(x+36,y+8,4,4);
      break;
    case T.TRAMPOLINE:
      ctx.fillStyle = C.grass; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.trampoGrey;
      ctx.fillRect(x+4,y+s/3,s-8,2);
      ctx.fillRect(x+4,y+s/3+2,4,s/2);
      ctx.fillRect(x+s-8,y+s/3+2,4,s/2);
      ctx.fillStyle = C.trampoBlue;
      ctx.fillRect(x+6,y+s/3+4,s-12,s/3);
      break;
    case T.SLIDE:
      ctx.fillStyle = C.grass; ctx.fillRect(x,y,s,s);
      ctx.fillStyle = C.slideBlue;
      ctx.fillRect(x+s/4,y+4,s/2,s-8);
      ctx.fillStyle = '#33aacc';
      ctx.fillRect(x+s/4,y+4,4,s-8);
      break;
    default:
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(x,y,s,s);
  }
}

// ��─ Hexli sprite renderer ────────────────────────────────────
// dir: 0=down,1=up,2=left,3=right  frame:0,1
function drawHexli(wx, wy, dir, frame, scale=1) {
  const s = TS * scale;
  const x = wx - s/2;
  const y = wy - s * 0.8;

  ctx.save();
  ctx.translate(wx, wy - s*0.4);

  const sc = s / 48;
  ctx.scale(sc, sc);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 14, 5, 0, 0, Math.PI*2);
  ctx.fill();

  // Body
  ctx.fillStyle = C.hexliBody;
  ctx.beginPath();
  ctx.ellipse(0, 2, 13, 16, 0, 0, Math.PI*2);
  ctx.fill();

  // White chest/belly
  ctx.fillStyle = C.hexliWhite;
  ctx.beginPath();
  ctx.ellipse(0, 6, 7, 10, 0, 0, Math.PI*2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = C.hexliPoint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (dir === 2) { // left
    ctx.moveTo(10, 8);
    ctx.bezierCurveTo(22, 4, 24, -10, 18, -18);
  } else if (dir === 3) { // right
    ctx.moveTo(-10, 8);
    ctx.bezierCurveTo(-22, 4, -24, -10, -18, -18);
  } else {
    ctx.moveTo(frame === 0 ? 10 : 12, 5);
    ctx.bezierCurveTo(20, -2, 22, -14, 14, -20);
  }
  ctx.stroke();

  // Legs with walk animation
  ctx.fillStyle = C.hexliBody;
  const legOff = frame === 1 ? 3 : 0;
  if (dir === 0 || dir === 1) {
    ctx.fillRect(-10, 14, 5, 8 + (frame===0?legOff:0));
    ctx.fillRect(5,   14, 5, 8 + (frame===1?legOff:0));
    ctx.fillStyle = C.hexliWhite;
    ctx.fillRect(-10, 20, 5, 2);
    ctx.fillRect(5,   20, 5, 2);
  } else {
    ctx.fillRect(-8, 14, 5, 8 + (frame===0?legOff:0));
    ctx.fillRect(3,  14, 5, 8 + (frame===1?legOff:0));
    ctx.fillStyle = C.hexliWhite;
    ctx.fillRect(-8, 20, 5, 2);
    ctx.fillRect(3,  20, 5, 2);
  }

  // Head
  ctx.fillStyle = C.hexliBody;
  ctx.beginPath();
  ctx.ellipse(0, -14, 11, 10, 0, 0, Math.PI*2);
  ctx.fill();

  // White face
  ctx.fillStyle = C.hexliWhite;
  ctx.beginPath();
  ctx.ellipse(0, -12, 7, 7, 0, 0, Math.PI*2);
  ctx.fill();

  // Ears
  ctx.fillStyle = C.hexliPoint;
  ctx.beginPath();
  ctx.moveTo(-9, -20); ctx.lineTo(-13, -30); ctx.lineTo(-4, -22); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -20);  ctx.lineTo(13, -30);  ctx.lineTo(4, -22);  ctx.closePath(); ctx.fill();

  // Eyes
  if (dir !== 1) {
    ctx.fillStyle = C.hexliEye;
    ctx.beginPath(); ctx.ellipse(-4, -14, 3, 3.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -14, 3, 3.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath(); ctx.ellipse(-4, -14, 1.5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -14, 1.5, 1.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-5, -16, 1, 1);
    ctx.fillRect(3, -16, 1, 1);
  } else {
    // Looking away — small dots
    ctx.fillStyle = C.hexliEye;
    ctx.fillRect(-5, -16, 4, 2);
    ctx.fillRect(2, -16, 4, 2);
  }

  // Nose
  ctx.fillStyle = C.hexliNose;
  ctx.beginPath(); ctx.ellipse(0, -10, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();

  // Whiskers
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(-14, -12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(-14, -8);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -10);  ctx.lineTo(14, -12);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -10);  ctx.lineTo(14, -8);   ctx.stroke();

  ctx.restore();
}

// ── NPC cat renderer ─────────────────────────────────────────
function drawNPCCat(wx, wy, bodyColor, pointColor, frame, name) {
  ctx.save();
  ctx.translate(wx, wy - TS * 0.3);
  const sc = (TS * 0.7) / 48;
  ctx.scale(sc, sc);

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 20, 10, 4, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath(); ctx.ellipse(0, 2, 10, 13, 0, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle = pointColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, 5); ctx.bezierCurveTo(18, 0, 20, -12, 12, -18);
  ctx.stroke();

  ctx.fillStyle = bodyColor;
  ctx.fillRect(-8, 14, 4, 7 + (frame===0?2:0));
  ctx.fillRect(4,  14, 4, 7 + (frame===1?2:0));

  ctx.fillStyle = bodyColor;
  ctx.beginPath(); ctx.ellipse(0, -14, 9, 8, 0, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = pointColor;
  ctx.beginPath(); ctx.moveTo(-7,-19); ctx.lineTo(-10,-27); ctx.lineTo(-3,-21); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(7,-19);  ctx.lineTo(10,-27);  ctx.lineTo(3,-21);  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#88dd88';
  ctx.beginPath(); ctx.ellipse(-3,-14,2.5,3,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3,-14,2.5,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1a2a1a';
  ctx.beginPath(); ctx.ellipse(-3,-14,1,1,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3,-14,1,1,0,0,Math.PI*2); ctx.fill();

  ctx.restore();

  if (name) {
    ctx.save();
    ctx.font = `${Math.floor(TS*0.22)}px Georgia`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(name, wx, wy - TS*0.95);
    ctx.fillText(name, wx, wy - TS*0.95);
    ctx.restore();
  }
}

// ── Bird renderer ────────────────────────────────────────────
function drawBird(wx, wy, frame) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle = '#cc6633';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#882200';
  ctx.beginPath(); ctx.ellipse(6, -1, 3, 2, 0.3, 0, Math.PI*2); ctx.fill();
  // wings
  ctx.fillStyle = '#cc6633';
  const wingY = frame === 0 ? -4 : 2;
  ctx.beginPath(); ctx.ellipse(-4, wingY, 5, 2, -0.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── Butterfly renderer ───────────────────────────────────────
function drawButterfly(wx, wy, frame, color) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle = color;
  const spread = frame === 0 ? 1 : 0.5;
  ctx.beginPath(); ctx.ellipse(-5*spread, -3, 5*spread, 4, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5*spread,  -3, 5*spread, 4,  0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.fillRect(-1, -6, 2, 8);
  ctx.restore();
}

// ── Collectible renderer ─────────────────────────────────────
function drawCollectible(wx, wy, type, bob) {
  const y = wy + Math.sin(bob) * 3;
  ctx.save();
  ctx.translate(wx, y);
  // Glow
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(255,255,200,0.8)';
  switch(type) {
    case 'yarn_pink':
      ctx.fillStyle = C.yarnPink;
      ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c06080'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0,0,5,0.3,Math.PI*1.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,3,Math.PI,Math.PI*2.8); ctx.stroke();
      break;
    case 'yarn_blue':
      ctx.fillStyle = C.yarnBlue;
      ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#2060d0'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0,0,5,0.3,Math.PI*1.8); ctx.stroke();
      break;
    case 'feather':
      ctx.strokeStyle = C.feather; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0,8); ctx.bezierCurveTo(-4,-2,-2,-10,0,-14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-14); ctx.bezierCurveTo(6,-8,4,0,0,8); ctx.stroke();
      break;
    case 'mouse':
      ctx.fillStyle = C.mouseToy;
      ctx.beginPath(); ctx.ellipse(0,2,5,7,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,-5,4,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#aaa';
      ctx.beginPath(); ctx.ellipse(-3,-8,2,2,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3,-8,2,2,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#888'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,9); ctx.lineTo(0,16); ctx.stroke();
      break;
    case 'bell':
      ctx.fillStyle = C.bell;
      ctx.beginPath(); ctx.arc(0,0,7,Math.PI,Math.PI*2); ctx.fill();
      ctx.fillRect(-7,0,14,5);
      ctx.fillStyle='#c0a020';
      ctx.beginPath(); ctx.arc(0,0,2,0,Math.PI*2); ctx.fill();
      break;
  }
  ctx.restore();
}

// ── String lights renderer ───────────────────────────────────
function drawStringLights(x1, y1, x2, y2, t) {
  ctx.save();
  const colors = ['#ff4444','#44ff44','#4444ff','#ffff44','#ff44ff','#44ffff'];
  const num = Math.floor(Math.sqrt((x2-x1)**2+(y2-y1)**2) / 20);
  for(let i=0;i<=num;i++) {
    const t2 = i/num;
    const mx = x1+(x2-x1)*t2;
    const my = y1+(y2-y1)*t2 + Math.sin(t2*Math.PI)*8;
    const color = colors[(i + Math.floor(t/30)) % colors.length];
    ctx.fillStyle = color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI*2); ctx.fill();
  }
  // wire
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for(let i=0;i<=num;i++) {
    const t2=i/num;
    ctx.lineTo(x1+(x2-x1)*t2, y1+(y2-y1)*t2+Math.sin(t2*Math.PI)*8);
  }
  ctx.stroke();
  ctx.restore();
}

// ── Room definitions ─────────────────────────────────────────

// BACKYARD: 16 wide x 20 tall tiles
const BY_W = 16, BY_H = 20;
const backyardMap = [];
for(let r=0;r<BY_H;r++) {
  backyardMap[r] = [];
  for(let c=0;c<BY_W;c++) {
    // Default: grass
    const g = (c+r)%3===0?T.GRASS2:(c*r)%5===0?T.GRASS3:T.GRASS;
    backyardMap[r][c] = g;
  }
}
// House wall at top
for(let c=0;c<BY_W;c++) { backyardMap[0][c] = T.HOUSE_WALL; }
for(let c=0;c<BY_W;c++) { backyardMap[1][c] = T.HOUSE_TRIM; }
// Door in house wall
backyardMap[1][7] = T.HOUSE_DOOR;
backyardMap[1][8] = T.HOUSE_DOOR;
// Fences on sides
for(let r=2;r<BY_H-1;r++) { backyardMap[r][0] = T.FENCE_V; backyardMap[r][BY_W-1] = T.FENCE_V; }
for(let c=1;c<BY_W-1;c++) { backyardMap[BY_H-1][c] = T.FENCE_H; }
backyardMap[BY_H-1][0] = T.FENCE_POST; backyardMap[BY_H-1][BY_W-1] = T.FENCE_POST;
// Stone path (winding S from door)
const pathCols = [7,7,8,8,7,7,8,7,7,8,8,7,7,8,8,7,7,8];
for(let r=0;r<18;r++) {
  const c = pathCols[r]||7;
  if(backyardMap[r+2] && backyardMap[r+2][c]!==T.FENCE_V) {
    backyardMap[r+2][c] = (r%2===0)?T.STONE_PATH:T.STONE_DARK;
    if(backyardMap[r+2][c+1]!==T.FENCE_V) backyardMap[r+2][c+1]=(r%2===1)?T.STONE_PATH:T.STONE_DARK;
  }
}
// Trampoline (right side)
backyardMap[4][12]=T.TRAMPOLINE; backyardMap[4][13]=T.TRAMPOLINE;
backyardMap[5][12]=T.TRAMPOLINE; backyardMap[5][13]=T.TRAMPOLINE;
// Slide
backyardMap[3][11]=T.SLIDE; backyardMap[4][11]=T.SLIDE;
// Dirt patches
backyardMap[8][2]=T.DIRT; backyardMap[9][2]=T.DIRT;
backyardMap[14][13]=T.DIRT; backyardMap[15][13]=T.DIRT;

// DINING ROOM: 14w x 12h
const DR_W=14, DR_H=12;
const diningMap=[];
for(let r=0;r<DR_H;r++){
  diningMap[r]=[];
  for(let c=0;c<DR_W;c++){
    if(r===0) diningMap[r][c]=T.WALL_PANEL;
    else if(r>=DR_H-1) diningMap[r][c]=T.WALL_PANEL;
    else if(c===0||c===DR_W-1) diningMap[r][c]=T.WALL_PANEL;
    else diningMap[r][c]=(c+r)%2===0?T.FLOOR_WOOD:T.FLOOR_DARK;
  }
}
// Wall cream above panels
for(let c=1;c<DR_W-1;c++){diningMap[1][c]=T.WALL_CREAM;}
// Doors
diningMap[DR_H-1][6]=T.DOOR_OPEN; diningMap[DR_H-1][7]=T.DOOR_OPEN; // to backyard
diningMap[5][DR_W-1]=T.DOOR_OPEN; diningMap[6][DR_W-1]=T.DOOR_OPEN; // to living

// LIVING ROOM: 14w x 12h
const LR_W=14, LR_H=12;
const livingMap=[];
for(let r=0;r<LR_H;r++){
  livingMap[r]=[];
  for(let c=0;c<LR_W;c++){
    if(r===0) livingMap[r][c]=T.WALL_CREAM;
    else if(r>=LR_H-1) livingMap[r][c]=T.WALL_PANEL;
    else if(c===0) livingMap[r][c]=T.WALL_PANEL;
    else if(c===LR_W-1) livingMap[r][c]=T.WALL_CREAM;
    else livingMap[r][c]=(c+r)%2===0?T.FLOOR_WOOD:T.FLOOR_DARK;
  }
}
livingMap[1][0]=T.WALL_CREAM;
// Door to dining
for(let r=5;r<=6;r++) livingMap[r][0]=T.DOOR_OPEN;
// Door to kitchen
for(let c=6;c<=7;c++) livingMap[0][c]=T.DOOR_OPEN;

// KITCHEN: 12w x 10h
const KT_W=12, KT_H=10;
const kitchenMap=[];
for(let r=0;r<KT_H;r++){
  kitchenMap[r]=[];
  for(let c=0;c<KT_W;c++){
    if(r===0||r===KT_H-1) kitchenMap[r][c]=T.WALL_PANEL;
    else if(c===0||c===KT_W-1) kitchenMap[r][c]=T.WALL_PANEL;
    else kitchenMap[r][c]=(c+r)%2===0?T.TILE_FLOOR:T.TILE_DARK;
  }
}
kitchenMap[1][0]=T.WALL_CREAM;
// Door back to living
kitchenMap[KT_H-1][5]=T.DOOR_OPEN; kitchenMap[KT_H-1][6]=T.DOOR_OPEN;

// ── Room furniture / objects ──────────────────────────────────
function drawRoomObjects(room, camX, camY, t) {
  const ox = -camX;
  const oy = -camY;

  if(room==='backyard') {
    // Trees
    drawTree(ox+1*TS+TS/2, oy+3*TS, 2.2);
    drawTree(ox+1*TS+TS/2, oy+8*TS, 1.8);
    drawTree(ox+14*TS+TS/2, oy+2*TS, 2.4);
    drawTree(ox+14*TS+TS/2, oy+7*TS, 1.9);
    drawTree(ox+14*TS+TS/2, oy+12*TS, 1.6);
    // Potted plants
    drawPot(ox+1.5*TS, oy+12*TS);
    drawPot(ox+2*TS,   oy+14*TS);
    drawPot(ox+14*TS,  oy+16*TS);
    // Purple staircase on house wall
    ctx.fillStyle = C.houseTrim;
    ctx.fillRect(ox+9*TS, oy+1*TS, TS/3, TS*2);
    ctx.fillRect(ox+9*TS-4, oy+1.5*TS, TS/3+8, TS/6);
    ctx.fillRect(ox+9*TS-4, oy+2*TS,   TS/3+8, TS/6);
  }

  if(room==='dining') {
    // Dining table
    ctx.fillStyle = C.tableWood;
    ctx.fillRect(ox+4*TS, oy+3*TS, TS*4, TS*2);
    ctx.fillStyle = C.floorDark;
    ctx.fillRect(ox+4*TS, oy+3*TS, TS*4, 3);
    ctx.fillRect(ox+4*TS, oy+3*TS, 3, TS*2);
    // Chairs
    for(let i=0;i<3;i++){
      drawChair(ox+(4.5+i*1.2)*TS, oy+2.4*TS, false);
      drawChair(ox+(4.5+i*1.2)*TS, oy+5.3*TS, true);
    }
    // China cabinet left
    ctx.fillStyle = C.darkWood;
    ctx.fillRect(ox+1*TS, oy+1.5*TS, TS*2, TS*3);
    ctx.fillStyle = C.medWood;
    ctx.fillRect(ox+1*TS+3, oy+1.5*TS+3, TS*2-6, TS*3-6);
    ctx.fillStyle = 'rgba(150,200,220,0.3)';
    ctx.fillRect(ox+1*TS+6, oy+1.5*TS+6, TS*2-12, TS*3-12);
    // Chandelier
    drawChandelier(ox+7*TS, oy+1.5*TS);
    // Orchid on table
    drawOrchid(ox+6.5*TS, oy+3.3*TS);
    // Oranges
    ctx.fillStyle='#f0a030';
    ctx.beginPath();ctx.arc(ox+5.2*TS,oy+4.6*TS,6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ox+5.5*TS,oy+4.4*TS,6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ox+5.0*TS,oy+4.4*TS,6,0,Math.PI*2);ctx.fill();
    // String lights along top wall
    drawStringLights(ox+TS, oy+TS+8, ox+(DR_W-1)*TS, oy+TS+8, t);
    // Right wall panel
    ctx.fillStyle=C.darkWood;
    ctx.fillRect(ox+(DR_W-2)*TS, oy+1.5*TS, TS, TS*3.5);
    ctx.fillStyle=C.medWood;
    ctx.fillRect(ox+(DR_W-2)*TS+3, oy+1.5*TS+3, TS-6, TS*3.5-6);
  }

  if(room==='living') {
    // Sofa
    drawSofa(ox+4*TS, oy+1.5*TS);
    // Coffee table
    ctx.fillStyle=C.tableWood;
    ctx.fillRect(ox+5*TS, oy+3.5*TS, TS*2, TS);
    ctx.fillStyle=C.floorDark;
    ctx.fillRect(ox+5*TS,oy+3.5*TS,TS*2,2);
    // Lots of plants
    drawPlant(ox+1.5*TS, oy+1.5*TS, 1.4);
    drawPlant(ox+2.2*TS, oy+2*TS, 1.1);
    drawPlant(ox+LR_W*TS-1.5*TS, oy+1.5*TS, 1.2);
    drawPlant(ox+LR_W*TS-2*TS, oy+2.2*TS, 0.9);
    drawPlant(ox+1.5*TS, oy+7*TS, 1.3);
    // Rug
    ctx.fillStyle='rgba(160,80,120,0.4)';
    ctx.fillRect(ox+4*TS, oy+3*TS, TS*5, TS*3);
    ctx.strokeStyle='rgba(160,80,120,0.7)';
    ctx.lineWidth=3;
    ctx.strokeRect(ox+4*TS+4, oy+3*TS+4, TS*5-8, TS*3-8);
    // Floor lamp
    drawLamp(ox+LR_W*TS-1.5*TS, oy+8*TS);
    // String lights
    drawStringLights(ox+TS, oy+TS+6, ox+(LR_W-1)*TS, oy+TS+6, t);
  }

  if(room==='kitchen') {
    // Counters along top and right walls
    ctx.fillStyle=C.counter;
    ctx.fillRect(ox+TS, oy+TS, TS*(KT_W-2), TS);
    ctx.fillStyle=C.counterTop;
    ctx.fillRect(ox+TS, oy+TS, TS*(KT_W-2), 6);
    ctx.fillStyle=C.counter;
    ctx.fillRect(ox+(KT_W-2)*TS, oy+TS, TS, TS*4);
    ctx.fillStyle=C.counterTop;
    ctx.fillRect(ox+(KT_W-2)*TS, oy+TS, 6, TS*4);
    // Stove
    ctx.fillStyle=C.stove;
    ctx.fillRect(ox+3*TS, oy+TS+4, TS*2, TS-8);
    ctx.fillStyle=C.stoveDark;
    ctx.beginPath();ctx.arc(ox+3.4*TS,oy+1.5*TS,8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ox+4.6*TS,oy+1.5*TS,8,0,Math.PI*2);ctx.fill();
    // Sink
    ctx.fillStyle='#aabbcc';
    ctx.fillRect(ox+6*TS+4, oy+TS+4, TS-8, TS-10);
    ctx.fillStyle='#889aaa';
    ctx.fillRect(ox+6*TS+8, oy+TS+8, TS-16, TS-18);
    // Kitchen table
    ctx.fillStyle=C.tableWood;
    ctx.fillRect(ox+2*TS, oy+4*TS, TS*3, TS*2);
    ctx.fillStyle=C.floorDark;
    ctx.fillRect(ox+2*TS,oy+4*TS,TS*3,2);
    // Chairs around table
    drawChair(ox+2.5*TS, oy+3.4*TS, false);
    drawChair(ox+4*TS,   oy+3.4*TS, false);
    drawChair(ox+2.5*TS, oy+6.2*TS, true);
    drawChair(ox+4*TS,   oy+6.2*TS, true);
    // Plants on windowsill
    drawPlant(ox+8*TS, oy+1.5*TS, 0.8);
    drawPlant(ox+9*TS, oy+1.5*TS, 0.7);
    // String lights
    drawStringLights(ox+TS, oy+TS+6, ox+(KT_W-1)*TS, oy+TS+6, t);
  }
}

function drawTree(wx, wy, scale=1) {
  ctx.save();
  ctx.translate(wx, wy);
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.beginPath();ctx.ellipse(0,TS*0.6*scale,TS*0.5*scale,TS*0.15*scale,0,0,Math.PI*2);ctx.fill();
  // Trunk
  ctx.fillStyle=C.treeTrunk;
  ctx.fillRect(-5*scale, -TS*0.3*scale, 10*scale, TS*0.9*scale);
  // Foliage layers
  ctx.fillStyle=C.treeDark;
  ctx.beginPath();ctx.arc(0,-TS*0.6*scale,TS*0.55*scale,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C.treeGreen;
  ctx.beginPath();ctx.arc(-8*scale,-TS*0.8*scale,TS*0.4*scale,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(8*scale,-TS*0.75*scale,TS*0.38*scale,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(0,-TS*scale,TS*0.42*scale,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C.grassLight;
  ctx.beginPath();ctx.arc(-4*scale,-TS*scale-4*scale,TS*0.15*scale,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawPot(wx, wy) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle='#8b5e3c';
  ctx.beginPath();
  ctx.moveTo(-8,0);ctx.lineTo(-10,12);ctx.lineTo(10,12);ctx.lineTo(8,0);ctx.closePath();ctx.fill();
  ctx.fillStyle=C.treeGreen;
  ctx.beginPath();ctx.arc(0,-4,8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(-5,-8,5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(5,-7,5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawChair(wx, wy, flip) {
  ctx.save();
  ctx.translate(wx, wy);
  if(flip) ctx.scale(1,-1);
  ctx.fillStyle=C.chairWood;
  ctx.fillRect(-10,-8,20,4);
  ctx.fillRect(-10,-4,3,12);
  ctx.fillRect(7,-4,3,12);
  ctx.fillStyle=C.medWood;
  ctx.fillRect(-10,-16,20,8);
  ctx.restore();
}

function drawSofa(wx, wy) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle='#5a4070';
  ctx.fillRect(0,0,TS*3,TS*1.5);
  ctx.fillStyle='#7a5090';
  ctx.fillRect(0,0,TS*3,TS*0.6);
  ctx.fillRect(0,0,TS*0.3,TS*1.5);
  ctx.fillRect(TS*2.7,0,TS*0.3,TS*1.5);
  // cushions
  ctx.fillStyle='#6a4880';
  ctx.fillRect(TS*0.1,TS*0.6,TS*1.3,TS*0.9);
  ctx.fillRect(TS*1.6,TS*0.6,TS*1.3,TS*0.9);
  ctx.restore();
}

function drawPlant(wx, wy, scale=1) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle='#6b4423';
  ctx.fillRect(-5*scale,0,10*scale,14*scale);
  ctx.fillStyle=C.treeGreen;
  for(let i=0;i<5;i++){
    const angle = (i/5)*Math.PI*2;
    const r = 12*scale;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle)*r, -r+Math.sin(angle)*4*scale, 8*scale, 4*scale, angle, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle=C.grassLight;
  ctx.beginPath();ctx.arc(0,-14*scale,6*scale,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawLamp(wx, wy) {
  ctx.save();
  ctx.translate(wx, wy);
  // pole
  ctx.fillStyle='#333';
  ctx.fillRect(-2,-TS,4,TS*1.2);
  // shade
  ctx.fillStyle='#e0c060';
  ctx.beginPath();
  ctx.moveTo(-14,-TS);ctx.lineTo(14,-TS);ctx.lineTo(10,-TS+TS*0.5);ctx.lineTo(-10,-TS+TS*0.5);ctx.closePath();ctx.fill();
  // glow
  ctx.fillStyle='rgba(255,200,50,0.15)';
  ctx.beginPath();ctx.arc(0,-TS*0.7,TS*0.7,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawChandelier(wx, wy) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle='#3a2a10';
  ctx.fillRect(-2,-TS*0.6,4,TS*0.4);
  // arms
  for(let i=0;i<5;i++){
    const angle=(i/5)*Math.PI*2;
    const r=TS*0.4;
    ctx.strokeStyle='#3a2a10'; ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,-TS*0.2);ctx.lineTo(Math.cos(angle)*r,-TS*0.2+Math.sin(angle)*r*0.3);ctx.stroke();
    // bulb
    ctx.fillStyle='#ffe088';
    ctx.shadowBlur=8; ctx.shadowColor='#ffe088';
    ctx.beginPath();ctx.ellipse(Math.cos(angle)*r,-TS*0.2+Math.sin(angle)*r*0.3+6,5,7,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  }
  ctx.restore();
}

function drawOrchid(wx, wy) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.fillStyle='#5a8a3c';
  ctx.fillRect(-2,0,4,TS*0.8);
  // flowers
  const pinkColors=['#f0a0b8','#e080a0','#f8c0d0'];
  for(let i=0;i<4;i++){
    const y=-TS*0.2-i*TS*0.2;
    const x=(i%2===0)?-8:8;
    ctx.fillStyle=pinkColors[i%3];
    ctx.beginPath();ctx.ellipse(x,y,8,6,i*0.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff0f8';
    ctx.beginPath();ctx.ellipse(x,y,3,3,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// ── Collision map ─────────────────────────────────────────────
// Returns true if tile at (col,row) in a room blocks movement
function isSolid(room, col, row) {
  let map, w, h;
  if(room==='backyard'){map=backyardMap;w=BY_W;h=BY_H;}
  else if(room==='dining'){map=diningMap;w=DR_W;h=DR_H;}
  else if(room==='living'){map=livingMap;w=LR_W;h=LR_H;}
  else if(room==='kitchen'){map=kitchenMap;w=KT_W;h=KT_H;}
  else return true;
  if(col<0||col>=w||row<0||row>=h) return true;
  const t = map[row][col];
  if(t===T.WALL_CREAM||t===T.WALL_PANEL||t===T.HOUSE_WALL||t===T.HOUSE_TRIM||
     t===T.FENCE_H||t===T.FENCE_V||t===T.FENCE_POST||
     t===T.TRAMPOLINE||t===T.SLIDE) return true;
  return false;
}

function isSolidForNPC(room,col,row){
  if(isSolid(room,col,row)) return true;
  let map, w, h;
  if(room==='backyard'){map=backyardMap;w=BY_W;h=BY_H;}
  else return true;
  if(col<0||col>=w||row<0||row>=h) return true;
  return false;
}

// ── Room objects collision ────────────────────────────────────
// Extra solid rects for furniture (world space)
function getFurnitureRects(room) {
  const rects = [];
  if(room==='dining'){
    rects.push({x:4*TS,y:3*TS,w:4*TS,h:2*TS}); // table
    rects.push({x:1*TS,y:1.5*TS,w:2*TS,h:3*TS}); // cabinet
  }
  if(room==='living'){
    rects.push({x:4*TS,y:1.5*TS,w:3*TS,h:1.5*TS}); // sofa
    rects.push({x:5*TS,y:3.5*TS,w:2*TS,h:TS}); // coffee table
  }
  if(room==='kitchen'){
    rects.push({x:TS,y:TS,w:(KT_W-2)*TS,h:TS}); // counter top
    rects.push({x:(KT_W-2)*TS,y:TS,w:TS,h:4*TS}); // counter right
    rects.push({x:2*TS,y:4*TS,w:3*TS,h:2*TS}); // table
  }
  return rects;
}

// ── Door / transition zones ───────────────────────────────────
function getDoors(room) {
  if(room==='backyard') return [
    {x:7*TS,y:1*TS,w:2*TS,h:TS, to:'dining', spawnX:6.5*TS, spawnY:(DR_H-2)*TS, label:'Enter house'}
  ];
  if(room==='dining') return [
    {x:6*TS,y:(DR_H-1)*TS,w:2*TS,h:TS, to:'backyard', spawnX:7.5*TS, spawnY:2*TS, label:'Go outside'},
    {x:(DR_W-1)*TS,y:5*TS,w:TS,h:2*TS, to:'living', spawnX:TS,spawnY:5.5*TS, label:'Living room'},
  ];
  if(room==='living') return [
    {x:0,y:5*TS,w:TS,h:2*TS, to:'dining', spawnX:(DR_W-2)*TS,spawnY:5.5*TS, label:'Dining room'},
    {x:6*TS,y:0,w:2*TS,h:TS, to:'kitchen', spawnX:5.5*TS,spawnY:(KT_H-2)*TS, label:'Kitchen'},
  ];
  if(room==='kitchen') return [
    {x:5*TS,y:(KT_H-1)*TS,w:2*TS,h:TS, to:'living', spawnX:6.5*TS,spawnY:TS, label:'Living room'},
  ];
  return [];
}

// ── NPC definitions ───────────────────────────────────────────
const npcs = [
  {
    room:'backyard', x:10*TS, y:10*TS,
    vx:0.6, vy:0.3, body:C.orangeCat, point:'#a04010',
    name:'Mochi', frame:0, frameTimer:0,
    dialog:['Meow! The trampoline is fun!','I found a feather over by the fence.','The garden smells amazing today.'],
    dialogIdx:0,
  },
  {
    room:'backyard', x:4*TS, y:14*TS,
    vx:-0.4, vy:0.5, body:C.blackCat, point:'#111',
    name:'Shadow', frame:0, frameTimer:0,
    dialog:['...','I like it under the tree.','Don\'t mind me.'],
    dialogIdx:0,
  },
  {
    room:'living', x:7*TS, y:5*TS,
    vx:0.3, vy:-0.2, body:'#d4a870', point:'#a07040',
    name:'Biscuit', frame:0, frameTimer:0,
    dialog:['Purrrr...','The sofa is THE best spot.','Have you seen my toy mouse?'],
    dialogIdx:0,
  },
];

// ── Collectible definitions ───────────────────────────────────
const collectibles = [
  {room:'backyard', x:3*TS,  y:6*TS,  type:'yarn_pink', collected:false},
  {room:'backyard', x:11*TS, y:15*TS, type:'feather',   collected:false},
  {room:'backyard', x:5*TS,  y:18*TS, type:'bell',      collected:false},
  {room:'dining',   x:8*TS,  y:5*TS,  type:'yarn_blue', collected:false},
  {room:'living',   x:9*TS,  y:6*TS,  type:'mouse',     collected:false},
  {room:'kitchen',  x:8*TS,  y:6*TS,  type:'feather',   collected:false},
  {room:'kitchen',  x:4*TS,  y:7*TS,  type:'bell',      collected:false},
];

// ── Birds / butterflies ───────────────────────────────────────
const ambients = [
  {room:'backyard', x:8*TS,  y:6*TS,  type:'bird',      vx:1.2, vy:0.4, frame:0, timer:0, color:'#cc6633'},
  {room:'backyard', x:12*TS, y:10*TS, type:'bird',      vx:-0.8,vy:0.6, frame:0, timer:0, color:'#cc6633'},
  {room:'backyard', x:5*TS,  y:8*TS,  type:'butterfly', vx:0.5, vy:-0.3,frame:0, timer:0, color:'#ff88cc'},
  {room:'backyard', x:10*TS, y:4*TS,  type:'butterfly', vx:-0.6,vy:0.4, frame:0, timer:0, color:'#88aaff'},
  {room:'living',   x:5*TS,  y:6*TS,  type:'butterfly', vx:0.4, vy:0.2, frame:0, timer:0, color:'#ffcc44'},
];

// ── Player state ──────────────────────────────────────────────
const player = {
  room: 'backyard',
  x: 7.5*TS,
  y: 15*TS,
  vx: 0, vy: 0,
  speed: 2.0,
  dir: 0,   // 0=down,1=up,2=left,3=right
  frame: 0,
  frameTimer: 0,
  transitioning: false,
  transTimer: 0,
  transTo: null,
  transSpawnX: 0,
  transSpawnY: 0,
};

// ── Camera ────────────────────────────────────────────────────
const cam = { x:0, y:0 };

function updateCamera() {
  const vw = canvas.width / SCALE;
  const vh = canvas.height / SCALE;
  let mapW, mapH;
  if(player.room==='backyard')     {mapW=BY_W*TS;mapH=BY_H*TS;}
  else if(player.room==='dining')  {mapW=DR_W*TS;mapH=DR_H*TS;}
  else if(player.room==='living')  {mapW=LR_W*TS;mapH=LR_H*TS;}
  else                             {mapW=KT_W*TS;mapH=KT_H*TS;}

  cam.x = Math.max(0, Math.min(player.x - vw/2, mapW - vw));
  cam.y = Math.max(0, Math.min(player.y - vh/2, mapH - vh));
}

// ── Move player ───────────────────────────────────────────────
function movePlayer() {
  if(player.transitioning) return;
  let dx=0, dy=0;
  if(pressed('ArrowLeft') ||pressed('a')) dx=-1;
  if(pressed('ArrowRight')||pressed('d')) dx=1;
  if(pressed('ArrowUp')   ||pressed('w')) dy=-1;
  if(pressed('ArrowDown') ||pressed('s')) dy=1;

  if(dx!==0&&dy!==0){dx*=0.707;dy*=0.707;}

  if(dx<0) player.dir=2;
  else if(dx>0) player.dir=3;
  else if(dy<0) player.dir=1;
  else if(dy>0) player.dir=0;

  const spd = player.speed;
  const nx = player.x + dx*spd;
  const ny = player.y + dy*spd;

  // Tile collision
  const hw=10, hh=8; // hitbox half-width/height
  const cols = [Math.floor((nx-hw)/TS), Math.floor((nx+hw)/TS)];
  const rows = [Math.floor((ny-hh)/TS), Math.floor((ny+hh)/TS)];

  let canX=true, canY=true;
  for(const c of cols) for(const r of [Math.floor((player.y-hh)/TS),Math.floor((player.y+hh)/TS)])
    if(isSolid(player.room,c,r)) canX=false;
  for(const c of [Math.floor((player.x-hw)/TS),Math.floor((player.x+hw)/TS)]) for(const r of rows)
    if(isSolid(player.room,c,r)) canY=false;

  // Furniture collision
  const frects = getFurnitureRects(player.room);
  for(const fr of frects){
    if(nx-hw<fr.x+fr.w&&nx+hw>fr.x&&player.y-hh<fr.y+fr.h&&player.y+hh>fr.y) canX=false;
    if(player.x-hw<fr.x+fr.w&&player.x+hw>fr.x&&ny-hh<fr.y+fr.h&&ny+hh>fr.y) canY=false;
  }

  if(canX) player.x=nx;
  if(canY) player.y=ny;

  // Animate walk frames
  if(moving()){
    player.frameTimer++;
    if(player.frameTimer>10){player.frameTimer=0;player.frame=(player.frame+1)%2;}
  } else {
    player.frame=0;
  }
}

// ── Check doors ───────────────────────────────────────────────
function checkDoors() {
  if(player.transitioning) return;
  const doors = getDoors(player.room);
  const hw=8, hh=6;
  for(const door of doors){
    if(player.x+hw>door.x&&player.x-hw<door.x+door.w&&
       player.y+hh>door.y&&player.y-hh<door.y+door.h){
      startTransition(door.to, door.spawnX, door.spawnY);
      return;
    }
  }
}

function startTransition(to, spawnX, spawnY) {
  player.transitioning=true;
  player.transTimer=0;
  player.transTo=to;
  player.transSpawnX=spawnX;
  player.transSpawnY=spawnY;
}

function updateTransition() {
  if(!player.transitioning) return;
  player.transTimer++;
  if(player.transTimer===20){
    player.room=player.transTo;
    player.x=player.transSpawnX;
    player.y=player.transSpawnY;
    updateUI();
  }
  if(player.transTimer>=40){
    player.transitioning=false;
    player.transTimer=0;
  }
}

// ── NPC movement ──────────────────────────────────────────────
function updateNPCs() {
  for(const npc of npcs){
    npc.x+=npc.vx; npc.y+=npc.vy;
    const c=Math.floor(npc.x/TS), r=Math.floor(npc.y/TS);
    const nc=Math.floor((npc.x+npc.vx)/TS), nr=Math.floor((npc.y+npc.vy)/TS);
    let mapW=BY_W*TS, mapH=BY_H*TS;
    if(npc.room==='living'){mapW=LR_W*TS;mapH=LR_H*TS;}
    if(npc.x<TS||npc.x>mapW-TS) npc.vx*=-1;
    if(npc.y<2*TS||npc.y>mapH-2*TS) npc.vy*=-1;
    if(isSolid(npc.room,nc,r)) npc.vx*=-1;
    if(isSolid(npc.room,c,nr)) npc.vy*=-1;
    npc.frameTimer++;
    if(npc.frameTimer>15){npc.frameTimer=0;npc.frame=(npc.frame+1)%2;}
  }
}

// ── Ambient creatures ─────────────────────────────────────────
function updateAmbients() {
  for(const a of ambients){
    a.x+=a.vx; a.y+=a.vy;
    let mapW=BY_W*TS,mapH=BY_H*TS;
    if(a.room==='living'){mapW=LR_W*TS;mapH=LR_H*TS;}
    if(a.x<TS||a.x>mapW-TS) a.vx*=-1;
    if(a.y<2*TS||a.y>mapH-TS) a.vy*=-1;
    a.timer++;
    if(a.timer>20){a.timer=0;a.frame=(a.frame+1)%2;}
  }
}

// ── Check collectibles ────────────────────────────────────────
function checkCollectibles() {
  for(const c of collectibles){
    if(c.collected||c.room!==player.room) continue;
    const dx=player.x-c.x, dy=player.y-c.y;
    if(Math.sqrt(dx*dx+dy*dy)<TS*0.8){
      c.collected=true;
      updateCollectUI();
    }
  }
}

// ── Interaction (E key) ───────────────────────────────────────
let interactCooldown=0;
function checkInteract() {
  if(interactCooldown>0){interactCooldown--;return;}
  if(!pressed('e')&&!pressed('E')) return;
  for(const npc of npcs){
    if(npc.room!==player.room) continue;
    const dx=player.x-npc.x, dy=player.y-npc.y;
    if(Math.sqrt(dx*dx+dy*dy)<TS*1.2){
      showDialog(npc.name, npc.dialog[npc.dialogIdx]);
      npc.dialogIdx=(npc.dialogIdx+1)%npc.dialog.length;
      interactCooldown=30;
      return;
    }
  }
  hideDialog();
}

let dialogTimer=0;
function showDialog(speaker, text){
  const el=document.getElementById('dialog');
  document.getElementById('dialog-speaker').textContent=speaker;
  document.getElementById('dialog-text').textContent=text;
  el.style.display='block';
  dialogTimer=180;
}
function hideDialog(){
  document.getElementById('dialog').style.display='none';
  dialogTimer=0;
}

// ── UI updates ────────────────────────────────────────────────
const roomNames = {
  backyard:'The Backyard',
  dining:'Dining Room',
  living:'Living Room',
  kitchen:'Kitchen',
};
function updateUI(){
  document.getElementById('room-label').textContent = roomNames[player.room]||'';
  updateCollectUI();
}
function updateCollectUI(){
  const total=collectibles.length;
  const got=collectibles.filter(c=>c.collected).length;
  document.getElementById('collect-count').textContent=got;
  document.getElementById('collect-total').textContent=total;
}
updateUI();

// ���─ Draw tilemap ──────────────────────────────────────────────
function drawMap(room, camX, camY) {
  let map, w, h;
  if(room==='backyard'){map=backyardMap;w=BY_W;h=BY_H;}
  else if(room==='dining'){map=diningMap;w=DR_W;h=DR_H;}
  else if(room==='living'){map=livingMap;w=LR_W;h=LR_H;}
  else{map=kitchenMap;w=KT_W;h=KT_H;}

  const startC=Math.max(0,Math.floor(camX/TS));
  const endC=Math.min(w,Math.ceil((camX+canvas.width/SCALE)/TS));
  const startR=Math.max(0,Math.floor(camY/TS));
  const endR=Math.min(h,Math.ceil((camY+canvas.height/SCALE)/TS));

  for(let r=startR;r<endR;r++){
    for(let c=startC;c<endC;c++){
      drawTile(c,r,map[r][c], (c*TS-camX)*SCALE, (r*TS-camY)*SCALE);
    }
  }
}

// ── Draw sky for backyard ─────────────────────────────────────
function drawSky(camY) {
  const skyH = Math.max(0, (2*TS - camY)*SCALE);
  if(skyH>0){
    ctx.fillStyle=C.skyBlue;
    ctx.fillRect(0,0,canvas.width,skyH);
  }
}

// ── Main loop ─────────────────────────────────────────────────
let tick=0;
function loop(){
  tick++;

  movePlayer();
  checkDoors();
  updateTransition();
  updateNPCs();
  updateAmbients();
  checkCollectibles();
  checkInteract();
  if(dialogTimer>0){dialogTimer--;if(dialogTimer===0)hideDialog();}
  updateCamera();

  // Draw
  ctx.save();
  ctx.scale(SCALE, SCALE);

  // Background
  if(player.room==='backyard') drawSky(cam.y);
  else {
    ctx.fillStyle=player.room==='kitchen'?'#c8b898':'#e0d0b0';
    ctx.fillRect(0,0,canvas.width/SCALE,canvas.height/SCALE);
  }

  drawMap(player.room, cam.x, cam.y);
  drawRoomObjects(player.room, cam.x, cam.y, tick);

  // Draw ambients
  for(const a of ambients){
    if(a.room!==player.room) continue;
    const sx=(a.x-cam.x); const sy=(a.y-cam.y);
    if(a.type==='bird') drawBird(sx,sy,a.frame);
    else drawButterfly(sx,sy,a.frame,a.color);
  }

  // Draw collectibles
  for(const c of collectibles){
    if(c.collected||c.room!==player.room) continue;
    drawCollectible(c.x-cam.x, c.y-cam.y, c.type, tick*0.05);
  }

  // Draw NPCs (sorted by y)
  const visNPCs = npcs.filter(n=>n.room===player.room).sort((a,b)=>a.y-b.y);
  for(const npc of visNPCs){
    drawNPCCat(npc.x-cam.x, npc.y-cam.y, npc.body, npc.point, npc.frame, npc.name);
  }

  // Draw player (Hexli)
  drawHexli(player.x-cam.x, player.y-cam.y, player.dir, player.frame);

  // Transition fade
  if(player.transitioning){
    const alpha = player.transTimer<20 ? player.transTimer/20 : 1-(player.transTimer-20)/20;
    ctx.fillStyle=`rgba(0,0,0,${alpha})`;
    ctx.fillRect(0,0,canvas.width/SCALE,canvas.height/SCALE);
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

loop();
