#!/usr/bin/env node

// Supabase REST API経由でテーブル作成
const https = require('https');

const SUPABASE_URL = 'https://gwlospsmdgdmlyjxudmq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bG9zcHNtZGdkbWx5anh1ZG1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk4NjM1NCwiZXhwIjoyMDcyNTYyMzU0fQ.-wXRnNgN3P1gy5RryaxLo1FRyQtQk0E94Hu_1uEbwgo';

// SQL クエリをSupabase REST API経由で実行
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'gwlospsmdgdmlyjxudmq.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function createTables() {
  console.log('🔧 Supabase REST API経由でテーブルを作成します...\n');

  // 1. medications テーブル
  const medicationsSQL = `
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

  CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
  CREATE INDEX IF NOT EXISTS idx_medications_name ON public.medications(name);
  CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON public.medications(generic_name);
  CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(is_active) WHERE is_active = true;
  `;

  try {
    console.log('📋 medications テーブルを作成中...');
    await executeSQL(medicationsSQL);
    console.log('✅ medications テーブル作成完了');
  } catch (error) {
    console.error('❌ medications テーブル作成エラー:', error.message);
  }

  // 2. side_effect_types テーブル
  const sideEffectTypesSQL = `
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

  CREATE INDEX IF NOT EXISTS idx_side_effect_types_name ON public.side_effect_types(name);
  CREATE INDEX IF NOT EXISTS idx_side_effect_types_severity ON public.side_effect_types(severity_level);
  CREATE INDEX IF NOT EXISTS idx_side_effect_types_category ON public.side_effect_types(category);
  `;

  try {
    console.log('📋 side_effect_types テーブルを作成中...');
    await executeSQL(sideEffectTypesSQL);
    console.log('✅ side_effect_types テーブル作成完了');
  } catch (error) {
    console.error('❌ side_effect_types テーブル作成エラー:', error.message);
  }

  // 3. medication_patterns テーブル
  const medicationPatternsSQL = `
  CREATE TABLE IF NOT EXISTS public.medication_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
    pattern_name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'as_needed', 'custom')),
    days_of_week INT[] CHECK (array_length(days_of_week, 1) <= 7),
    times_per_day INT DEFAULT 1 CHECK (times_per_day >= 1 AND times_per_day <= 24),
    dosage_amount DECIMAL(8,3) NOT NULL CHECK (dosage_amount > 0),
    dosage_unit VARCHAR(50) NOT NULL DEFAULT 'mg',
    interval_hours INT CHECK (interval_hours >= 1 AND interval_hours <= 168),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    notes TEXT,
    specific_times TIME[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_medication_patterns_user_id ON public.medication_patterns(user_id);
  CREATE INDEX IF NOT EXISTS idx_medication_patterns_medication_id ON public.medication_patterns(medication_id);
  `;

  try {
    console.log('📋 medication_patterns テーブルを作成中...');
    await executeSQL(medicationPatternsSQL);
    console.log('✅ medication_patterns テーブル作成完了');
  } catch (error) {
    console.error('❌ medication_patterns テーブル作成エラー:', error.message);
  }

  // 4. medication_logs テーブル
  const medicationLogsSQL = `
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON public.medication_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON public.medication_logs(medication_id);
  `;

  try {
    console.log('📋 medication_logs テーブルを作成中...');
    await executeSQL(medicationLogsSQL);
    console.log('✅ medication_logs テーブル作成完了');
  } catch (error) {
    console.error('❌ medication_logs テーブル作成エラー:', error.message);
  }

  console.log('\n🎉 すべてのテーブル作成プロセスが完了しました！');
  console.log('Supabaseダッシュボードでテーブルを確認してください: https://supabase.com/dashboard/projects/gwlospsmdgdmlyjxudmq');
}

// スクリプト実行
createTables().catch(console.error);