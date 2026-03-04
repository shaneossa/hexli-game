// ============================================================
// HEXLI'S WORLD — Phaser 3.60 implementation
// ============================================================

const TILE = 48; // world pixel size per tile

// ── Palette ──────────────────────────────────────────────────
const C = {
  grass:      0x5a8a3c,
  grassDark:  0x4a7a2c,
  grassLight: 0x6aaa4c,
  dirt:       0x8b7355,
  stone:      0x9a9a8a,
  stoneDark:  0x7a7a6a,
  fenceWood:  0xa0836a,
  fenceDark:  0x7a6350,
  treeGreen:  0x2d6a2d,
  treeDark:   0x1d4a1d,
  treeTrunk:  0x6b4f2a,
  houseSide:  0x8a9aaa,
  houseTrim:  0xb060c0,
  houseWall:  0x7a8a9a,
  skyBlue:    0x87ceeb,
  trampoGrey: 0x888888,
  trampoBlue: 0x4488cc,
  slideBlue:  0x44bbcc,
  floorWood:  0xc4933f,
  floorDark:  0xa07830,
  wallCream:  0xe8dfc8,
  wallPanel:  0x5a3820,
  wallPanelL: 0x7a5030,
  tableWood:  0xc8a060,
  chairWood:  0xb89050,
  darkWood:   0x3a2010,
  medWood:    0x5a3820,
  tileFloor:  0xd8d0c0,
  tileDark:   0xb8b0a0,
  counter:    0xc0b090,
  counterTop: 0xe8e0d0,
  stove:      0x555555,
  stoveDark:  0x333333,
  hexliBody:  0xb0a090,
  hexliPoint: 0x8a7a6a,
  hexliWhite: 0xf5f0e8,
  hexliEye:   0x90c8f0,
  hexliNose:  0xe8a0a0,
  orangeCat:  0xe07830,
  blackCat:   0x222222,
  yarnPink:   0xf080a0,
  yarnBlue:   0x4080f0,
  feather:    0xe0e060,
  mouseToy:   0x888888,
  bell:       0xf0d040,
};

// ── Tile type IDs ─────────────────────────────────────────────
const T = {
  GRASS:0,GRASS2:1,GRASS3:2,
  STONE_PATH:3,STONE_DARK:4,
  FENCE_H:5,FENCE_V:6,FENCE_POST:7,
  HOUSE_WALL:8,HOUSE_TRIM:9,HOUSE_DOOR:10,
  FLOOR_WOOD:11,FLOOR_DARK:12,
  WALL_CREAM:13,WALL_PANEL:14,
  TILE_FLOOR:15,TILE_DARK:16,
  DOOR_OPEN:17,
  DIRT:18,
  TRAMPOLINE:19,
  SLIDE:20,
};

const SOLID_TILES = new Set([
  T.WALL_CREAM,T.WALL_PANEL,T.HOUSE_WALL,T.HOUSE_TRIM,
  T.FENCE_H,T.FENCE_V,T.FENCE_POST,
  T.TRAMPOLINE,T.SLIDE,
]);

// ── Map builders ─────────────────────────────────────────────
function buildBackyard() {
  const W=16,H=20;
  const m=[];
  for(let r=0;r<H;r++){
    m[r]=[];
    for(let c=0;c<W;c++){
      m[r][c]=(c+r)%3===0?T.GRASS2:(c*r)%5===0?T.GRASS3:T.GRASS;
    }
  }
  for(let c=0;c<W;c++){m[0][c]=T.HOUSE_WALL;m[1][c]=T.HOUSE_TRIM;}
  m[1][7]=T.HOUSE_DOOR;m[1][8]=T.HOUSE_DOOR;
  for(let r=2;r<H-1;r++){m[r][0]=T.FENCE_V;m[r][W-1]=T.FENCE_V;}
  for(let c=1;c<W-1;c++){m[H-1][c]=T.FENCE_H;}
  m[H-1][0]=T.FENCE_POST;m[H-1][W-1]=T.FENCE_POST;
  const path=[7,7,8,8,7,7,8,7,7,8,8,7,7,8,8,7,7,8];
  for(let r=0;r<18;r++){
    const col=path[r]||7;
    if(m[r+2]&&m[r+2][col]!==T.FENCE_V){
      m[r+2][col]=(r%2===0)?T.STONE_PATH:T.STONE_DARK;
      if(m[r+2][col+1]!==T.FENCE_V) m[r+2][col+1]=(r%2===1)?T.STONE_PATH:T.STONE_DARK;
    }
  }
  m[4][12]=T.TRAMPOLINE;m[4][13]=T.TRAMPOLINE;
  m[5][12]=T.TRAMPOLINE;m[5][13]=T.TRAMPOLINE;
  m[3][11]=T.SLIDE;m[4][11]=T.SLIDE;
  m[8][2]=T.DIRT;m[9][2]=T.DIRT;
  m[14][13]=T.DIRT;m[15][13]=T.DIRT;
  return {map:m,W,H};
}

function buildDining() {
  const W=14,H=12;
  const m=[];
  for(let r=0;r<H;r++){
    m[r]=[];
    for(let c=0;c<W;c++){
      if(r===0||r>=H-1||c===0||c===W-1) m[r][c]=T.WALL_PANEL;
      else m[r][c]=(c+r)%2===0?T.FLOOR_WOOD:T.FLOOR_DARK;
    }
  }
  for(let c=1;c<W-1;c++) m[1][c]=T.WALL_CREAM;
  m[H-1][6]=T.DOOR_OPEN;m[H-1][7]=T.DOOR_OPEN;
  m[5][W-1]=T.DOOR_OPEN;m[6][W-1]=T.DOOR_OPEN;
  return {map:m,W,H};
}

function buildLiving() {
  const W=14,H=12;
  const m=[];
  for(let r=0;r<H;r++){
    m[r]=[];
    for(let c=0;c<W;c++){
      if(r===0) m[r][c]=T.WALL_CREAM;
      else if(r>=H-1) m[r][c]=T.WALL_PANEL;
      else if(c===0) m[r][c]=T.WALL_PANEL;
      else if(c===W-1) m[r][c]=T.WALL_CREAM;
      else m[r][c]=(c+r)%2===0?T.FLOOR_WOOD:T.FLOOR_DARK;
    }
  }
  m[1][0]=T.WALL_CREAM;
  m[5][0]=T.DOOR_OPEN;m[6][0]=T.DOOR_OPEN;
  m[0][6]=T.DOOR_OPEN;m[0][7]=T.DOOR_OPEN;
  return {map:m,W,H};
}

