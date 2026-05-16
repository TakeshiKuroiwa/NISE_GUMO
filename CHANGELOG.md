# Changelog

すべての注目すべき変更はこのファイルに記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) を参考にし、将来的なリリースでは [Semantic Versioning](https://semver.org/lang/ja/) に従う予定です。

---

## [Unreleased]

### Added

- AIを活用した開発指示を整理する `AGENTS.md` テンプレートを追加
- GitHub公開に向けたルートREADME、コントリビュートガイド、セキュリティポリシー、行動規範、Issue/PRテンプレートを追加
- ルートから `npm run dev` / `npm run build` / `npm run backend` を実行できるワークスペース用 `package.json` を追加

### Changed

- 行動規範を、固有の思想家への言及を避けた軽いユーモアの文面に更新
- フロントエンドモックを、バックエンド未起動でもローカルデータで操作できる構成に更新
- スケジュール、プロジェクト、エディタ、管理画面をモックアップとして確認できるUIへ更新

### Fixed

- Rustバックエンドの `UpdateTaskRequest` にあった型定義の構文ミスを修正

---

## [0.1.0] - 2026-05-09

### Added

- NISE_GUMO の初期構想ドキュメントを作成
- 未決事項の暫定案を作成
- React + TypeScript フロントエンドの初期モックを作成
- Rust + Axum バックエンドのモックAPI構成を作成
- デモログイン、スケジュール、プロジェクト、プロフィール、設定、管理画面の初期導線を作成

---

[Unreleased]: https://github.com/TakeshiKuroiwa/NISE_GUMO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TakeshiKuroiwa/NISE_GUMO/releases/tag/v0.1.0
