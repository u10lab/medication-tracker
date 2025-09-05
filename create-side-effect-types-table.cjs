#!/usr/bin/env node

const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
  host: 'db.gwlospsmdgdmlyjxudmq.supabase.co',
  user: 'postgres',
  database: 'postgres',
  port: 5432,
  password: process.env.DB_PASSWORD, // Get password from environment variable
  ssl: {
    rejectUnauthorized: false
  },
  // Force IPv4 connection
  family: 4,
  // Connection timeout settings
  connectionTimeoutMillis: 10000,
  query_timeout: 30000
};

// SQL to create side_effect_types table
const createTableSQL = `
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
`;

// SQL to create indexes
const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_side_effect_types_name ON public.side_effect_types(name);',
  'CREATE INDEX IF NOT EXISTS idx_side_effect_types_severity ON public.side_effect_types(severity_level);',
  'CREATE INDEX IF NOT EXISTS idx_side_effect_types_category ON public.side_effect_types(category);',
  'CREATE INDEX IF NOT EXISTS idx_side_effect_types_common ON public.side_effect_types(is_common) WHERE is_common = true;',
  'CREATE INDEX IF NOT EXISTS idx_side_effect_types_medical_attention ON public.side_effect_types(requires_medical_attention) WHERE requires_medical_attention = true;'
];

// SQL to insert sample data
const insertSampleDataSQL = `
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
`;

// SQL to verify table structure
const verifyTableSQL = `
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'side_effect_types' AND table_schema = 'public'
ORDER BY ordinal_position;
`;

// SQL to verify indexes
const verifyIndexesSQL = `
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'side_effect_types' AND schemaname = 'public'
ORDER BY indexname;
`;

// SQL to verify constraints
const verifyConstraintsSQL = `
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.side_effect_types'::regclass
ORDER BY conname;
`;

// SQL to verify sample data
const verifySampleDataSQL = `
SELECT 
  name,
  description,
  severity_level,
  category,
  is_common,
  requires_medical_attention,
  array_length(symptoms, 1) as symptoms_count
FROM public.side_effect_types
ORDER BY 
  CASE severity_level 
    WHEN 'critical' THEN 1 
    WHEN 'severe' THEN 2 
    WHEN 'moderate' THEN 3 
    WHEN 'mild' THEN 4 
  END,
  name;
`;

async function createSideEffectTypesTable() {
  let client;
  
  try {
    // Check if password is provided
    if (!dbConfig.password) {
      console.error('❌ Error: DB_PASSWORD environment variable is not set.');
      console.error('Please set it with: export DB_PASSWORD=your_password');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to Supabase PostgreSQL database...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Create the table
    console.log('\n📋 Creating side_effect_types table...');
    await client.query(createTableSQL);
    console.log('✅ side_effect_types table created successfully!');
    
    // Create indexes
    console.log('\n🗂️  Creating indexes...');
    for (let i = 0; i < createIndexesSQL.length; i++) {
      const indexSQL = createIndexesSQL[i];
      await client.query(indexSQL);
      console.log(`✅ Index ${i + 1}/${createIndexesSQL.length} created`);
    }
    console.log('✅ All indexes created successfully!');
    
    // Insert sample data
    console.log('\n📝 Inserting sample data...');
    const insertResult = await client.query(insertSampleDataSQL);
    console.log('✅ Sample data inserted successfully!');
    
    // Verify table structure
    console.log('\n🔍 Verifying table structure...');
    const columnsResult = await client.query(verifyTableSQL);
    console.log('\n📋 Table Columns:');
    console.table(columnsResult.rows);
    
    // Verify indexes
    console.log('\n🗂️  Table Indexes:');
    const indexesResult = await client.query(verifyIndexesSQL);
    indexesResult.rows.forEach(row => {
      console.log(`- ${row.indexname}: ${row.indexdef}`);
    });
    
    // Verify constraints
    console.log('\n🔒 Table Constraints:');
    const constraintsResult = await client.query(verifyConstraintsSQL);
    constraintsResult.rows.forEach(row => {
      console.log(`- ${row.conname} (${row.contype}): ${row.definition}`);
    });
    
    // Verify sample data
    console.log('\n📊 Inserted Sample Data:');
    const sampleDataResult = await client.query(verifySampleDataSQL);
    console.table(sampleDataResult.rows);
    
    console.log('\n🎉 side_effect_types table setup completed successfully!');
    console.log(`📈 Total records inserted: ${sampleDataResult.rows.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Database connection closed.');
    }
  }
}

// Check if running directly
if (require.main === module) {
  createSideEffectTypesTable();
}

module.exports = { createSideEffectTypesTable };