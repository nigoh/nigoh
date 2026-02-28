# Copilot Project Instructions

## プロジェクト概要
H.Nigo の個人自己紹介サイト。Astro + Tailwind CSS + TypeScript で構築。

## 技術スタック
- **フレームワーク**: Astro 5.x（静的サイトジェネレーター）
- **CSS**: Tailwind CSS 3.x（ユーティリティファースト）
- **言語**: TypeScript（strict モード）
- **デプロイ**: GitHub Pages (`https://nigoh.github.io/nigoh/`)

## ディレクトリ構造
```
src/
├── components/   # 再利用可能な Astro コンポーネント
├── layouts/      # ページレイアウト
├── pages/        # ファイルベースルーティング
└── styles/       # グローバル CSS
public/           # 静的ファイル（favicon 等）
specs/            # SDD 仕様書
```

## コーディング規約
- コンポーネント名は PascalCase（例: `Header.astro`）
- props は Astro の `interface Props` で型定義する
- `import.meta.env.BASE_URL` で base パスを参照する
- Tailwind のユーティリティクラスを使い、カスタム CSS は最小限にする
- セマンティック HTML を使用する

## CC-SDD ワークフロー
1. 新機能・変更は `specs/` の仕様書を先に確認・更新する
2. 仕様に沿って実装する
3. 受入条件をチェックリストとして検証する

## 言語
- コード内のコメントは日本語 OK
- コミットメッセージは英語
- 仕様書は日本語
