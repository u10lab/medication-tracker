# 処方薬管理アプリケーション - 要件定義書 (Railway + Supabase + Vercel版)

## 📋 プロジェクト概要

### プロジェクト名
処方薬管理・服薬記録システム (Medication Tracker)

### 目的
個人の処方薬服薬管理、副作用記録、服薬統計を効率的に行うWebアプリケーション

### 対象ユーザー
- 定期的に服薬している個人
- 複雑な服薬スケジュールを管理する必要がある患者
- 副作用を記録し医師と共有したいユーザー

---

## 🏗 技術スタック（爆速開発構成）

### フロントエンド
- **フレームワーク**: Vue.js 3 (Composition API)
- **ビルドツール**: Vite
- **スタイリング**: TailwindCSS + Headless UI
- **ルーティング**: Vue Router 4
- **状態管理**: Pinia
- **HTTP クライアント**: Axios
- **UI コンポーネント**: Heroicons + Lucide Vue

### バックエンド
- **フレームワーク**: Laravel 11
- **認証**: Laravel Sanctum + Supabase Auth (ハイブリッド)
- **API設計**: RESTful API
- **バリデーション**: Laravel Form Requests
- **レスポンス**: Laravel API Resources

### データベース
- **本番・開発共通**: Supabase (PostgreSQL)
- **認証**: Supabase Auth

### デプロイメント
- **フロントエンド**: Vercel (自動デプロイ)
- **バックエンド**: Railway (Laravel専用最適化)
- **データベース**: Supabase (無料プランから開始)

### 爆速開発のポイント
- **ゼロコンフィグ認証**: Supabase Authで認証機能を即座に利用
- **自動デプロイ**: GitHub連携でコミット時に自動デプロイ
- **統合データベース**: SupabaseのPostgreSQLを開発・本番で共通利用
- **最小限機能**: 画像アップロードなし、テキストベースで高速開発

---

## 🎯 機能要件

### 必須機能 (MVP)

#### 1. ユーザー認証
- [x] ユーザー登録
- [x] ログイン・ログアウト
- [x] パスワードリセット
- [x] セッション管理

#### 2. 処方薬管理機能
- [x] 薬の登録・編集・削除 (CRUD操作)
- [x] 薬の基本情報入力
  - 薬剤名
  - 説明・用途
- [x] 処方薬の検索・フィルタリング

#### 3. 服薬スケジュール設定
- [x] 複雑な服薬パターンに対応
  - **日常服薬**: 毎日同じ時間
  - **サイクル服薬**: N日服薬 → M日休薬を繰り返し
  - **頓服**: 必要時のみ
- [x] スケジュール詳細設定
  - 1日の服薬回数
  - 服薬時刻設定
  - 服薬期間 (開始日・終了日)
  - サイクルパターン (服薬期間・休薬期間・サイクル回数)

#### 4. 服薬記録管理
- [x] 日々の服薬記録
  - 服薬完了の記録
  - 服薬時刻記録
  - 飲み忘れ記録
- [x] 記録ステータス
  - 服薬済み (taken)
  - 未服薬・飲み忘れ (missed)
  - 意図的スキップ (skipped)

#### 5. 副作用記録・メモ機能
- [x] 副作用症状記録
  - 一般的な症状チェックリスト
  - カスタム症状入力
  - 発生時刻記録
- [x] 重篤度レベル設定
  - 軽度 (mild)
  - 中等度 (moderate)
  - 重度 (severe)
- [x] 自由記述メモ
  - 体調変化の詳細
  - 医師への相談事項
  - その他気付いた点

#### 6. カレンダー表示
- [x] 月間カレンダー表示
- [x] 服薬予定・実績確認
- [x] 副作用発生日の表示
- [x] 日別詳細表示


---

## 🗄 データベース設計

### ER図

```
[users] 1 ----< * [medications] 1 ----< * [medication_patterns] 1 ----< * [medication_logs]
                                                                                     |
                                                                                     v
                                                                            [side_effect_types]
```

### テーブル構造

