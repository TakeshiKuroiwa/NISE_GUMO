# コントリビュートガイド

NISE_GUMO へのコントリビュートに関心を持っていただきありがとうございます。
このプロジェクトは現在モックアップ段階のため、UI/UX、要件整理、ドキュメント、モックデータ、将来のRustバックエンド連携に関する改善を歓迎します。

---

## 行動規範

このプロジェクトは [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) に従います。参加する前に確認してください。

---

## コントリビュート対象

- バグ報告
- 機能提案
- UI/UX改善
- ドキュメント改善
- React/TypeScript実装の改善
- Rust/Axumバックエンドの改善
- Tauri、PostgreSQL、Supabase連携に向けた設計提案

---

## 開発環境のセットアップ

```bash
git clone https://github.com/TakeshiKuroiwa/NISE_GUMO.git
cd NISE_GUMO

cd nise_gumo_mock/frontend
npm install
cd ../..

npm run dev
```

バックエンドを確認する場合:

```bash
npm run backend
```

---

## ブランチ戦略

| ブランチ名 | 用途 |
|------------|------|
| `master` | 安定版 |
| `feature/xxx` | 新機能・画面追加 |
| `fix/xxx` | バグ修正 |
| `docs/xxx` | ドキュメント更新 |
| `chore/xxx` | 設定・依存関係・補助作業 |

---

## コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/) を推奨します。

```text
<type>(<scope>): <要約>
```

例:

```text
feat(editor): Monaco Editor のテーマ切替を追加
fix(schedule): 月末日の予定表示を修正
docs(readme): セットアップ手順を更新
```

---

## Pull Request の手順

1. 既存Issueを確認する
2. 必要に応じてIssueを作成する
3. 作業ブランチを作成する
4. 実装、ドキュメント、必要な確認を行う
5. `npm run build` が通ることを確認する
6. PRテンプレートに沿ってPull Requestを作成する

---

## コードスタイル

- 既存のReact/TypeScript構成とCSS命名に合わせる
- 画面はモックとして操作できる状態を優先する
- 状態管理は既存のZustandストア、または既存APIクライアントのモックフォールバックを活用する
- 不要な大規模リファクタリングは避ける

---

## テストと確認

```bash
npm run build
```

現在はフロントエンドのビルド確認を主な最低ラインにしています。バックエンドは依存crateの取得が必要なため、ネットワーク環境が整っている状態で確認してください。

---

## 質問

仕様判断に迷う場合は、Issueで背景、候補、推奨案を添えて相談してください。
