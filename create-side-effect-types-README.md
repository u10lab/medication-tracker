# Side Effect Types Table Creation Script

## Overview
This script creates the `side_effect_types` table in your Supabase PostgreSQL database with all necessary indexes and sample data.

## Files
- `create-side-effect-types-table.cjs` - Main script to create the table

## Prerequisites
- Node.js installed
- PostgreSQL client library (`pg`) - already installed in this project
- Supabase database password

## Database Schema
The script creates a table with the following structure:

```sql
CREATE TABLE public.side_effect_types (
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
```

## Indexes Created
- `idx_side_effect_types_name` - For name lookups
- `idx_side_effect_types_severity` - For filtering by severity level
- `idx_side_effect_types_category` - For filtering by category
- `idx_side_effect_types_common` - Partial index for common side effects
- `idx_side_effect_types_medical_attention` - Partial index for side effects requiring medical attention

## Sample Data
The script inserts 10 common side effects with Japanese names and descriptions:
1. 頭痛 (Headache) - mild, 神経系
2. 吐き気 (Nausea) - mild, 消化器系
3. めまい (Dizziness) - mild, 神経系
4. 眠気 (Drowsiness) - mild, 神経系
5. 便秘 (Constipation) - mild, 消化器系
6. 下痢 (Diarrhea) - mild, 消化器系
7. 皮膚発疹 (Skin rash) - moderate, 皮膚
8. 呼吸困難 (Difficulty breathing) - severe, 呼吸器系
9. 動悸 (Palpitations) - moderate, 循環器系
10. アナフィラキシー (Anaphylaxis) - critical, アレルギー

## Usage

### Step 1: Get Database Password
You need to get your Supabase database password from the Supabase dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project (gwlospsmdgdmlyjxudmq)
3. Go to Settings > Database
4. Copy the password from the Connection info section

### Step 2: Set Environment Variable
```bash
export DB_PASSWORD=your_actual_password_here
```

### Step 3: Run the Script
```bash
node create-side-effect-types-table.cjs
```

## Expected Output
The script will:
1. Connect to the database
2. Create the table (if it doesn't exist)
3. Create all indexes
4. Insert sample data (using ON CONFLICT DO NOTHING to avoid duplicates)
5. Verify table structure
6. Display indexes and constraints
7. Show the inserted sample data

## Connection Details
- Host: db.gwlospsmdgdmlyjxudmq.supabase.co
- User: postgres
- Database: postgres
- Port: 5432
- SSL: enabled (rejectUnauthorized: false)

## Error Handling
The script includes comprehensive error handling:
- Checks for required environment variables
- Provides detailed error messages
- Gracefully closes database connections
- Uses proper exit codes

## Safety Features
- Uses `CREATE TABLE IF NOT EXISTS` to avoid errors if table already exists
- Uses `CREATE INDEX IF NOT EXISTS` for indexes
- Uses `ON CONFLICT (name) DO NOTHING` for sample data to prevent duplicates
- Includes data validation with CHECK constraints