# Changelog

すべての注目すべき変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従います。

---

## [Unreleased]

### Added
- （次のリリースで追加予定の機能）

### Changed
- （次のリリースで変更予定の内容）

---

## [1.1.0] - 2025-05-01

### Added
- ダークモードのサポート (#89)
- CSVエクスポート機能 (#102)
- 日本語ローカライゼーション (#110)

### Changed
- ダッシュボードのUIを刷新 (#95)
- API レスポンスの形式を統一 (#98)

### Fixed
- ログアウト後にセッションが残るバグを修正 (#87)
- モバイルでのレイアウト崩れを修正 (#91)

### Deprecated
- `GET /api/v1/users` は v2 で削除予定。`GET /api/v2/users` を使用してください。

---

## [1.0.1] - 2025-04-10

### Fixed
- 初回ログイン時にエラーが発生するバグを修正 (#78)
- 環境変数が読み込まれない問題を修正 (#80)

### Security
- 依存パッケージのセキュリティアップデート

---

## [1.0.0] - 2025-04-01

### Added
- 初回リリース 🎉
- ユーザー認証（メール / OAuth）
- ダッシュボード機能
- REST API v1
- Docker 対応
- GitHub Actions による CI/CD

---

[Unreleased]: https://github.com/username/repo/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/username/repo/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/username/repo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/username/repo/releases/tag/v1.0.0
