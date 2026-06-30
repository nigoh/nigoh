// PreToolUse 決定論ガード。
// - Bash: `git push` をブロック（エージェントは push しない）
// - Edit/Write/NotebookEdit: 生成物・ビルド成果への編集をブロック
// stdin の JSON を読み、ブロック時は exit 2 + stderr（Claude に差し戻される）。
import { readFileSync } from 'node:fs';

let data = {};
try {
  data = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0); // 解釈不能なら素通り（フックでツールを壊さない）
}

const tool = data.tool_name || '';
const input = data.tool_input || {};

function block(msg) {
  process.stderr.write(msg + '\n');
  process.exit(2);
}

if (tool === 'Bash') {
  const cmd = String(input.command || '');
  // PreToolUse はメイン/サブエージェントを区別できないため、push 全面禁止はメインの正規フローも
  // 止めてしまう。決定論ガードは「危険な push」に限定し、エージェントの「push しない」は
  // agents/*.md のプロンプト規則で担保する。
  // コマンドを区切りで分割し、`git push` を含むセグメントだけを検査する
  // （コミットメッセージ等に "push"/"master" が含まれても誤検知しない）。
  const segments = cmd.split(/&&|\|\||[;|\n]/);
  for (const seg of segments) {
    if (!/\bgit\s+push\b/.test(seg)) continue;
    if (/(--force(?!-with-lease)\b|(^|\s)-f(\s|$))/.test(seg)) {
      block('Blocked: force push は禁止です。履歴を壊さない --force-with-lease を使ってください。');
    }
    if (/\b(master|main)\b/.test(seg)) {
      block(
        'Blocked: master/main への直接 push は禁止です。フィーチャーブランチへ push し、PR でマージしてください。'
      );
    }
  }
  process.exit(0);
}

if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') {
  const raw = String(input.file_path || input.notebook_path || '');
  const rel = raw.replace(process.cwd() + '/', '');
  const blocked = [
    /(^|\/)dist\//,
    /(^|\/)\.astro\//,
    /(^|\/)node_modules\//,
    /(^|\/)public\/tilemaps\/[^/]+\.json$/, // Tiled 生成物
  ];
  if (blocked.some((re) => re.test(rel))) {
    block(
      `Blocked: "${rel}" は生成物/ビルド成果です。直接編集せず、ソース（assets/tiled の生成スクリプト等）を` +
        '編集して再生成してください。'
    );
  }
  process.exit(0);
}

process.exit(0);
