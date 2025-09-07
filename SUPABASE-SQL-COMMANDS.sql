-- ===================================
-- 薬物管理システム テーブル作成SQL
-- Supabaseダッシュボード SQL Editor用
-- ===================================

-- 1. medications テーブル (処方薬情報)
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  dosage_form VARCHAR(100) NOT NULL DEFAULT 'tablet' CHECK (dosage_form IN ('tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'drops', 'patch', 'inhaler', 'other')),
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

-- medications テーブル インデックス
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_name ON public.medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON public.medications(generic_name);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_medications_dosage_form ON public.medications(dosage_form);

-- 2. side_effect_types テーブル (副作用タイプ)
CREATE TABLE IF NOT EXISTS public.side_effect_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  severity_level VARCHAR(50) NOT NULL DEFAULT 'mild' CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')),
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  is_common BOOLEAN DEFAULT false NOT NULL,
  requires_medical_attention BOOLEAN DEFAULT false NOT NULL,
  symptoms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- side_effect_types テーブル インデックス
CREATE INDEX IF NOT EXISTS idx_side_effect_types_name ON public.side_effect_types(name);
CREATE INDEX IF NOT EXISTS idx_side_effect_types_severity ON public.side_effect_types(severity_level);
CREATE INDEX IF NOT EXISTS idx_side_effect_types_category ON public.side_effect_types(category);
CREATE INDEX IF NOT EXISTS idx_side_effect_types_common ON public.side_effect_types(is_common) WHERE is_common = true;
CREATE INDEX IF NOT EXISTS idx_side_effect_types_medical_attention ON public.side_effect_types(requires_medical_attention) WHERE requires_medical_attention = true;

-- side_effect_types テーブル サンプルデータ
INSERT INTO public.side_effect_types (name, description, severity_level, category, is_common, requires_medical_attention, symptoms) VALUES
('頭痛', '頭部の痛みや不快感', 'mild', '神経系', true, false, ARRAY['頭の痛み', '重い感じ', 'ズキズキする痛み']),
('吐き気', '嘔吐したい感覚', 'mild', '消化器系', true, false, ARRAY['胃のムカつき', '嘔吐感', '食欲不振']),
('めまい', 'バランス感覚の異常', 'mild', '神経系', true, false, ARRAY['ふらつき', '回転性のめまい', '立ちくらみ']),
('眠気', '強い眠気や集中力低下', 'mild', '神経系', true, false, ARRAY['だるさ', '集中力低下', '反応の鈍化']),
('便秘', '排便困難', 'mild', '消化器系', true, false, ARRAY['排便回数減少', '腹部膨満感', '腹痛']),
('下痢', '軟便や水様便', 'mild', '消化器系', true, false, ARRAY['軟便', '腹痛', '頻回な排便']),
('皮膚発疹', '皮膚の炎症や湿疹', 'moderate', '皮膚', false, true, ARRAY['赤み', 'かゆみ', '腫れ', '水疱']),
('呼吸困難', '息苦しさや呼吸の異常', 'severe', '呼吸器系', false, true, ARRAY['息切れ', '胸苦しさ', '喘鳴']),
('動悸', '心臓の鼓動の異常', 'moderate', '循環器系', false, true, ARRAY['心拍数増加', '不整脈', '胸痛']),
('アナフィラキシー', '重篤なアレルギー反応', 'critical', 'アレルギー', false, true, ARRAY['全身の発疹', '呼吸困難', '血圧低下', '意識障害'])
ON CONFLICT (name) DO NOTHING;

-- 3. medication_patterns テーブル (服薬パターン)
CREATE TABLE IF NOT EXISTS public.medication_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  pattern_name VARCHAR(255) NOT NULL,
  schedule_type VARCHAR(50) NOT NULL DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'as_needed', 'custom')),
  days_of_week INT[] CHECK (cardinality(days_of_week) <= 7 AND days_of_week <@ ARRAY[0,1,2,3,4,5,6]),
  times_per_day INT DEFAULT 1 CHECK (times_per_day >= 1 AND times_per_day <= 24),
  dosage_amount DECIMAL(8,3) NOT NULL CHECK (dosage_amount > 0),
  dosage_unit VARCHAR(50) NOT NULL DEFAULT 'mg',
  interval_hours INT CHECK (interval_hours >= 1 AND interval_hours <= 168),
  start_date DATE NOT NULL,
  end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
  is_active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  specific_times TIME[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_schedule_days CHECK (
    (schedule_type != 'weekly') OR (days_of_week IS NOT NULL AND cardinality(days_of_week) >= 1)
  ),
  CONSTRAINT valid_interval CHECK (
    (schedule_type != 'custom') OR (interval_hours IS NOT NULL)
  )
);

-- medication_patterns テーブル インデックス
CREATE INDEX IF NOT EXISTS idx_medication_patterns_user_id ON public.medication_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_patterns_medication_id ON public.medication_patterns(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_patterns_active ON public.medication_patterns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_medication_patterns_schedule ON public.medication_patterns(schedule_type, start_date, end_date);

-- 4. medication_logs テーブル (服薬記録)
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  medication_pattern_id UUID REFERENCES public.medication_patterns(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_time TIMESTAMP WITH TIME ZONE,
  dosage_amount DECIMAL(8,3) NOT NULL CHECK (dosage_amount > 0),
  dosage_unit VARCHAR(50) NOT NULL DEFAULT 'mg',
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'taken', 'skipped', 'missed', 'partial')),
  notes TEXT,
  side_effects TEXT[],
  effectiveness_rating INT CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_taken_time CHECK (
    (status IN ('taken', 'partial')) = (taken_time IS NOT NULL)
  )
);

-- medication_logs テーブル インデックス  
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON public.medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_pattern_id ON public.medication_logs(medication_pattern_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled_time ON public.medication_logs(scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_status ON public.medication_logs(status);
CREATE INDEX IF NOT EXISTS idx_medication_logs_taken_time ON public.medication_logs(taken_time DESC) WHERE taken_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON public.medication_logs(user_id, (scheduled_time::date));

-- ===================================
-- 完了メッセージ
-- ===================================
SELECT '🎉 すべてのテーブルとインデックスが正常に作成されました！' as result;