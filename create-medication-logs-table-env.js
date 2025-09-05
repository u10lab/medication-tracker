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
  }
};

// SQL to create medication_logs table
const createTableSQL = `
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
`;

// SQL to create indexes
const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON public.medication_logs(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON public.medication_logs(medication_id);',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_pattern_id ON public.medication_logs(medication_pattern_id);',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled_time ON public.medication_logs(scheduled_time DESC);',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_status ON public.medication_logs(status);',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_taken_time ON public.medication_logs(taken_time DESC) WHERE taken_time IS NOT NULL;',
  'CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON public.medication_logs(user_id, DATE(scheduled_time));'
];

// SQL to verify table structure
const verifyTableSQL = `
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'medication_logs' AND table_schema = 'public'
ORDER BY ordinal_position;
`;

// SQL to verify indexes
const verifyIndexesSQL = `
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'medication_logs' AND schemaname = 'public'
ORDER BY indexname;
`;

// SQL to verify constraints
const verifyConstraintsSQL = `
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.medication_logs'::regclass
ORDER BY conname;
`;

async function createMedicationLogsTable() {
  let client;
  
  try {
    // Check if password is provided
    if (!dbConfig.password) {
      console.error('❌ Error: DB_PASSWORD environment variable is not set.');
      console.error('Please set it with: export DB_PASSWORD=your_password');
      console.error('Or use the interactive version: node create-medication-logs-table.js');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to Supabase PostgreSQL database...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Create the table
    console.log('\n📋 Creating medication_logs table...');
    await client.query(createTableSQL);
    console.log('✅ medication_logs table created successfully!');
    
    // Create indexes
    console.log('\n🗂️  Creating indexes...');
    for (let i = 0; i < createIndexesSQL.length; i++) {
      const indexSQL = createIndexesSQL[i];
      await client.query(indexSQL);
      console.log(`✅ Index ${i + 1}/${createIndexesSQL.length} created`);
    }
    console.log('✅ All indexes created successfully!');
    
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
    
    console.log('\n🎉 medication_logs table setup completed successfully!');
    
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
  createMedicationLogsTable();
}

module.exports = { createMedicationLogsTable };