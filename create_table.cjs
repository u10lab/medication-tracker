const { Client } = require('pg');
const readline = require('readline');

// Create readline interface for password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to hide password input
function hideInput() {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
}

// Function to get password input
function getPassword() {
  return new Promise((resolve) => {
    rl.question('Enter PostgreSQL password: ', (password) => {
      resolve(password);
    });
  });
}

// SQL to create the medication_patterns table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.medication_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  pattern_name VARCHAR(255) NOT NULL,
  schedule_type VARCHAR(50) NOT NULL DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'as_needed', 'custom')),
  days_of_week INT[] CHECK (array_length(days_of_week, 1) <= 7 AND days_of_week <@ ARRAY[0,1,2,3,4,5,6]),
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
    (schedule_type != 'weekly') OR (days_of_week IS NOT NULL AND array_length(days_of_week, 1) >= 1)
  ),
  CONSTRAINT valid_interval CHECK (
    (schedule_type != 'custom') OR (interval_hours IS NOT NULL)
  )
);
`;

// SQL to create indexes
const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_medication_patterns_user_id ON public.medication_patterns(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_medication_patterns_medication_id ON public.medication_patterns(medication_id);',
  'CREATE INDEX IF NOT EXISTS idx_medication_patterns_active ON public.medication_patterns(is_active) WHERE is_active = true;',
  'CREATE INDEX IF NOT EXISTS idx_medication_patterns_schedule ON public.medication_patterns(schedule_type, start_date, end_date);'
];

async function main() {
  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    console.log('Host: db.gwlospsmdgdmlyjxudmq.supabase.co');
    console.log('User: postgres');
    console.log('Database: postgres');
    console.log('Port: 5432');
    console.log();

    // Get password from user
    const password = await getPassword();
    rl.close();

    // Create database client
    const client = new Client({
      host: 'db.gwlospsmdgdmlyjxudmq.supabase.co',
      user: 'postgres',
      password: password,
      database: 'postgres',
      port: 5432,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Connect to database
    console.log('\nConnecting to database...');
    await client.connect();
    console.log('✓ Successfully connected to Supabase PostgreSQL!');

    // Create table
    console.log('\nCreating medication_patterns table...');
    await client.query(createTableSQL);
    console.log('✓ Table medication_patterns created successfully!');

    // Create indexes
    console.log('\nCreating indexes...');
    for (const indexSQL of createIndexesSQL) {
      await client.query(indexSQL);
    }
    console.log('✓ All indexes created successfully!');

    // Verify table creation
    console.log('\nVerifying table structure...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'medication_patterns'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTable structure:');
    console.table(result.rows);

    // Close connection
    await client.end();
    console.log('\n✓ Database connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();