function buildKitchen() {
  const W=12,H=10;
  const m=[];
  for(let r=0;r<H;r++){
    m[r]=[];
    for(let c=0;c<W;c++){
      if(r===0||r===H-1||c===0||c===W-1) m[r][c]=T.WALL_PANEL;
      else m[r][c]=(c+r)%2===0?T.TILE_FLOOR:T.TILE_DARK;
    }
  }
  m[1][0]=T.WALL_CREAM;
  m[H-1][5]=T.DOOR_OPEN;m[H-1][6]=T.DOOR_OPEN;
  return {map:m,W,H};
}

// ── Door zones ────────────────────────────────────────────────
const DOORS = {
  backyard:[
    {x:7*TILE,y:1*TILE,w:2*TILE,h:TILE,to:'dining',sx:6.5*TILE,sy:10*TILE,label:'Enter house'},
  ],
  dining:[
    {x:6*TILE,y:11*TILE,w:2*TILE,h:TILE,to:'backyard',sx:7.5*TILE,sy:2*TILE,label:'Go outside'},
    {x:13*TILE,y:5*TILE,w:TILE,h:2*TILE,to:'living',sx:TILE,sy:5.5*TILE,label:'Living room'},
  ],
  living:[
    {x:0,y:5*TILE,w:TILE,h:2*TILE,to:'dining',sx:12*TILE,sy:5.5*TILE,label:'Dining room'},
    {x:6*TILE,y:0,w:2*TILE,h:TILE,to:'kitchen',sx:5.5*TILE,sy:8*TILE,label:'Kitchen'},
  ],
  kitchen:[
    {x:5*TILE,y:9*TILE,w:2*TILE,h:TILE,to:'living',sx:6.5*TILE,sy:TILE,label:'Living room'},
  ],
};

// ── Furniture collision rects (room-space pixels) ─────────────
const FURNITURE = {
  backyard:[
    {x:1*TILE,y:2*TILE,w:TILE,h:10*TILE},   // left trees zone
    {x:14*TILE,y:1*TILE,w:TILE,h:14*TILE},  // right trees zone
  ],
  dining:[
    {x:4*TILE,y:3*TILE,w:4*TILE,h:2*TILE},
    {x:1*TILE,y:1.5*TILE,w:2*TILE,h:3*TILE},
  ],
  living:[
    {x:4*TILE,y:1.5*TILE,w:3*TILE,h:1.5*TILE},
    {x:5*TILE,y:3.5*TILE,w:2*TILE,h:TILE},
  ],
  kitchen:[
    {x:TILE,y:TILE,w:10*TILE,h:TILE},
    {x:10*TILE,y:TILE,w:TILE,h:4*TILE},
    {x:2*TILE,y:4*TILE,w:3*TILE,h:2*TILE},
  ],
};

// ��─ Helper: draw one tile onto a Graphics object ──────────────
function renderTile(g, px, py, type) {
  const s = TILE;
  switch(type) {
    case T.GRASS:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.grassDark);
      g.fillRect(px+4,py+8,2,4);g.fillRect(px+12,py+4,2,6);
      g.fillRect(px+22,py+10,2,4);g.fillRect(px+32,py+6,2,5);
      g.fillRect(px+40,py+12,2,3);
      break;
    case T.GRASS2:
      g.fillStyle(C.grassLight);g.fillRect(px,py,s,s);
      g.fillStyle(C.grass);
      g.fillRect(px+8,py+6,2,5);g.fillRect(px+20,py+10,2,4);g.fillRect(px+36,py+4,2,6);
      break;
    case T.GRASS3:
      g.fillStyle(C.grassDark);g.fillRect(px,py,s,s);
      g.fillStyle(C.grass);
      g.fillRect(px+6,py+10,2,4);g.fillRect(px+18,py+6,2,5);g.fillRect(px+30,py+8,2,4);
      break;
    case T.STONE_PATH:
      g.fillStyle(C.stone);g.fillRect(px,py,s,s);
      g.fillStyle(C.stoneDark);g.fillRect(px+2,py+2,s-4,s-4);
      g.fillStyle(C.stone);g.fillRect(px+4,py+4,s-8,s-8);
      break;
    case T.STONE_DARK:
      g.fillStyle(C.stoneDark);g.fillRect(px,py,s,s);
      g.fillStyle(C.stone);g.fillRect(px+2,py+2,s-4,s-4);
      break;
    case T.FENCE_H:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.fenceWood);g.fillRect(px,py+s/2-3,s,6);
      g.fillStyle(C.fenceDark);g.fillRect(px,py+s/2-3,s,2);
      break;
    case T.FENCE_V:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.fenceWood);g.fillRect(px+s/2-3,py,6,s);
      g.fillStyle(C.fenceDark);g.fillRect(px+s/2-3,py,2,s);
      break;
    case T.FENCE_POST:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.fenceDark);g.fillRect(px+s/2-4,py,8,s);g.fillRect(px,py+s/2-3,s,6);
      break;
    case T.HOUSE_WALL:
      g.fillStyle(C.houseWall);g.fillRect(px,py,s,s);
      g.fillStyle(C.houseSide);g.fillRect(px,py,s,4);g.fillRect(px,py,4,s);
      break;
    case T.HOUSE_TRIM:
      g.fillStyle(C.houseTrim);g.fillRect(px,py,s,s);
      g.fillStyle(C.houseWall);g.fillRect(px+3,py+3,s-6,s-6);
      break;
    case T.HOUSE_DOOR:
      g.fillStyle(C.houseWall);g.fillRect(px,py,s,s);
      g.fillStyle(C.houseTrim);g.fillRect(px+s/4,py,s/2,s);
      g.fillStyle(C.darkWood);g.fillRect(px+s/4+2,py+2,s/2-4,s-4);
      g.fillStyle(0xd4aa40);g.fillRect(px+s/2+2,py+s/2-2,4,4);
      break;
    case T.FLOOR_WOOD:
      g.fillStyle(C.floorWood);g.fillRect(px,py,s,s);
      g.fillStyle(C.floorDark);
      g.fillRect(px,py+Math.floor(s/3),s,1);
      g.fillRect(px,py+Math.floor(2*s/3),s,1);
      g.fillRect(px+Math.floor(s/2),py,1,Math.floor(s/3));
      g.fillRect(px+Math.floor(s/4),py+Math.floor(s/3),1,Math.floor(s/3));
      g.fillRect(px+Math.floor(3*s/4),py+Math.floor(2*s/3),1,Math.floor(s/3));
      break;
    case T.FLOOR_DARK:
      g.fillStyle(C.floorDark);g.fillRect(px,py,s,s);
      g.fillStyle(0x8a6420);
      g.fillRect(px,py+Math.floor(s/3),s,1);g.fillRect(px,py+Math.floor(2*s/3),s,1);
      break;
    case T.WALL_CREAM:
      g.fillStyle(C.wallCream);g.fillRect(px,py,s,s);
      break;
    case T.WALL_PANEL:
      g.fillStyle(C.wallPanel);g.fillRect(px,py,s,s);
      g.fillStyle(C.wallPanelL);
      g.fillRect(px+2,py+2,s-4,s/2-2);g.fillRect(px+2,py+s/2+2,s-4,s/2-4);
      break;
    case T.TILE_FLOOR:
      g.fillStyle(C.tileFloor);g.fillRect(px,py,s,s);
      g.fillStyle(C.tileDark);g.fillRect(px,py,s,1);g.fillRect(px,py,1,s);
      break;
    case T.TILE_DARK:
      g.fillStyle(C.tileDark);g.fillRect(px,py,s,s);
      g.fillStyle(C.tileFloor);g.fillRect(px+1,py+1,s-2,s-2);
      g.fillStyle(C.tileDark);g.fillRect(px,py,s,1);g.fillRect(px,py,1,s);
      break;
    case T.DOOR_OPEN:
      g.fillStyle(C.floorWood);g.fillRect(px,py,s,s);
      g.fillStyle(C.houseTrim);
      g.fillRect(px,py,s,4);g.fillRect(px,py,4,s);g.fillRect(px+s-4,py,4,s);
      break;
    case T.DIRT:
      g.fillStyle(C.dirt);g.fillRect(px,py,s,s);
      g.fillStyle(0x7a6345);
      g.fillRect(px+4,py+4,4,4);g.fillRect(px+20,py+16,4,4);g.fillRect(px+36,py+8,4,4);
      break;
    case T.TRAMPOLINE:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.trampoGrey);
      g.fillRect(px+4,py+Math.floor(s/3),s-8,2);
      g.fillRect(px+4,py+Math.floor(s/3)+2,4,s/2);
      g.fillRect(px+s-8,py+Math.floor(s/3)+2,4,s/2);
      g.fillStyle(C.trampoBlue);g.fillRect(px+6,py+Math.floor(s/3)+4,s-12,Math.floor(s/3));
      break;
    case T.SLIDE:
      g.fillStyle(C.grass);g.fillRect(px,py,s,s);
      g.fillStyle(C.slideBlue);g.fillRect(px+s/4,py+4,s/2,s-8);
      g.fillStyle(0x33aacc);g.fillRect(px+s/4,py+4,4,s-8);
      break;
    default:
      g.fillStyle(0xff00ff);g.fillRect(px,py,s,s);
  }
}

