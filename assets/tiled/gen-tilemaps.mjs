import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'public/tilemaps';
mkdirSync(OUT, { recursive: true });

// gid: 1 redSquare,2 blackSquare,3 hollowSquare,4 circle,5 arc,6 diagonal,7 barV,8 barH,9 dot
const W = 14;
const H = 7;

function blank() {
  return Array.from({ length: W * H }, () => 0);
}
function put(data, c, r, gid) {
  if (c >= 0 && c < W && r >= 0 && r < H) data[r * W + c] = gid;
}

const seeds = {
  // Hero: 赤い正方形を主役に、円と斜線で運動感（About Two Squares 的）
  hero(d) {
    put(d, 2, 1, 1); put(d, 3, 1, 6); put(d, 5, 2, 4);
    put(d, 9, 1, 1); put(d, 11, 2, 6); put(d, 10, 4, 9);
    put(d, 3, 4, 9); put(d, 6, 5, 1); put(d, 8, 3, 5);
  },
  // About: 黒い力線（縦横バー + 斜線）を控えめに
  about(d) {
    put(d, 2, 2, 7); put(d, 3, 2, 8); put(d, 4, 1, 6);
    put(d, 10, 3, 2); put(d, 11, 4, 6); put(d, 7, 5, 9);
  },
  // Skills: 中空正方形が積み上がる（グリッド構築）
  skills(d) {
    for (let c = 2; c <= 5; c++) put(d, c, 4, 3);
    for (let c = 3; c <= 5; c++) put(d, c, 3, 3);
    put(d, 4, 2, 1); put(d, 9, 4, 3); put(d, 10, 4, 1);
    put(d, 11, 2, 9); put(d, 8, 2, 8);
  },
  // AI: 赤クラスタと黒クラスタ（2体エージェントの協調を示唆）
  ai(d) {
    put(d, 2, 2, 1); put(d, 3, 2, 1); put(d, 2, 3, 4); put(d, 3, 3, 9);
    put(d, 10, 3, 2); put(d, 11, 3, 2); put(d, 10, 4, 4); put(d, 11, 4, 9);
    put(d, 6, 3, 6); put(d, 7, 3, 6);
  },
  // Career: 縦の力線（時系列の帯）
  career(d) {
    put(d, 2, 1, 7); put(d, 2, 5, 9);
    put(d, 6, 0, 7); put(d, 6, 6, 1);
    put(d, 10, 1, 7); put(d, 10, 5, 4);
    put(d, 4, 3, 6); put(d, 8, 3, 6);
  },
  // Portfolio: 中空正方形のリズム
  portfolio(d) {
    put(d, 2, 2, 3); put(d, 4, 3, 3); put(d, 6, 2, 3);
    put(d, 9, 3, 3); put(d, 11, 2, 3); put(d, 7, 5, 9); put(d, 3, 5, 8);
  },
  // Contact: 大円の気配 + 単一の赤四角（静）
  contact(d) {
    put(d, 7, 3, 4); put(d, 5, 2, 9); put(d, 9, 4, 9); put(d, 6, 5, 1);
  },
};

function tiledMap(data) {
  return {
    compressionlevel: -1,
    width: W,
    height: H,
    tilewidth: 48,
    tileheight: 48,
    infinite: false,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    type: 'map',
    version: '1.10',
    nextlayerid: 2,
    nextobjectid: 1,
    layers: [
      {
        id: 1,
        name: 'seed',
        type: 'tilelayer',
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: W,
        height: H,
        data,
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: 'constructivist',
        tilewidth: 48,
        tileheight: 48,
        tilecount: 9,
        columns: 9,
        image: 'constructivist-tileset.png',
        imagewidth: 432,
        imageheight: 48,
      },
    ],
  };
}

for (const [name, fn] of Object.entries(seeds)) {
  const d = blank();
  fn(d);
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(tiledMap(d)) + '\n');
  console.log(`wrote ${OUT}/${name}.json`);
}