#### users テーブル
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### medications テーブル
```sql
CREATE TABLE medications (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image_path VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### medication_patterns テーブル
```sql
CREATE TABLE medication_patterns (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    medication_id BIGINT UNSIGNED NOT NULL,
    pattern_type ENUM('daily', 'cyclical', 'as_needed') NOT NULL,
    daily_doses INT NOT NULL DEFAULT 1,
    doses_per_intake INT NOT NULL DEFAULT 1,
    cycle_days_on INT NULL,
    cycle_days_off INT NULL,
    total_cycles INT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    schedule_times JSON NOT NULL, -- ['08:00', '20:00']
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
);
```

#### medication_logs テーブル
```sql
CREATE TABLE medication_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    medication_pattern_id BIGINT UNSIGNED NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_time TIMESTAMP NULL,
    status ENUM('taken', 'missed', 'skipped') NOT NULL,
    side_effects JSON NULL, -- ['頭痛', '吐き気']
    notes TEXT NULL,
    severity_level ENUM('mild', 'moderate', 'severe') NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_pattern_id) REFERENCES medication_patterns(id) ON DELETE CASCADE,
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_medication_pattern_date (medication_pattern_id, scheduled_date)
);
```

#### side_effect_types テーブル (オプション)
```sql
CREATE TABLE side_effect_types (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### デフォルト副作用症状
```json
[
    "頭痛", "吐き気", "めまい", "疲労感", "発疹", "下痢", "便秘",
    "食欲不振", "不眠", "眠気", "口の渇き", "動悸", "息切れ",
    "筋肉痛", "関節痛", "その他"
]
```

---

## 🎨 UI/UX要件

### デザインガイドライン
- **レスポンシブデザイン**: モバイルファースト
- **カラーテーマ**: 医療系アプリらしい清潔感のある色合い
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **フォント**: 視認性の高いゴシック体

### 主要画面
1. **ダッシュボード**: 今日の服薬予定・実績一覧
2. **処方薬管理画面**: 登録済み処方薬の一覧・編集
3. **服薬記録画面**: 日々の服薬記録入力
4. **副作用記録画面**: 症状・重篤度の記録
5. **カレンダー画面**: 月間服薬予定・実績表示
6. **統計・レポート画面**: 服薬率・副作用分析

---

## 🔐 セキュリティ要件

### 認証・認可
- JWT トークンベース認証 (Laravel Sanctum)
- ユーザーデータの適切な分離
- セッション管理

### データ保護
- 機密情報の暗号化
- HTTPS通信の強制
- SQLインジェクション対策
- XSS対策
- CSRF対策

### プライバシー
- 個人の医療情報の適切な管理
- データ最小化原則の適用
- ログ管理（個人情報を含まない）

---

## 📊 パフォーマンス要件

### レスポンス時間
- **ページロード時間**: 3秒以内
- **API応答時間**: 500ms以内
- **データベースクエリ**: 100ms以内

### スケーラビリティ
- **同時接続ユーザー**: 1000人
- **データ量**: ユーザーあたり5年分の記録
- **API呼び出し**: 秒間100リクエスト

---

## 🧪 テスト要件

### 単体テスト
- Laravel PHPUnit テスト
- Vue.js Vitest テスト

### 統合テスト
- API エンドポイントテスト
- データベース連携テスト

### E2Eテスト
- Playwright / Cypress による自動化テスト

---

## 📈 開発フェーズ

**注意**: 本プロジェクトは**Bolt.newで作成されたVue.js 3フロントエンド**が既に存在することを前提とした手順です。

### Phase 1: 環境構築・認証基盤 ✅ **完了**

- [x] **バックエンド環境構築**
  - [x] Laravel 11 APIプロジェクト作成（`medication-tracker-api/`）
  - [x] Supabaseプロジェクト作成・設定（Auth + PostgreSQL DB）
  - [x] Laravel環境変数設定(.env) - Supabase接続情報
- [x] **フロントエンド拡張**
  - [x] Vue.js 3 + Vite + TailwindCSS（既存）
  - [x] Pinia状態管理ライブラリ追加
  - [x] Axios HTTP クライアント追加
  - [x] Supabase JavaScript SDK追加
  - [x] 認証状態管理ストア作成
- [x] **認証システム統合**
  - [x] フロントエンドにSupabase Auth統合
  - [x] Laravel Sanctum設定（APIトークン管理用）
  - [x] Supabase Auth + Laravel Sanctumハイブリッド認証実装

### Phase 2: Laravel APIモックデータ実装 ✅ **完了**

- [x] **Laravel API構築（モックデータ）**
  - [x] 処方薬CRUD APIモックデータ実装
  - [x] 服薬記録・パターン管理APIモックデータ実装
  - [x] 副作用記録APIモックデータ実装
  - [x] 認証・バリデーション・エラーハンドリング統一

### Phase 3: フロントエンドAPI統合・MVP完成 ✅ **完了**

- [x] **APIサービス統合**
  - [x] services/api.jsに全CRUD操作実装（medications, logs, patterns, side-effects）
  - [x] 認証状態管理とAPI統合
  - [x] エラーハンドリング統一
- [x] **コンポーネントAPI連携**
  - [x] Medications.vue: mockData → API呼び出し完了
  - [x] データ構造統一・Vue.jsエラー修正
  - [x] 画像読み込みエラー修正

### Phase 4: カレンダー統合・完全MVP完成 🔄 **進行中**

- [ ] **残りコンポーネントAPI統合**
  - [ ] CalendarGrid.vue: ローカルmockData → Laravel API連携
  - [ ] Dashboard.vue: 完全なAPI統合
  - [ ] SideEffects.vue: API統合完了
- [ ] **機能統合テスト**
  - [ ] 全機能の動作確認・バグ修正
  - [ ] ユーザビリティ改善

### Phase 5: 本番環境準備・デプロイ

**技術スタック選定:**
- **選択肢検討中**: Laravel API vs Supabase REST API
- **フロントエンド**: Vercel
- **データベース**: 選択肢に応じてPostgreSQL設定

**デプロイ準備:**
- [ ] 本番技術スタック決定
- [ ] 環境変数設定・CORS設定
- [ ] 本番環境テスト・デプロイ

---

## 🏗 プロジェクト構成

**現在の開発環境（分離構成）:**

```
# プロジェクト全体の親ディレクトリ
/home/umeshita/project/
├── medication-tracker/           # フロントエンド（Vue.js 3）✅ 既存
│   ├── src/
│   │   ├── components/          # Vueコンポーネント
│   │   ├── views/              # ページレベルコンポーネント  
│   │   ├── stores/             # Piniaストア ✅ 実装済み
│   │   ├── lib/                # Supabase設定 ✅ 実装済み
│   │   └── router/             # Vue Router設定
│   ├── package.json            # フロントエンド依存関係
│   ├── .env                    # Supabase設定 ✅ 設定済み
│   └── ...
│
└── medication-tracker-api/      # バックエンド（Laravel 11 API）✅ 構築済み
    ├── app/
    │   ├── Http/Controllers/   # APIコントローラー
    │   ├── Models/            # Eloquentモデル
    │   └── Services/          # ビジネスロジック
    ├── database/
    │   └── migrations/        # DBマイグレーション（Supabase用）
    ├── routes/api.php         # APIルート定義
    ├── .env                   # Laravel環境変数（Supabase接続）
    └── ...
```

**開発フローの分離:**
- フロントエンド開発: `medication-tracker/` ディレクトリで作業
- バックエンドAPI開発: `medication-tracker-api/` ディレクトリで作業
- 認証: Supabase Auth（フロントエンド） + Laravel Sanctum（API）

---

## 🎯 成功指標 (KPI)

### 技術指標
- [ ] テストカバレッジ 80%以上
- [ ] API応答時間 平均500ms以内
- [ ] バグ発生率 月10件以下

### ユーザビリティ指標
- [ ] ページロード時間 3秒以内
- [ ] モバイル対応完全実装
- [ ] アクセシビリティチェック合格

### ビジネス指標
- [ ] 機能完成度 100% (必須機能)
- [ ] デプロイ成功
- [ ] ユーザー受入テスト合格

---

## 📝 補足事項

### 将来的な拡張案（MVP完成後の検討事項）
- 服薬統計・レポート機能
- 薬剤情報の詳細検索
- データエクスポート機能（PDF、CSV）
- 医師・薬剤師との連携機能
- 処方薬相互作用チェック
- AI による服薬パターン提案
- ウェアラブル端末との連携
- 多言語対応

### リスク管理
- **技術リスク**: フレームワークの学習コスト
- **スケジュールリスク**: 複雑な機能の実装遅延
- **品質リスク**: 医療データの正確性確保

---

## 📞 連絡先・レビュー

**作成日**: 2025-09-04
**バージョン**: 1.0
**次回レビュー予定**: Phase 1完了後

---