// ── Draw room decorations onto Graphics ───────────────────────
function renderRoomDecor(g, roomId, W, H) {
  const s = TILE;
  if(roomId==='backyard') {
    // Trees (left and right columns)
    drawTreeG(g, 1*s+s/2, 3*s, 2.2);
    drawTreeG(g, 1*s+s/2, 8*s, 1.8);
    drawTreeG(g, 14*s+s/2, 2*s, 2.4);
    drawTreeG(g, 14*s+s/2, 7*s, 1.9);
    drawTreeG(g, 14*s+s/2, 12*s, 1.6);
    // Potted plants
    drawPotG(g, 1.5*s, 12*s);
    drawPotG(g, 2*s, 14*s);
    drawPotG(g, 14*s, 16*s);
    // Purple staircase on house wall
    g.fillStyle(C.houseTrim);
    g.fillRect(9*s, 1*s, s/3, s*2);
    g.fillRect(9*s-4, 1.5*s, s/3+8, s/6);
    g.fillRect(9*s-4, 2*s, s/3+8, s/6);
  }
  if(roomId==='dining') {
    // Dining table
    g.fillStyle(C.tableWood);g.fillRect(4*s,3*s,4*s,2*s);
    g.fillStyle(C.floorDark);g.fillRect(4*s,3*s,4*s,3);g.fillRect(4*s,3*s,3,2*s);
    // Chairs
    for(let i=0;i<3;i++){
      drawChairG(g,(4.5+i*1.2)*s,2.4*s,false);
      drawChairG(g,(4.5+i*1.2)*s,5.3*s,true);
    }
    // China cabinet
    g.fillStyle(C.darkWood);g.fillRect(s,1.5*s,2*s,3*s);
    g.fillStyle(C.medWood);g.fillRect(s+3,1.5*s+3,2*s-6,3*s-6);
    g.fillStyle(0x96c8dc,0.3);g.fillRect(s+6,1.5*s+6,2*s-12,3*s-12);
    // Chandelier
    drawChandelierG(g, 7*s, 1.5*s);
    // Orchid on table
    drawOrchidG(g, 6.5*s, 3.3*s);
    // Oranges
    g.fillStyle(0xf0a030);
    g.fillCircle(5.2*s,4.6*s,6);
    g.fillCircle(5.5*s,4.4*s,6);
    g.fillCircle(5.0*s,4.4*s,6);
    // Right wall panel
    g.fillStyle(C.darkWood);g.fillRect((W-2)*s,1.5*s,s,3.5*s);
    g.fillStyle(C.medWood);g.fillRect((W-2)*s+3,1.5*s+3,s-6,3.5*s-6);
  }
  if(roomId==='living') {
    // Sofa
    drawSofaG(g, 4*s, 1.5*s);
    // Coffee table
    g.fillStyle(C.tableWood);g.fillRect(5*s,3.5*s,2*s,s);
    g.fillStyle(C.floorDark);g.fillRect(5*s,3.5*s,2*s,2);
    // Plants
    drawPlantG(g, 1.5*s, 1.5*s, 1.4);
    drawPlantG(g, 2.2*s, 2*s, 1.1);
    drawPlantG(g, (W-1.5)*s, 1.5*s, 1.2);
    drawPlantG(g, (W-2)*s, 2.2*s, 0.9);
    drawPlantG(g, 1.5*s, 7*s, 1.3);
    // Rug
    g.fillStyle(0xa05078,0.4);g.fillRect(4*s,3*s,5*s,3*s);
    g.lineStyle(3,0xa05078,0.7);g.strokeRect(4*s+4,3*s+4,5*s-8,3*s-8);
    // Floor lamp
    drawLampG(g, (W-1.5)*s, 8*s);
  }
  if(roomId==='kitchen') {
    // Counters
    g.fillStyle(C.counter);g.fillRect(s,s,(W-2)*s,s);
    g.fillStyle(C.counterTop);g.fillRect(s,s,(W-2)*s,6);
    g.fillStyle(C.counter);g.fillRect((W-2)*s,s,s,4*s);
    g.fillStyle(C.counterTop);g.fillRect((W-2)*s,s,6,4*s);
    // Stove
    g.fillStyle(C.stove);g.fillRect(3*s,s+4,2*s,s-8);
    g.fillStyle(C.stoveDark);
    g.fillCircle(3.4*s,1.5*s,8);g.fillCircle(4.6*s,1.5*s,8);
    // Sink
    g.fillStyle(0xaabbcc);g.fillRect(6*s+4,s+4,s-8,s-10);
    g.fillStyle(0x889aaa);g.fillRect(6*s+8,s+8,s-16,s-18);
    // Kitchen table
    g.fillStyle(C.tableWood);g.fillRect(2*s,4*s,3*s,2*s);
    g.fillStyle(C.floorDark);g.fillRect(2*s,4*s,3*s,2);
    // Chairs
    drawChairG(g,2.5*s,3.4*s,false);
    drawChairG(g,4*s,3.4*s,false);
    drawChairG(g,2.5*s,6.2*s,true);
    drawChairG(g,4*s,6.2*s,true);
    // Plants on windowsill
    drawPlantG(g, 8*s, 1.5*s, 0.8);
    drawPlantG(g, 9*s, 1.5*s, 0.7);
  }
}

