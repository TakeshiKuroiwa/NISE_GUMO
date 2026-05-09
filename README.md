# NISE_GUMO

> カレンダー、WBSガント、コードエディタを統合したプロジェクト進捗管理アプリケーションのモックアップ

![Status](https://img.shields.io/badge/status-mockup-blue)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-3178c6)
![Backend](https://img.shields.io/badge/backend-Rust%20%2B%20Axum-000000)

---

## 概要

NISE_GUMO は、エンジニア、プロジェクトリーダー、システム管理者を対象にしたプロジェクト管理アプリケーションです。月次カレンダー、WBSベースの進捗確認、個人スケジュール、通知、VSCodeライクなコードエディタをひとつのワークスペースで扱えることを目指しています。

現在のリポジトリは完成モックアップ段階です。フロントエンドはローカルのモックデータで動作し、バックエンドが未起動でもログイン、ロール別画面、カレンダー、プロジェクト管理、Monaco Editor の表示を確認できます。

---

## 機能

- **ロール別ログイン**: エンジニア、プロジェクトリーダー、システム管理者のデモアカウントを用意
- **スケジュール画面**: 月次カレンダー、日別WBS、個人予定追加、通知バナーを表示
- **プロジェクト画面**: 参画中プロジェクト詳細、参画依頼、PL向けのWBS・招待・離脱操作モック
- **コードエディタ**: Monaco Editor によるVSCodeライクなファイルツリー、テーマ、フォントサイズ変更
- **管理画面**: ユーザー管理、PL権限譲渡、スコープ別通知作成のモック
- **プロフィール/設定**: 表示名、一言メッセージ、ログイン非通知、アカウント削除依頼の導線

---

## 技術スタック

| カテゴリ | 使用技術 |
|----------|----------|
| フロントエンド | React, TypeScript, React Router, Zustand |
| UI/エディタ | Monaco Editor, lucide-react, CSS |
| バックエンド | Rust, Axum |
| 将来DB | PostgreSQL / Supabase 想定 |
| 将来配布 | Tauri 想定 |

---

## クイックスタート

### 前提条件

- Node.js
- npm
- Rust toolchain（バックエンドを起動する場合）

### インストール

```bash
git clone https://github.com/TakeshiKuroiwa/NISE_GUMO.git
cd NISE_GUMO

cd nise_gumo_mock/frontend
npm install
cd ../..
```

### 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### デモアカウント

| ロール | ユーザー名 | パスワード |
|--------|------------|------------|
| エンジニア | `eng1` | 任意 |
| プロジェクトリーダー | `pl1` | 任意 |
| システム管理者 | `admin1` | 任意 |

---

## よく使うコマンド

```bash
# フロントエンド起動
npm run dev

# フロントエンドの本番ビルド
npm run build

# バックエンド起動
npm run backend
```

---

## ディレクトリ構成

```text
.
├── nise_gumo_mock/
│   ├── frontend/        # React + TypeScript モックUI
│   └── backend/         # Rust + Axum モックAPI
├── backend/             # Rust + Axum バックエンド
├── templates/           # GitHub公開用ドキュメントの元テンプレート
├── NISE_GUMO初期構想.md
├── 未決事項暫定案0509.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
├── README.md
└── package.json
```

---

## ドキュメント

- [初期構想](./NISE_GUMO初期構想.md)
- [未決事項 暫定案](./未決事項暫定案0509.md)
- [コントリビュートガイド](./CONTRIBUTING.md)
- [行動規範](./CODE_OF_CONDUCT.md)
- [セキュリティポリシー](./SECURITY.md)
- [変更履歴](./CHANGELOG.md)

---

## コントリビュート

Issue や Pull Request の作成前に [CONTRIBUTING.md](./CONTRIBUTING.md) を確認してください。
