# コントリビュートガイド

まずはコントリビュートに興味を持っていただきありがとうございます！🎉  
このガイドを読んで、スムーズに参加できるようにしてください。

---

## 📋 目次

- [行動規範](#行動規範)
- [どんなコントリビュートができる？](#どんなコントリビュートができる)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [ブランチ戦略](#ブランチ戦略)
- [コミットメッセージのルール](#コミットメッセージのルール)
- [プルリクエストの手順](#プルリクエストの手順)
- [コードスタイル](#コードスタイル)
- [テスト](#テスト)

---

## 行動規範

このプロジェクトは [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) に従います。  
参加する前に必ずお読みください。

---

## どんなコントリビュートができる？

- 🐛 **バグ報告** — Issue を作成してください
- 💡 **機能提案** — Discussionsで議論してから Issue へ
- 📖 **ドキュメント改善** — typo修正も大歓迎！
- 🔧 **バグ修正・機能実装** — Issue を確認してから PR を

---

## 開発環境のセットアップ

```bash
# 1. リポジトリをフォーク & クローン
git clone https://github.com/YOUR_USERNAME/repo.git
cd repo

# 2. upstream を登録
git remote add upstream https://github.com/username/repo.git

# 3. 依存関係をインストール
npm install

# 4. 環境変数を設定
cp .env.example .env

# 5. テストが通ることを確認
npm test
```

---

## ブランチ戦略

| ブランチ名 | 用途 |
|------------|------|
| `main` | 本番リリース |
| `develop` | 開発の統合ブランチ |
| `feature/xxx` | 新機能 |
| `fix/xxx` | バグ修正 |
| `docs/xxx` | ドキュメント更新 |

```bash
# 作業ブランチの作成
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

---

## コミットメッセージのルール

[Conventional Commits](https://www.conventionalcommits.org/ja/) に従います。

```
<type>(<scope>): <要約>

<本文（任意）>

<フッター（任意）>
```

### type の種類

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの意味に影響しない変更（フォーマットなど） |
| `refactor` | リファクタリング |
| `test` | テストの追加・修正 |
| `chore` | ビルドプロセスや補助ツールの変更 |

### 例

```
feat(auth): Googleログインを追加

OAuthを使ったGoogleログインを実装した。
既存のメールログインと共存可能。

Closes #42
```

---

## プルリクエストの手順

1. Issue が存在しない場合はまず Issue を作成する
2. フォークして作業ブランチを切る
3. コードを書く・テストを追加する
4. `npm test` が通ることを確認する
5. PR を `develop` ブランチへ向けて作成する
6. PR テンプレートをすべて記入する
7. レビューを待つ（通常 3〜5 営業日以内）

### PR のルール

- 1 PR = 1 つの目的（複数の変更を混ぜない）
- スクリーンショットや動画があると助かります
- レビューコメントには 48 時間以内に返信してください

---

## コードスタイル

ESLint + Prettier を使用しています。コミット前に自動チェックが走ります。

```bash
# 手動でフォーマット
npm run format

# リントチェック
npm run lint
```

---

## テスト

```bash
# ユニットテスト
npm test

# カバレッジレポート
npm run test:coverage

# E2E テスト
npm run test:e2e
```

PR にはテストを含めてください。カバレッジが下がる PR はマージできません。

---

## ❓ 質問がある場合

- GitHub Discussions で質問する
- Issue にコメントする

ありがとうございます！あなたのコントリビュートを楽しみにしています 🙌
