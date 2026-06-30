# AI エージェント steering 設計仕様

> 出典の原則: [Steering Claude Code — skills, hooks, rules, subagents, and more](https://claude.com/ja/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
> 本書は、当リポジトリ向けに **デザイナー / フロントエンドの2 subagent** を中心とした steering 構成を定義する SDD 仕様。

## 目的

このサイトの開発を、役割の異なる2体の AI エージェントで駆動する。
記事の中心原則「**各関心事を、必要な制御が得られる最も安い機構に割り当てる**」に従い、
subagent 単体ではなく、それを信頼できるものにする周辺 steering（CLAUDE.md / skills / hooks）まで含めて設計する。

> 副次的意図: サイトが掲げる「Issue → AI が実装 → PR」という AI 駆動開発を、
> デザイナー（意図）→ フロントエンド（実装）の受け渡しとして**自己言及的に体現**する。

## 関心事 → 機構のマッピング

| 機構 | 配置 | 担当する関心事 | なぜこの機構か |
|------|------|----------------|----------------|
| ルート CLAUDE.md | `CLAUDE.md` | スタック・コマンド・レイアウト・デザイン言語の要点・2エージェントの分担 | 不変の前提＝常時ロード。薄く（<120 行） |
| デザイナー subagent | `.claude/agents/designer.md` | 視覚設計・トークン・構図・視覚 a11y を**決める** | 中間試行が多く要約だけ返す専門作業 |
| フロントエンド subagent | `.claude/agents/frontend.md` | 仕様・トークンを**実装・最適化・検証** | 同上。実装ノイズを隠す |
| design-review skill | `.claude/skills/design-review/` | コントラスト・パレット遵守・レスポンシブ・reduced-motion の手順 | 手続き的ワークフロー |
| frontend-verify skill | `.claude/skills/frontend-verify/` | `astro check` → `build` → 受入検証の手順 | 同上。明示呼び出しで安い |
| hooks | `.claude/settings.json` + `.claude/hooks/` | ① `git push` ブロック ② 生成物編集ブロック ③ SessionStart 依存確認 ④ SubagentStop で `astro check` 自動実行 | 「絶対するな / 毎回する」は決定論機構の領分 |
| path-scoped rules | `.github/instructions/*`（既存を流用） | ファイル種別ごとの規約（astro/ts/css/specs） | 重複生成は反パターン。Copilot と単一ソース共有 |

## 2エージェントの責務（決定 × 実装で非対称に割る）

### デザイナー (`designer`)
- **決める**: ロシア構成主義デザイン言語、デザイントークン（色 / タイポ / 余白）、構図、
  Tiled+Phaser 装飾の美学、視覚的アクセシビリティ（コントラスト AA）。
- **成果物**: `specs/**` の「デザイン指針 / 受入条件」更新、必要なら `prototypes/` の軽い HTML/SVG。
- **やらない**: 本番 Astro/React/TS の実装（フロントへ委譲）、`git push`。

### フロントエンド (`frontend`)
- **作る**: Astro コンポーネント、React island、Tailwind、TypeScript(strict)、
  パフォーマンス（Lighthouse・遅延ロード・island 化）、マークアップ a11y、`astro check`/build 検証。
- **成果物**: 仕様を満たすコード + 通る検証 + 受入条件の充足。
- **やらない**: デザイン言語の再定義（デザイナーの領分）、生成物の直接編集、`git push`。

## 受け渡しプロトコル

```
designer  ──[spec のデザイン指針 + トークン + design-review チェック結果]──▶  frontend
frontend  ──[実装 + frontend-verify 結果 + 受入条件の充足]──▶  designer / main で確認
```

## 決定論ガード（hooks）

1. **PreToolUse (Bash)**: 危険な push を遮断（exit 2）= force-push（`--force-with-lease` は許可）と
   master/main への直 push。push 全面禁止はメインの正規フローも止めるため不採用。エージェントの
   「push しない」は `agents/*.md` のプロンプト規則で担保（PreToolUse はメイン/サブを区別できない）。
2. **PreToolUse (Edit/Write/NotebookEdit)**: `dist/`・`.astro/`・`node_modules/`・
   `public/tilemaps/*.json`（生成物）への編集をブロック。ソースを編集して再生成させる。
3. **SessionStart**: `node_modules` が無ければ依存導入し、簡易ブリーフを context に出す。
4. **SubagentStop**: 作業ツリーに `src/` 等の変更があるときだけ `astro check` を自動実行。
   失敗なら exit 2 で停止を差し戻し、エラーをエージェントに渡して修正させる
   （`stop_hook_active` でループ防止）。

## ディレクトリ構成（新規）

```
CLAUDE.md
.claude/
├── agents/{designer,frontend}.md
├── skills/{design-review,frontend-verify}/SKILL.md
├── hooks/{pretooluse-guard,session-start,subagentstop-verify}.mjs
└── settings.json
specs/agents.spec.md
```

## 受入条件

- [x] `.claude/agents/` に designer / frontend の2 subagent が存在し、frontmatter が妥当
- [x] 2体の責務が「決定 × 実装」で非対称に分かれ、description が誤発火しにくい
- [x] ルート CLAUDE.md が <120 行で、path-scoped rules を重複させていない（`.github/instructions/*` を参照）
- [x] design-review / frontend-verify skill が手続きとして成立している
- [x] PreToolUse フックが危険な push（force/master）と生成物編集を実際にブロックする（11/11 サンプル検証）
- [x] SubagentStop フックが src 変更時のみ `astro check` を回し、失敗で差し戻す（ループ防止ガード検証）
- [x] `astro check` でエラーがない
