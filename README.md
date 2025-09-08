# 処方薬管理アプリケーション（フロントエンド）

## 📋 プロジェクト概要

個人の処方薬服薬管理、副作用記録、服薬統計を効率的に行うWebアプリケーションのフロントエンド部分です。

### 主な機能
- ✅ ユーザー認証（Supabase Auth）
- ✅ 処方薬管理（CRUD操作）
- ✅ 服薬スケジュール設定
- ✅ 服薬記録・カレンダー表示
- ✅ 副作用記録・管理
- ✅ ダッシュボード（今日の服薬予定）

## 🏗 技術スタック

- **フレームワーク**: Vue.js 3 (Composition API)
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS
- **ルーティング**: Vue Router 4
- **状態管理**: Pinia
- **HTTP クライアント**: Axios
- **認証**: Supabase JavaScript SDK

## 🚀 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 環境変数設定

`.env`ファイルに以下を設定：

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

## 📁 プロジェクト構成

```
src/
├── components/          # Vue コンポーネント
│   ├── CalendarGrid.vue    # カレンダー表示
│   ├── DailySchedule.vue   # 日次スケジュール
│   ├── MedicationCard.vue  # 薬剤カード
│   ├── MedicationForm.vue  # 薬剤入力フォーム
│   └── SideEffectForm.vue  # 副作用入力フォーム
├── views/              # ページレベルコンポーネント
│   ├── Dashboard.vue       # ダッシュボード
│   ├── Medications.vue     # 薬剤管理
│   ├── Calendar.vue        # カレンダー
│   ├── SideEffects.vue     # 副作用記録
│   ├── Login.vue           # ログイン
│   └── Register.vue        # 新規登録
├── services/
│   └── api.js              # API通信サービス
├── stores/
│   └── auth.js             # 認証ストア（Pinia）
└── lib/
    └── supabase.js         # Supabase設定
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview

# リント
npm run lint
```

## 🔗 バックエンドAPI

このフロントエンドは以下のバックエンドAPIと連携します：
- **リポジトリ**: [medication-tracker-api](../medication-tracker-api/)
- **技術**: Laravel 11 + Supabase PostgreSQL
- **認証**: Laravel Sanctum + Supabase Auth

## 📱 主要画面

### 1. ダッシュボード
- 今日の服薬予定一覧
- 服薬率表示
- 直近の副作用記録

### 2. 処方薬管理
- 薬剤の登録・編集・削除
- 服薬スケジュール設定
- 画像アップロード対応

### 3. カレンダー
- 月間カレンダー表示
- 服薬予定・実績確認
- 服薬済みボタン（リアルタイム更新）

### 4. 副作用記録
- 症状チェックリスト
- 重篤度レベル設定
- 自由記述メモ

## 🔐 認証フロー

1. **新規登録**: Supabase Authでユーザー作成
2. **ログイン**: JWTトークン取得
3. **API認証**: Laravel Sanctumでトークン検証
4. **セッション管理**: 自動ログイン・ログアウト

## 🎨 UI/UX

- **レスポンシブデザイン**: モバイルファースト
- **医療系カラーテーマ**: 清潔感のある色合い
- **直感的操作**: カレンダーUI等で使いやすさを重視
- **エラーハンドリング**: 分かりやすい日本語メッセージ

## 🚀 デプロイ

### Vercel（推奨）

```bash
# Vercel CLIでデプロイ
npm install -g vercel
vercel

# 環境変数をVercelダッシュボードで設定
```

### その他のプラットフォーム

- **Netlify**: `npm run build` → `dist`フォルダをデプロイ
- **GitHub Pages**: GitHub Actionsで自動デプロイ設定

## 🐛 トラブルシューティング

### よくある問題

1. **API接続エラー**
   - バックエンドAPIが起動しているか確認
   - 環境変数`VITE_API_URL`が正しいか確認

2. **認証エラー**
   - Supabaseの設定が正しいか確認
   - 環境変数`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`を確認

3. **ビルドエラー**
   - Node.jsのバージョンが18以上か確認
   - `node_modules`を削除して`npm install`を再実行

## 📚 開発情報

- **開発期間**: 2025年9月4日〜9月8日（5日間）
- **開発者**: Claude + cursor + Human（ペアプログラミング）
- **開発スタイル**: アジャイル・反復開発
- **完成状況**: MVP完成、デプロイ準備完了

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

**詳細な要件定義は [requirement.md](./requirement.md) を参照してください。**