# 薬物管理アプリケーション - 要件定義書 (Railway + Supabase + Vercel版)

## 📋 プロジェクト概要

### プロジェクト名
薬物管理・服薬記録システム (Medication Tracker)

### 目的
個人の薬物服薬管理、副作用記録、服薬統計を効率的に行うWebアプリケーション

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

#### 2. 薬物管理機能
- [x] 薬の登録・編集・削除 (CRUD操作)
- [x] 薬の基本情報入力
  - 薬剤名
  - 説明・用途
- [x] 薬物の検索・フィルタリング

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
2. **薬物管理画面**: 登録済み薬物の一覧・編集
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

### Phase 1: 環境構築・認証基盤
- [ ] プロジェクト初期化・環境設定
  - [ ] Laravel 11プロジェクト作成
  - [ ] Supabaseプロジェクト作成・設定
  - [ ] 環境変数設定(.env)
  - [ ] Railway初期デプロイ設定
- [ ] 認証システム構築
  - [ ] Supabase Auth統合
  - [ ] Laravel Sanctum設定
  - [ ] ユーザーモデル・マイグレーション
  - [ ] 認証API（登録・ログイン・ログアウト）
- [ ] フロントエンド基盤
  - [ ] Vue.js 3 + Vite プロジェクト作成
  - [ ] TailwindCSS + Headless UI セットアップ
  - [ ] Pinia状態管理セットアップ
  - [ ] Axios API設定
  - [ ] 基本レイアウト・ルーティング

### Phase 2: データベース・モデル構築
- [ ] データベース設計実装
  - [ ] medicationsテーブル・モデル作成
  - [ ] medication_patternsテーブル・モデル作成
  - [ ] medication_logsテーブル・モデル作成
  - [ ] side_effect_typesテーブル・モデル作成
  - [ ] リレーション設定・シーダー作成
- [ ] 基本API構築
  - [ ] 薬物CRUD API実装
  - [ ] バリデーション・API Resource設定
  - [ ] エラーハンドリング統一

### Phase 3: 薬物管理機能
- [ ] 薬物管理バックエンド
  - [ ] 薬物管理Controller・Repository実装
  - [ ] 薬物検索・フィルタリング機能
  - [ ] APIテスト作成
- [ ] 薬物管理フロントエンド
  - [ ] 薬物一覧・詳細画面
  - [ ] 薬物登録・編集フォーム
  - [ ] 検索・フィルタリングUI
  - [ ] バリデーション・エラーハンドリング

### Phase 4: 服薬スケジュール機能
- [ ] スケジュール管理バックエンド
  - [ ] 服薬パターン生成ロジック（日常/サイクル/頓服）
  - [ ] スケジュール計算・生成API
  - [ ] パターン管理CRUD API
- [ ] スケジュール管理フロントエンド
  - [ ] スケジュール設定画面
  - [ ] 複雑なパターン設定UI（サイクル服薬対応）
  - [ ] 時刻選択・日程設定コンポーネント
  - [ ] スケジュール一覧・編集機能

### Phase 5: 服薬記録・副作用機能
- [ ] 記録管理バックエンド
  - [ ] 服薬記録CRUD API
  - [ ] 副作用記録API
  - [ ] ステータス管理（taken/missed/skipped）
  - [ ] 重篤度レベル管理
- [ ] 記録管理フロントエンド
  - [ ] 日々の服薬記録画面
  - [ ] 副作用症状チェックリスト
  - [ ] カスタム症状入力・メモ機能
  - [ ] クイック記録UI（ワンタップ記録）

### Phase 6: カレンダー・ダッシュボード
- [ ] カレンダー機能
  - [ ] 月間カレンダーAPI（服薬予定・実績取得）
  - [ ] 日別詳細情報API
  - [ ] カレンダー表示コンポーネント
  - [ ] 日別詳細モーダル・サイドパネル
- [ ] ダッシュボード
  - [ ] 今日の服薬予定API
  - [ ] 統計データAPI（服薬率・副作用頻度）
  - [ ] ダッシュボード画面
  - [ ] 服薬状況サマリー表示

### Phase 7: UI/UX最適化・本番対応
- [ ] デザイン・レスポンシブ対応
  - [ ] 全画面モバイル対応
  - [ ] アクセシビリティ改善
  - [ ] ローディング・エラー状態UI
  - [ ] ユーザビリティ向上
- [ ] 本番環境構築
  - [ ] Railway本番設定・最適化
  - [ ] Vercel自動デプロイ設定
  - [ ] Supabase本番環境設定
  - [ ] 環境変数・セキュリティ設定
- [ ] テスト・品質保証
  - [ ] 単体テスト（Laravel PHPUnit）
  - [ ] フロントエンドテスト（Vitest）
  - [ ] 統合テスト・E2Eテスト
  - [ ] 本番環境テスト・性能確認

### Phase 8: 最終調整・リリース準備
- [ ] 最終調整・バグ修正
  - [ ] ユーザビリティテスト
  - [ ] バグ修正・最適化
  - [ ] データ整合性確認
  - [ ] セキュリティチェック
- [ ] ドキュメント・リリース準備
  - [ ] API ドキュメント作成
  - [ ] ユーザーマニュアル作成（必要に応じて）
  - [ ] デプロイ手順書作成
  - [ ] 本番リリース

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
- 薬物相互作用チェック
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

*この要件定義書は開発進捗に応じて更新されます。*