function drawTreeG(g, wx, wy, scale) {
  const s=TILE;
  // Shadow
  g.fillStyle(0x000000,0.2);g.fillEllipse(wx,wy+s*0.6*scale,s*scale,s*0.3*scale);
  // Trunk
  g.fillStyle(C.treeTrunk);g.fillRect(wx-5*scale,wy-s*0.3*scale,10*scale,s*0.9*scale);
  // Foliage
  g.fillStyle(C.treeDark);g.fillCircle(wx,wy-s*0.6*scale,s*0.55*scale);
  g.fillStyle(C.treeGreen);
  g.fillCircle(wx-8*scale,wy-s*0.8*scale,s*0.4*scale);
  g.fillCircle(wx+8*scale,wy-s*0.75*scale,s*0.38*scale);
  g.fillCircle(wx,wy-s*scale,s*0.42*scale);
  g.fillStyle(C.grassLight);g.fillCircle(wx-4*scale,wy-s*scale-4*scale,s*0.15*scale);
}

function drawPotG(g, wx, wy) {
  g.fillStyle(0x8b5e3c);
  g.fillTriangle(wx-8,wy,wx-10,wy+12,wx+10,wy+12);
  g.fillRect(wx-10,wy+10,20,2);
  g.fillStyle(C.treeGreen);
  g.fillCircle(wx,wy-4,8);g.fillCircle(wx-5,wy-8,5);g.fillCircle(wx+5,wy-7,5);
}

function drawChairG(g, wx, wy, flip) {
  const sy = flip?-1:1;
  g.fillStyle(C.chairWood);
  g.fillRect(wx-10,wy-8*sy,20,4);
  g.fillRect(wx-10,wy-4*sy,3,12*sy);
  g.fillRect(wx+7,wy-4*sy,3,12*sy);
  g.fillStyle(C.medWood);g.fillRect(wx-10,wy-16*sy,20,8);
}

function drawSofaG(g, wx, wy) {
  const s=TILE;
  g.fillStyle(0x5a4070);g.fillRect(wx,wy,s*3,s*1.5);
  g.fillStyle(0x7a5090);
  g.fillRect(wx,wy,s*3,s*0.6);
  g.fillRect(wx,wy,s*0.3,s*1.5);
  g.fillRect(wx+s*2.7,wy,s*0.3,s*1.5);
  g.fillStyle(0x6a4880);
  g.fillRect(wx+s*0.1,wy+s*0.6,s*1.3,s*0.9);
  g.fillRect(wx+s*1.6,wy+s*0.6,s*1.3,s*0.9);
}

function drawPlantG(g, wx, wy, scale) {
  g.fillStyle(0x6b4423);g.fillRect(wx-5*scale,wy,10*scale,14*scale);
  g.fillStyle(C.treeGreen);
  for(let i=0;i<5;i++){
    const angle=(i/5)*Math.PI*2;
    const r=12*scale;
    g.fillEllipse(wx+Math.cos(angle)*r,wy-r+Math.sin(angle)*4*scale,16*scale,8*scale);
  }
  g.fillStyle(C.grassLight);g.fillCircle(wx,wy-14*scale,6*scale);
}

function drawLampG(g, wx, wy) {
  const s=TILE;
  g.fillStyle(0x333333);g.fillRect(wx-2,wy-s,4,s*1.2);
  g.fillStyle(0xe0c060);
  g.fillTriangle(wx-14,wy-s,wx+14,wy-s,wx+10,wy-s+s*0.5);
  g.fillTriangle(wx-14,wy-s,wx-10,wy-s+s*0.5,wx+10,wy-s+s*0.5);
}

function drawChandelierG(g, wx, wy) {
  const s=TILE;
  g.fillStyle(0x3a2a10);g.fillRect(wx-2,wy-s*0.6,4,s*0.4);
  for(let i=0;i<5;i++){
    const angle=(i/5)*Math.PI*2;
    const r=s*0.4;
    const ex=wx+Math.cos(angle)*r, ey=wy-s*0.2+Math.sin(angle)*r*0.3;
    g.lineStyle(2,0x3a2a10);g.lineBetween(wx,wy-s*0.2,ex,ey);
    g.fillStyle(0xffe088);g.fillEllipse(ex,ey+6,10,14);
  }
}

function drawOrchidG(g, wx, wy) {
  const s=TILE;
  g.fillStyle(0x5a8a3c);g.fillRect(wx-2,wy,4,s*0.8);
  const pinks=[0xf0a0b8,0xe080a0,0xf8c0d0];
  for(let i=0;i<4;i++){
    const y=wy-s*0.2-i*s*0.2;
    const x=wx+(i%2===0?-8:8);
    g.fillStyle(pinks[i%3]);g.fillEllipse(x,y,16,12);
    g.fillStyle(0xfff0f8);g.fillCircle(x,y,3);
  }
}

