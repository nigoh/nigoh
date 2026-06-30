// SubagentStop フック: サブエージェント終了時、作業ツリーに src 等の変更があるときだけ
// `astro check` を自動実行する。失敗なら exit 2 で終了を差し戻し、エラーをエージェントに渡して
// 修正させる。`stop_hook_active` で無限ループを防ぐ。
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let data = {};
try {
  data = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

// 既にフック起因の継続中なら再ブロックしない（ループ防止）
if (data.stop_hook_active) process.exit(0);

// 検証対象の変更があるかを確認（無ければ素通り）
let changed = '';
try {
  changed = execSync('git status --porcelain', { encoding: 'utf8' });
} catch {
  process.exit(0); // git 管理外なら何もしない
}

const files = changed
  .split('\n')
  .map((l) => l.slice(3).trim())
  .filter(Boolean);
const verifyTargets =
  /^(src\/|astro\.config|tsconfig|tailwind\.config|package\.json)/;
if (!files.some((f) => verifyTargets.test(f))) process.exit(0);

try {
  execSync('npx astro check', { stdio: 'pipe', encoding: 'utf8' });
  process.exit(0);
} catch (e) {
  const out = ((e.stdout || '') + (e.stderr || '')).slice(-4000);
  process.stderr.write(
    'SubagentStop: `astro check` が失敗しました。終了前に修正してください:\n' + out + '\n'
  );
  process.exit(2);
}
