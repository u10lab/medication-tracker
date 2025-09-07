-- ===================================
-- 簡略版: 薬物管理システム テーブル作成SQL
-- IMMUTABLE関数エラー回避版
-- ===================================

-- 1. medications テーブル (処方薬情報)
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  dosage_form VARCHAR(100) NOT NULL DEFAULT 'tablet',
  strength VARCHAR(100),
  manufacturer VARCHAR(255),
  prescription_number VARCHAR(100),
  prescribing_doctor VARCHAR(255),
  pharmacy VARCHAR(255),
  ndc_number VARCHAR(50),
  indications TEXT[],
  contraindications TEXT[],
  side_effects TEXT[],
  drug_interactions TEXT[],
  storage_instructions TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. side_effect_types テーブル (副作用タイプ)
CREATE TABLE IF NOT EXISTS public.side_effect_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  severity_level VARCHAR(50) NOT NULL DEFAULT 'mild',
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  is_common BOOLEAN DEFAULT false NOT NULL,
  requires_medical_attention BOOLEAN DEFAULT false NOT NULL,
  symptoms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. medication_patterns テーブル (服薬パターン)
CREATE TABLE IF NOT EXISTS public.medication_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  pattern_name VARCHAR(255) NOT NULL,
  schedule_type VARCHAR(50) NOT NULL DEFAULT 'daily',
  days_of_week INT[],
  times_per_day INT DEFAULT 1,
  dosage_amount DECIMAL(8,3) NOT NULL,
  dosage_unit VARCHAR(50) NOT NULL DEFAULT 'mg',
  interval_hours INT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  specific_times TIME[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. medication_logs テーブル (服薬記録)
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  medication_pattern_id UUID REFERENCES public.medication_patterns(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_time TIMESTAMP WITH TIME ZONE,
  dosage_amount DECIMAL(8,3) NOT NULL,
  dosage_unit VARCHAR(50) NOT NULL DEFAULT 'mg',
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  side_effects TEXT[],
  effectiveness_rating INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 基本インデックス作成
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_patterns_user_id ON public.medication_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_patterns_medication_id ON public.medication_patterns(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON public.medication_logs(medication_id);

-- サンプルデータ
INSERT INTO public.side_effect_types (name, description, severity_level, category, is_common, requires_medical_attention, symptoms) VALUES
('頭痛', '頭部の痛みや不快感', 'mild', '神経系', true, false, ARRAY['頭の痛み', '重い感じ', 'ズキズキする痛み']),
('吐き気', '嘔吐したい感覚', 'mild', '消化器系', true, false, ARRAY['胃のムカつき', '嘔吐感', '食欲不振']),
('めまい', 'バランス感覚の異常', 'mild', '神経系', true, false, ARRAY['ふらつき', '回転性のめまい', '立ちくらみ'])
ON CONFLICT (name) DO NOTHING;

SELECT '🎉 簡略版テーブルが正常に作成されました！' as result;