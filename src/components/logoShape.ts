// nigoh のロゴの形（Logo.astro と、砂のロゴ SandLogo の下絵で共有する）。
// 文字は Outfit（SIL Open Font License 1.1）600 の字形（n・ı・g・o・h）をアウトライン化したもの。
// i の点の位置がティールのコンセント、h の右上のコーラルの点からケーブルが伸び、プラグがコンセントの手前まで来ている。
export const LOGO_VIEWBOX = '20 -990 2650 1220';
export const LOGO_ASPECT = 2650 / 1220;
export const GLYPHS_D =
  'M383 0V-277Q383 -320 356 -347Q329 -374 286 -374Q258 -374 236 -362Q214 -350 201.5 -328Q189 -306 189 -277L138 -303Q138 -360 162.5 -402.5Q187 -445 230.5 -469Q274 -493 329 -493Q382 -493 424 -466.5Q466 -440 490 -397.5Q514 -355 514 -306V0ZM58 0V-483H189V0Z M620 0V-483H751V0Z M1069 214Q992 214 933 186.5Q874 159 839 109L922 26Q950 59 984.5 76.5Q1019 94 1068 94Q1129 94 1164.5 63Q1200 32 1200 -23V-144L1222 -250L1201 -356V-483H1331V-25Q1331 47 1297.5 100.5Q1264 154 1205 184Q1146 214 1069 214ZM1063 -13Q998 -13 946 -44.5Q894 -76 864.5 -131Q835 -186 835 -254Q835 -322 864.5 -376Q894 -430 946 -461.5Q998 -493 1063 -493Q1117 -493 1158.5 -472Q1200 -451 1224 -414.5Q1248 -378 1250 -329V-177Q1248 -129 1223.5 -91.5Q1199 -54 1157.5 -33.5Q1116 -13 1063 -13ZM1089 -132Q1125 -132 1151.5 -147.5Q1178 -163 1193 -190.5Q1208 -218 1208 -253Q1208 -289 1193 -316Q1178 -343 1151.5 -358.5Q1125 -374 1089 -374Q1053 -374 1026 -358.5Q999 -343 984 -315.5Q969 -288 969 -253Q969 -219 984 -191.5Q999 -164 1026 -148Q1053 -132 1089 -132Z M1673 10Q1600 10 1541.5 -23.5Q1483 -57 1448.5 -114.5Q1414 -172 1414 -243Q1414 -314 1448 -370.5Q1482 -427 1541 -460.5Q1600 -494 1672 -494Q1746 -494 1804.5 -460.5Q1863 -427 1897 -370.5Q1931 -314 1931 -243Q1931 -172 1897 -114.5Q1863 -57 1804.5 -23.5Q1746 10 1673 10ZM1672 -112Q1709 -112 1737.5 -128.5Q1766 -145 1781.5 -174.5Q1797 -204 1797 -242Q1797 -280 1781 -309Q1765 -338 1737 -354.5Q1709 -371 1672 -371Q1636 -371 1608 -354.5Q1580 -338 1564 -309Q1548 -280 1548 -242Q1548 -204 1564 -174.5Q1580 -145 1608 -128.5Q1636 -112 1672 -112Z M2340 0V-277Q2340 -320 2313 -347Q2286 -374 2243 -374Q2215 -374 2193 -362Q2171 -350 2158.5 -328Q2146 -306 2146 -277L2095 -303Q2095 -360 2119 -402.5Q2143 -445 2185.5 -469Q2228 -493 2283 -493Q2338 -493 2380.5 -469Q2423 -445 2447 -403Q2471 -361 2471 -306V0ZM2015 0V-723H2146V0Z';
export const OUTLET = { cx: 685.5, cy: -635.5, r: 73.8 };
/** コンセントの穴とプラグの向き（プラグが来る向きに傾ける） */
export const OUTLET_TRANSFORM = 'translate(685.5 -635.5) rotate(148.3)';
export const SLOTS = [
  { x: -26.5, y: 26.15, width: 53, height: 29, rx: 6 },
  { x: -26.5, y: -55.15, width: 53, height: 29, rx: 6 },
];
export const CABLE_D = 'M2590 -635.5C2390 -635.5 2330 -935 2000 -935C1500 -935 1122.9 -905.6 952.7 -800.6';
export const ORIGIN = { cx: 2590, cy: -635.5, r: 39.2 };
export const PLUG_TRANSFORM = 'translate(791.1 -700.7) rotate(148.3)';
export const PLUG_PARTS = [
  { x: -87, y: 25.15, width: 87, height: 31, rx: 6 },
  { x: -87, y: -56.15, width: 87, height: 31, rx: 6 },
  { x: -190, y: -83.6, width: 103.4, height: 167.2, rx: 22 },
];

type Rect = { x: number; y: number; width: number; height: number; rx: number };
const rect = (r: Rect, fill = ''): string =>
  `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}"${fill ? ` fill="${fill}"` : ''}/>`;

/** 色を直に書いた、単独で描ける SVG（砂のロゴの下絵用。表示には使わない） */
export function logoSvg(teal: string, coral: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">` +
    `<defs><mask id="m" maskUnits="userSpaceOnUse" x="20" y="-990" width="2650" height="1220">` +
    `<rect x="20" y="-990" width="2650" height="1220" fill="#fff"/>` +
    `<g transform="${OUTLET_TRANSFORM}" fill="#000">${SLOTS.map((r) => rect(r)).join('')}</g></mask></defs>` +
    `<g fill="${teal}"><path d="${GLYPHS_D}"/><circle cx="${OUTLET.cx}" cy="${OUTLET.cy}" r="${OUTLET.r}" mask="url(#m)"/></g>` +
    `<path d="${CABLE_D}" fill="none" stroke="${coral}" stroke-width="50" stroke-linecap="round"/>` +
    `<circle cx="${ORIGIN.cx}" cy="${ORIGIN.cy}" r="${ORIGIN.r}" fill="${coral}"/>` +
    `<g transform="${PLUG_TRANSFORM}" fill="${coral}">${PLUG_PARTS.map((r) => rect(r)).join('')}</g>` +
    `</svg>`
  );
}
