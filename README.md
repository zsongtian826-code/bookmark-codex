# Folio

ローカルストレージだけで動作する、個人用ブックマーク管理アプリです。URL の自動補完、検索・フォルダ・タグでの絞り込み、JSON のインポート／エクスポートに対応しています。

## 開発

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
```

GitHub Pages では `main` への push で `.github/workflows/deploy.yml` がビルド・公開します。公開リポジトリ名は `bookmark-codex`、Pages の source は **GitHub Actions** に設定してください。
