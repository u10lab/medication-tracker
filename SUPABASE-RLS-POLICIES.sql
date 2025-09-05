-- ===================================
-- Row Level Security (RLS) ポリシー設定
-- 各ユーザーは自分のデータのみアクセス可能
-- ===================================

-- 1. RLSを有効化
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_effect_types DISABLE ROW LEVEL SECURITY; -- 全ユーザー共有データ

-- 2. medications テーブルのRLSポリシー
-- ユーザーは自分の薬物データのみ参照可能
CREATE POLICY "Users can view own medications" ON public.medications
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の薬物データのみ挿入可能
CREATE POLICY "Users can insert own medications" ON public.medications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の薬物データのみ更新可能
CREATE POLICY "Users can update own medications" ON public.medications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の薬物データのみ削除可能
CREATE POLICY "Users can delete own medications" ON public.medications
    FOR DELETE USING (auth.uid() = user_id);

-- 3. medication_patterns テーブルのRLSポリシー
-- ユーザーは自分の服薬パターンのみ参照可能
CREATE POLICY "Users can view own medication patterns" ON public.medication_patterns
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の服薬パターンのみ挿入可能
CREATE POLICY "Users can insert own medication patterns" ON public.medication_patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の服薬パターンのみ更新可能
CREATE POLICY "Users can update own medication patterns" ON public.medication_patterns
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の服薬パターンのみ削除可能
CREATE POLICY "Users can delete own medication patterns" ON public.medication_patterns
    FOR DELETE USING (auth.uid() = user_id);

-- 4. medication_logs テーブルのRLSポリシー
-- ユーザーは自分の服薬記録のみ参照可能
CREATE POLICY "Users can view own medication logs" ON public.medication_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の服薬記録のみ挿入可能
CREATE POLICY "Users can insert own medication logs" ON public.medication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の服薬記録のみ更新可能
CREATE POLICY "Users can update own medication logs" ON public.medication_logs
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の服薬記録のみ削除可能
CREATE POLICY "Users can delete own medication logs" ON public.medication_logs
    FOR DELETE USING (auth.uid() = user_id);

-- 5. side_effect_types テーブルは全ユーザー共有
-- 認証済みユーザーは副作用タイプを参照のみ可能（RLS無効）
-- 管理者のみが副作用タイプを管理

-- ===================================
-- RLSポリシー確認クエリ
-- ===================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('medications', 'medication_patterns', 'medication_logs')
ORDER BY tablename, policyname;

SELECT '🛡️ RLSポリシーが正常に設定されました！' as result;