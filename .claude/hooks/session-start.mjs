// SessionStart フック。
// - 依存が無ければ導入（web セッション等で素の clone の場合の保険）。
// - 簡易ブリーフを stdout に出す（SessionStart の stdout は context に追加される）。
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

try {
  if (!existsSync('node_modules')) {
    try {
      execSync('npm ci', { stdio: 'ignore' });
    } catch {
      try {
        execSync('npm install', { stdio: 'ignore' });
      } catch {
        /* オフライン等は黙って続行 */
      }
    }
  }
} catch {
  /* no-op */
}

process.stdout.write(
  'nigoh — Astro+Tailwind+React island+Phaser 装飾の個人サイト。デザイン言語: ロシア構成主義' +
    '(red #D62828 / black #1A1A1A / cream #F5F0EB)。視覚/設計は `designer` サブエージェント、実装は' +
    ' `frontend` サブエージェントへ。詳細は CLAUDE.md と specs/。\n'
);