// ─��� Phaser Scene ──────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {}

  create() {
    // Build room data
    this.rooms = {
      backyard: buildBackyard(),
      dining:   buildDining(),
      living:   buildLiving(),
      kitchen:  buildKitchen(),
    };

    // String lights (animated, drawn each frame)
    this.tick = 0;

    // Current room
    this.currentRoom = 'backyard';

    // Create a RenderTexture for each room's static tilemap
    this.roomTextures = {};
    for(const [id,room] of Object.entries(this.rooms)) {
      const rt = this.add.renderTexture(0,0,room.W*TILE,room.H*TILE).setVisible(false);
      const g = this.add.graphics();
      for(let r=0;r<room.H;r++)
        for(let c=0;c<room.W;c++)
          renderTile(g, c*TILE, r*TILE, room.map[r][c]);
      renderRoomDecor(g, id, room.W, room.H);
      rt.draw(g,0,0);
      g.destroy();
      this.roomTextures[id] = rt;
    }

    // Active room image (what's visible)
    this.roomImage = this.add.image(0,0,'').setOrigin(0,0);

    // Dynamic decorations (string lights, animated)
    this.dynamicG = this.add.graphics();

    // ── Collectibles ──────────────────────────────────────────
    this.collectibles = [
      {room:'backyard',x:3*TILE, y:6*TILE,  type:'yarn_pink',collected:false},
      {room:'backyard',x:11*TILE,y:15*TILE, type:'feather',  collected:false},
      {room:'backyard',x:5*TILE, y:18*TILE, type:'bell',     collected:false},
      {room:'dining',  x:8*TILE, y:5*TILE,  type:'yarn_blue',collected:false},
      {room:'living',  x:9*TILE, y:6*TILE,  type:'mouse',    collected:false},
      {room:'kitchen', x:8*TILE, y:6*TILE,  type:'feather',  collected:false},
      {room:'kitchen', x:4*TILE, y:7*TILE,  type:'bell',     collected:false},
    ];
    this.collectG = this.add.graphics();

    // ── NPCs ──────────────────────────────────────────────────
    this.npcs = [
      {room:'backyard',x:10*TILE,y:10*TILE,vx:0.6,vy:0.3,
       body:C.orangeCat,point:0xa04010,name:'Mochi',frame:0,ft:0,
       dialog:['Meow! The trampoline is fun!','I found a feather over by the fence.','The garden smells amazing today.'],di:0},
      {room:'backyard',x:4*TILE,y:14*TILE,vx:-0.4,vy:0.5,
       body:C.blackCat,point:0x111111,name:'Shadow',frame:0,ft:0,
       dialog:['...','I like it under the tree.','Don\'t mind me.'],di:0},
      {room:'living',x:7*TILE,y:5*TILE,vx:0.3,vy:-0.2,
       body:0xd4a870,point:0xa07040,name:'Biscuit',frame:0,ft:0,
       dialog:['Purrrr...','The sofa is THE best spot.','Have you seen my toy mouse?'],di:0},
    ];
    this.npcG = this.add.graphics();

    // ── Ambients ──────────────────────────────────────────────
    this.ambients = [
      {room:'backyard',x:8*TILE, y:6*TILE, type:'bird',      vx:1.2, vy:0.4, frame:0,timer:0,color:0xcc6633},
      {room:'backyard',x:12*TILE,y:10*TILE,type:'bird',      vx:-0.8,vy:0.6, frame:0,timer:0,color:0xcc6633},
      {room:'backyard',x:5*TILE, y:8*TILE, type:'butterfly', vx:0.5, vy:-0.3,frame:0,timer:0,color:0xff88cc},
      {room:'backyard',x:10*TILE,y:4*TILE, type:'butterfly', vx:-0.6,vy:0.4, frame:0,timer:0,color:0x88aaff},
      {room:'living',  x:5*TILE, y:6*TILE, type:'butterfly', vx:0.4, vy:0.2, frame:0,timer:0,color:0xffcc44},
    ];
    this.ambientG = this.add.graphics();

    // ── Player ────────────────────────────────────────────────
    this.player = {
      room:'backyard',
      x:7.5*TILE, y:15*TILE,
      speed:2.2,
      dir:0, frame:0, ft:0,
    };
    this.playerG = this.add.graphics();

    // ── Camera ────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#1a1a2e');
    // We'll manually position everything relative to camX/camY
    this.camX = 0; this.camY = 0;

    // ── Fade overlay ──────────────────────────────────────────
    this.fadeRect = this.add.rectangle(0,0,
      this.scale.width*2,this.scale.height*2,0x000000,0).setDepth(50).setOrigin(0,0);
    this.transitioning = false;
    this.transTimer = 0;
    this.transTo = null; this.transSX = 0; this.transSY = 0;

    // ── Input ─────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D,
      e:Phaser.Input.Keyboard.KeyCodes.E,
    });

    // ── Dialog state ──────────────────────────────────────────
    this.dialogTimer = 0;
    this.interactCooldown = 0;
    this.eWasDown = false;

    // ── Scale / layout ────────────────────────────────────────
    this.scale.on('resize', this.onResize, this);
    this.onResize();

    // Initial room load
    this.loadRoom('backyard');
    this.updateHUD();
  }

  onResize() {
    const w = this.scale.width, h = this.scale.height;
    if(this.fadeRect) this.fadeRect.setSize(w,h);
  }

  loadRoom(id) {
    this.currentRoom = id;
    const rt = this.roomTextures[id];
    // Replace roomImage texture
    if(this.roomImage) this.roomImage.destroy();
    this.roomImage = this.add.image(0,0,'').setOrigin(0,0).setDepth(-1);
    // Render the room texture to a canvas key
    const key = 'room_'+id;
    if(!this.textures.exists(key)) {
      const room = this.rooms[id];
      const g2 = this.add.graphics({x:0,y:0});
      for(let r=0;r<room.H;r++)
        for(let c=0;c<room.W;c++)
          renderTile(g2,c*TILE,r*TILE,room.map[r][c]);
      renderRoomDecor(g2,id,room.W,room.H);
      g2.generateTexture(key, room.W*TILE, room.H*TILE);
      g2.destroy();
    }
    this.roomImage.setTexture(key).setDepth(-1);
    this.updateHUD();
  }

  updateHUD() {
    const names={backyard:'The Backyard',dining:'Dining Room',living:'Living Room',kitchen:'Kitchen'};
    const el=document.getElementById('hud');
    if(el) el.textContent=names[this.currentRoom]||'';
    const got=this.collectibles.filter(c=>c.collected).length;
    const cc=document.getElementById('cc'),ct=document.getElementById('ct');
    if(cc) cc.textContent=got;
    if(ct) ct.textContent=this.collectibles.length;
  }

  showDialog(speaker,text) {
    const el=document.getElementById('dialog');
    const sp=document.getElementById('dialog-speaker');
    const tx=document.getElementById('dialog-text');
    if(el){el.style.display='block';}
    if(sp){sp.textContent=speaker;}
    if(tx){tx.textContent=text;}
    this.dialogTimer=180;
  }

  hideDialog() {
    const el=document.getElementById('dialog');
    if(el) el.style.display='none';
    this.dialogTimer=0;
  }

  updateCamera() {
    const vw=this.scale.width, vh=this.scale.height;
    const room=this.rooms[this.currentRoom];
    const mapW=room.W*TILE, mapH=room.H*TILE;
    const p=this.player;
    this.camX=Phaser.Math.Clamp(p.x-vw/2, 0, Math.max(0,mapW-vw));
    this.camY=Phaser.Math.Clamp(p.y-vh/2, 0, Math.max(0,mapH-vh));
  }

  isSolid(room, col, row) {
    const r=this.rooms[room];
    if(!r||col<0||col>=r.W||row<0||row>=r.H) return true;
    return SOLID_TILES.has(r.map[row][col]);
  }

  movePlayer(dt) {
    if(this.transitioning) return;
    const p=this.player;
    const cur=this.cursors, w=this.wasd;
    let dx=0,dy=0;
    if(cur.left.isDown||w.left.isDown)  dx=-1;
    if(cur.right.isDown||w.right.isDown) dx=1;
    if(cur.up.isDown||w.up.isDown)       dy=-1;
    if(cur.down.isDown||w.down.isDown)   dy=1;

    if(dx!==0&&dy!==0){dx*=0.707;dy*=0.707;}
    if(dx<0) p.dir=2;
    else if(dx>0) p.dir=3;
    else if(dy<0) p.dir=1;
    else if(dy>0) p.dir=0;

    const spd=p.speed;
    const nx=p.x+dx*spd, ny=p.y+dy*spd;
    const hw=10,hh=8;

    let canX=true,canY=true;
    const colsNX=[Math.floor((nx-hw)/TILE),Math.floor((nx+hw)/TILE)];
    const rowsY=[Math.floor((p.y-hh)/TILE),Math.floor((p.y+hh)/TILE)];
    const colsX=[Math.floor((p.x-hw)/TILE),Math.floor((p.x+hw)/TILE)];
    const rowsNY=[Math.floor((ny-hh)/TILE),Math.floor((ny+hh)/TILE)];

    for(const c of colsNX) for(const r of rowsY) if(this.isSolid(p.room,c,r)){canX=false;break;}
    for(const c of colsX) for(const r of rowsNY) if(this.isSolid(p.room,c,r)){canY=false;break;}

    const furn=FURNITURE[p.room]||[];
    for(const fr of furn){
      if(nx-hw<fr.x+fr.w&&nx+hw>fr.x&&p.y-hh<fr.y+fr.h&&p.y+hh>fr.y) canX=false;
      if(p.x-hw<fr.x+fr.w&&p.x+hw>fr.x&&ny-hh<fr.y+fr.h&&ny+hh>fr.y) canY=false;
    }

    if(canX) p.x=nx;
    if(canY) p.y=ny;

    if(dx!==0||dy!==0){
      p.ft++;
      if(p.ft>10){p.ft=0;p.frame=(p.frame+1)%2;}
    } else {
      p.frame=0;
    }
  }

  checkDoors() {
    if(this.transitioning) return;
    const p=this.player;
    const hw=8,hh=6;
    for(const door of (DOORS[p.room]||[])){
      if(p.x+hw>door.x&&p.x-hw<door.x+door.w&&
         p.y+hh>door.y&&p.y-hh<door.y+door.h){
        this.startTransition(door.to,door.sx,door.sy);
        return;
      }
    }
  }

  startTransition(to,sx,sy) {
    this.transitioning=true;
    this.transTimer=0;
    this.transTo=to; this.transSX=sx; this.transSY=sy;
  }

  updateTransition() {
    if(!this.transitioning) return;
    this.transTimer++;
    const t=this.transTimer;
    if(t<20) {
      this.fadeRect.setAlpha(t/20);
    } else if(t===20) {
      this.player.room=this.transTo;
      this.player.x=this.transSX;
      this.player.y=this.transSY;
      this.loadRoom(this.transTo);
    } else {
      this.fadeRect.setAlpha(1-(t-20)/20);
      if(t>=40){this.transitioning=false;this.transTimer=0;this.fadeRect.setAlpha(0);}
    }
  }

  checkCollectibles() {
    const p=this.player;
    for(const c of this.collectibles){
      if(c.collected||c.room!==p.room) continue;
      const dx=p.x-c.x,dy=p.y-c.y;
      if(dx*dx+dy*dy<(TILE*0.8)*(TILE*0.8)){
        c.collected=true;
        this.updateHUD();
      }
    }
  }

  checkInteract() {
    if(this.interactCooldown>0){this.interactCooldown--;return;}
    const eDown=this.wasd.e.isDown;
    if(!eDown){this.eWasDown=false;return;}
    if(this.eWasDown) return;
    this.eWasDown=true;
    const p=this.player;
    for(const npc of this.npcs){
      if(npc.room!==p.room) continue;
      const dx=p.x-npc.x,dy=p.y-npc.y;
      if(dx*dx+dy*dy<(TILE*1.2)*(TILE*1.2)){
        this.showDialog(npc.name,npc.dialog[npc.di]);
        npc.di=(npc.di+1)%npc.dialog.length;
        this.interactCooldown=30;
        return;
      }
    }
    this.hideDialog();
  }

  updateNPCs() {
    for(const npc of this.npcs){
      npc.x+=npc.vx; npc.y+=npc.vy;
      const room=this.rooms[npc.room];
      const mW=room.W*TILE, mH=room.H*TILE;
      if(npc.x<TILE||npc.x>mW-TILE) npc.vx*=-1;
      if(npc.y<2*TILE||npc.y>mH-2*TILE) npc.vy*=-1;
      const nc=Math.floor(npc.x/TILE),nr=Math.floor(npc.y/TILE);
      if(this.isSolid(npc.room,nc+Math.sign(npc.vx),nr)) npc.vx*=-1;
      if(this.isSolid(npc.room,nc,nr+Math.sign(npc.vy))) npc.vy*=-1;
      npc.ft++;
      if(npc.ft>15){npc.ft=0;npc.frame=(npc.frame+1)%2;}
    }
  }

  updateAmbients() {
    for(const a of this.ambients){
      a.x+=a.vx; a.y+=a.vy;
      const room=this.rooms[a.room];
      const mW=room.W*TILE,mH=room.H*TILE;
      if(a.x<TILE||a.x>mW-TILE) a.vx*=-1;
      if(a.y<2*TILE||a.y>mH-TILE) a.vy*=-1;
      a.timer++;
      if(a.timer>20){a.timer=0;a.frame=(a.frame+1)%2;}
    }
  }

  // ── Sprite draw helpers ──────────────────────────────────────

  drawHexli(g, wx, wy, dir, frame) {
    // All coords relative to world space; we offset by cam
    const x=wx-this.camX, y=wy-this.camY;

    // Shadow
    g.fillStyle(0x000000,0.25);
    g.fillEllipse(x,y+14,28,10);

    // Tail
    const tailColor=C.hexliPoint;
    g.lineStyle(3,tailColor);
    if(dir===2){g.beginPath();g.moveTo(x+10,y+5);g.lineTo(x+22,y+1);g.lineTo(x+18,y-10);g.strokePath();}
    else if(dir===3){g.beginPath();g.moveTo(x-10,y+5);g.lineTo(x-22,y+1);g.lineTo(x-18,y-10);g.strokePath();}
    else{g.beginPath();g.moveTo(x+(frame?12:10),y+3);g.lineTo(x+20,y-2);g.lineTo(x+14,y-12);g.strokePath();}

    // Body
    g.fillStyle(C.hexliBody);g.fillEllipse(x,y,26,32);
    // White chest
    g.fillStyle(C.hexliWhite);g.fillEllipse(x,y+4,14,20);

    // Legs
    g.fillStyle(C.hexliBody);
    const l1 = frame===0?3:0, l2 = frame===1?3:0;
    g.fillRect(x-10,y+12,5,8+l1);g.fillRect(x+5,y+12,5,8+l2);
    g.fillStyle(C.hexliWhite);
    g.fillRect(x-10,y+18,5,2);g.fillRect(x+5,y+18,5,2);

    // Head
    g.fillStyle(C.hexliBody);g.fillEllipse(x,y-14,22,20);
    // White face
    g.fillStyle(C.hexliWhite);g.fillEllipse(x,y-12,14,14);

    // Ears
    g.fillStyle(C.hexliPoint);
    g.fillTriangle(x-9,y-20,x-13,y-30,x-4,y-22);
    g.fillTriangle(x+9,y-20,x+13,y-30,x+4,y-22);

    // Eyes
    if(dir!==1){
      g.fillStyle(C.hexliEye);
      g.fillEllipse(x-4,y-14,6,7);g.fillEllipse(x+4,y-14,6,7);
      g.fillStyle(0x1a3a5a);
      g.fillCircle(x-4,y-14,2);g.fillCircle(x+4,y-14,2);
      g.fillStyle(0xffffff);
      g.fillRect(x-5,y-16,1,1);g.fillRect(x+3,y-16,1,1);
    } else {
      g.fillStyle(C.hexliEye);
      g.fillRect(x-5,y-16,4,2);g.fillRect(x+2,y-16,4,2);
    }

    // Nose
    g.fillStyle(C.hexliNose);g.fillEllipse(x,y-10,4,3);

    // Whiskers
    g.lineStyle(1,0xffffff,0.8);
    g.lineBetween(x-2,y-10,x-14,y-12);g.lineBetween(x-2,y-10,x-14,y-8);
    g.lineBetween(x+2,y-10,x+14,y-12);g.lineBetween(x+2,y-10,x+14,y-8);
  }

  drawNPCCat(g, wx, wy, body, point, frame, name) {
    const x=wx-this.camX, y=wy-this.camY;
    const sc=0.7;

    g.fillStyle(0x000000,0.2);g.fillEllipse(x,y+14*sc,20*sc,8*sc);

    // Tail
    g.lineStyle(3,point);
    g.beginPath();g.moveTo(x+8*sc,y+3*sc);g.lineTo(x+18*sc,y-2*sc);g.lineTo(x+12*sc,y-14*sc);g.strokePath();

    // Body
    g.fillStyle(body);g.fillEllipse(x,y,20*sc,26*sc);

    // Legs
    g.fillStyle(body);
    const l1=frame===0?2:0,l2=frame===1?2:0;
    g.fillRect(x-8*sc,y+10*sc,4*sc,6*sc+l1);
    g.fillRect(x+4*sc,y+10*sc,4*sc,6*sc+l2);

    // Head
    g.fillStyle(body);g.fillEllipse(x,y-12*sc,18*sc,16*sc);

    // Ears
    g.fillStyle(point);
    g.fillTriangle(x-7*sc,y-17*sc,x-10*sc,y-25*sc,x-3*sc,y-19*sc);
    g.fillTriangle(x+7*sc,y-17*sc,x+10*sc,y-25*sc,x+3*sc,y-19*sc);

    // Eyes
    g.fillStyle(0x88dd88);
    g.fillEllipse(x-3*sc,y-12*sc,5*sc,6*sc);g.fillEllipse(x+3*sc,y-12*sc,5*sc,6*sc);
    g.fillStyle(0x1a2a1a);
    g.fillCircle(x-3*sc,y-12*sc,1.5*sc);g.fillCircle(x+3*sc,y-12*sc,1.5*sc);

    // Name label (draw via DOM-overlay or just skip — we'll use Phaser text)
    if(name && this._npcTexts) {
      const txt=this._npcTexts[name];
      if(txt){txt.setPosition(x,y-28*sc);}
    }
  }

  drawBird(g, wx, wy, frame) {
    const x=wx-this.camX, y=wy-this.camY;
    g.fillStyle(0xcc6633);g.fillEllipse(x,y,10,6);
    g.fillStyle(0x882200);g.fillEllipse(x+6,y-1,6,4);
    const wingY=frame===0?-4:2;
    g.fillStyle(0xcc6633);g.fillEllipse(x-4,y+wingY,10,4);
  }

  drawButterfly(g, wx, wy, frame, color) {
    const x=wx-this.camX, y=wy-this.camY;
    const spread=frame===0?1:0.5;
    g.fillStyle(color);
    g.fillEllipse(x-5*spread,y-3,10*spread,8);
    g.fillEllipse(x+5*spread,y-3,10*spread,8);
    g.fillStyle(0x333333);g.fillRect(x-1,y-6,2,8);
  }

  drawCollectible(g, wx, wy, type, bob) {
    const x=wx-this.camX, y=wy-this.camY+Math.sin(bob)*3;
    switch(type){
      case 'yarn_pink':
        g.fillStyle(C.yarnPink);g.fillCircle(x,y,7);
        g.lineStyle(1.5,0xc06080);
        g.beginPath();g.arc(x,y,5,0.3,Math.PI*1.8);g.strokePath();
        g.beginPath();g.arc(x,y,3,Math.PI,Math.PI*2.8);g.strokePath();
        break;
      case 'yarn_blue':
        g.fillStyle(C.yarnBlue);g.fillCircle(x,y,7);
        g.lineStyle(1.5,0x2060d0);
        g.beginPath();g.arc(x,y,5,0.3,Math.PI*1.8);g.strokePath();
        break;
      case 'feather':
        g.lineStyle(2,C.feather);
        g.lineBetween(x,y+8,x,y-14);
        g.beginPath();g.moveTo(x,y-14);g.lineTo(x+6,y-8);g.lineTo(x,y+8);g.strokePath();
        break;
      case 'mouse':
        g.fillStyle(C.mouseToy);
        g.fillEllipse(x,y+2,10,14);g.fillEllipse(x,y-5,8,8);
        g.fillStyle(0xaaaaaa);g.fillCircle(x-3,y-8,2);g.fillCircle(x+3,y-8,2);
        g.lineStyle(1,0x888888);g.lineBetween(x,y+9,x,y+16);
        break;
      case 'bell':
        g.fillStyle(C.bell);
        g.beginPath();g.arc(x,y,7,Math.PI,Math.PI*2);g.closePath();g.fillPath();
        g.fillRect(x-7,y,14,5);
        g.fillStyle(0xc0a020);g.fillCircle(x,y,2);
        break;
    }
  }

  drawStringLights(g, x1, y1, x2, y2) {
    const colors=[0xff4444,0x44ff44,0x4444ff,0xffff44,0xff44ff,0x44ffff];
    const num=Math.floor(Math.sqrt((x2-x1)**2+(y2-y1)**2)/20);
    // wire
    g.lineStyle(1,0x444444);
    g.beginPath();g.moveTo(x1,y1);
    for(let i=0;i<=num;i++){
      const t=i/num;
      g.lineTo(x1+(x2-x1)*t, y1+(y2-y1)*t+Math.sin(t*Math.PI)*8);
    }
    g.strokePath();
    // bulbs
    for(let i=0;i<=num;i++){
      const t=i/num;
      const mx=x1+(x2-x1)*t;
      const my=y1+(y2-y1)*t+Math.sin(t*Math.PI)*8;
      const col=colors[(i+Math.floor(this.tick/30))%colors.length];
      g.fillStyle(col,1);g.fillCircle(mx,my,3);
    }
  }

  drawDynamicDecor(g) {
    const id=this.currentRoom;
    const cx=this.camX,cy=this.camY;
    if(id==='dining'){
      const W=this.rooms.dining.W;
      this.drawStringLights(g, TILE-cx, TILE+8-cy, (W-1)*TILE-cx, TILE+8-cy);
    }
    if(id==='living'){
      const W=this.rooms.living.W;
      this.drawStringLights(g, TILE-cx, TILE+6-cy, (W-1)*TILE-cx, TILE+6-cy);
    }
    if(id==='kitchen'){
      const W=this.rooms.kitchen.W;
      this.drawStringLights(g, TILE-cx, TILE+6-cy, (W-1)*TILE-cx, TILE+6-cy);
    }
  }

  update(time, delta) {
    this.tick++;

    // Updates
    this.movePlayer(delta);
    this.checkDoors();
    this.updateTransition();
    this.updateNPCs();
    this.updateAmbients();
    this.checkCollectibles();
    this.checkInteract();
    if(this.dialogTimer>0){this.dialogTimer--;if(this.dialogTimer===0)this.hideDialog();}
    this.updateCamera();

    const room=this.rooms[this.currentRoom];
    const cx=this.camX, cy=this.camY;

    // Position room image
    this.roomImage.setPosition(-cx,-cy);

    // ── Dynamic decorations (string lights) ──────────────────
    this.dynamicG.clear();
    this.drawDynamicDecor(this.dynamicG);

    // ── Ambients ──────────────────────────────────────────────
    this.ambientG.clear();
    for(const a of this.ambients){
      if(a.room!==this.currentRoom) continue;
      if(a.type==='bird') this.drawBird(this.ambientG,a.x,a.y,a.frame);
      else this.drawButterfly(this.ambientG,a.x,a.y,a.frame,a.color);
    }

    // ── Collectibles ──────────────────────────────────────────
    this.collectG.clear();
    for(const c of this.collectibles){
      if(c.collected||c.room!==this.currentRoom) continue;
      this.drawCollectible(this.collectG,c.x,c.y,c.type,this.tick*0.05);
    }

    // ── NPCs ──────────────────────────────────────────────────
    this.npcG.clear();
    const visNPCs=this.npcs.filter(n=>n.room===this.currentRoom).sort((a,b)=>a.y-b.y);
    for(const npc of visNPCs)
      this.drawNPCCat(this.npcG,npc.x,npc.y,npc.body,npc.point,npc.frame,npc.name);

    // NPC name text objects (lazy init)
    if(!this._npcTexts) {
      this._npcTexts={};
      for(const npc of this.npcs){
        const t=this.add.text(0,0,npc.name,{
          fontFamily:'Georgia,serif',fontSize:'11px',
          color:'#ffffff',stroke:'#000000',strokeThickness:3,
        }).setOrigin(0.5,1).setDepth(10);
        this._npcTexts[npc.name]=t;
      }
    }
    // Show/hide and reposition
    for(const npc of this.npcs){
      const t=this._npcTexts[npc.name];
      if(!t) continue;
      if(npc.room!==this.currentRoom){t.setVisible(false);continue;}
      t.setVisible(true).setPosition(npc.x-cx, npc.y-cy-26);
    }

    // ── Player ────────────────────────────────────────────────
    this.playerG.clear();
    this.drawHexli(this.playerG,this.player.x,this.player.y,this.player.dir,this.player.frame);

    // Depths
    this.roomImage.setDepth(-1);
    this.dynamicG.setDepth(0);
    this.ambientG.setDepth(1);
    this.collectG.setDepth(2);
    this.npcG.setDepth(3);
    this.playerG.setDepth(4);
    this.fadeRect.setDepth(50);
  }
}

// ── Boot config ───────────────────────────────────────────────
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: GameScene,
  render: {
    pixelArt: false,
    antialias: true,
  },
};

new Phaser.Game(config);
