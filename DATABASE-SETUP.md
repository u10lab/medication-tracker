# Database Setup Scripts

This directory contains Node.js scripts to create database tables in your Supabase PostgreSQL database.

## Scripts

### 1. `create-medication-logs-table.js` (Interactive)
- Prompts for the database password interactively
- Securely handles password input (masked with asterisks)
- Best for manual execution

**Usage:**
```bash
node create-medication-logs-table.js
```

### 2. `create-medication-logs-table-env.js` (Environment Variable)
- Reads password from `DB_PASSWORD` environment variable
- Better for automation and CI/CD pipelines

**Usage:**
```bash
# Set the password as environment variable
export DB_PASSWORD=your_supabase_postgres_password

# Run the script
node create-medication-logs-table-env.js
```

## Table Created: `medication_logs`

The script creates a comprehensive medication logging table with the following features:

### Columns:
- `id`: UUID primary key (auto-generated)
- `user_id`: Foreign key to auth.users (CASCADE DELETE)
- `medication_id`: Foreign key to medications table (CASCADE DELETE)  
- `medication_pattern_id`: Foreign key to medication_patterns table (SET NULL on DELETE)
- `scheduled_time`: When the medication was scheduled to be taken
- `taken_time`: When the medication was actually taken (nullable)
- `dosage_amount`: Amount of medication (DECIMAL with CHECK > 0)
- `dosage_unit`: Unit of measurement (default: 'mg')
- `status`: Current status with CHECK constraint ('scheduled', 'taken', 'skipped', 'missed', 'partial')
- `notes`: Optional text notes
- `side_effects`: Array of text for tracking side effects
- `effectiveness_rating`: Integer rating 1-5 (nullable)
- `created_at`: Timestamp (auto-set)
- `updated_at`: Timestamp (auto-set)

### Constraints:
- **Check Constraints**: Ensure data integrity for dosage_amount, status, and effectiveness_rating
- **Valid Taken Time**: Ensures taken_time is set if and only if status is 'taken' or 'partial'
- **Foreign Key Constraints**: Proper relationships with users, medications, and patterns tables

### Indexes (for Performance):
- `idx_medication_logs_user_id`: Fast user-based queries
- `idx_medication_logs_medication_id`: Fast medication-based queries  
- `idx_medication_logs_pattern_id`: Fast pattern-based queries
- `idx_medication_logs_scheduled_time`: Fast time-based queries (DESC)
- `idx_medication_logs_status`: Fast status-based filtering
- `idx_medication_logs_taken_time`: Fast queries on actual take times (partial index)
- `idx_medication_logs_user_date`: Composite index for user+date queries

## Database Connection Details

- **Host**: db.gwlospsmdgdmlyjxudmq.supabase.co
- **User**: postgres
- **Database**: postgres  
- **Port**: 5432
- **SSL**: Required (rejectUnauthorized: false)

## Verification

Both scripts automatically verify the table creation by:
1. Displaying all table columns and their properties
2. Listing all created indexes with their definitions
3. Showing all table constraints

## Prerequisites

- Node.js installed
- `pg` package installed (already in package.json)
- Valid Supabase PostgreSQL credentials
- Existing `medications` and `medication_patterns` tables (referenced as foreign keys)

## Error Handling

Both scripts include comprehensive error handling and will:
- Display clear error messages
- Show PostgreSQL error codes and details
- Exit gracefully with proper cleanup
- Close database connections properly