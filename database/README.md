# OncoSafeRx Database Setup

This directory contains the database schema and migration scripts for the OncoSafeRx platform.

## Quick Setup

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and service role key
3. Update your `.env` file:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 2. Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Run the script to create all tables and functions

### 3. Set up Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Configure redirect URLs for your domain
4. Optionally set up social providers (Google, GitHub, etc.)

### 4. Load Sample Data

Run the sample data script to populate initial data:
```bash
npm run db:seed
```

## Database Schema Overview

### Core Tables

- **users**: User accounts with roles and preferences
- **drugs**: Comprehensive drug information (RxNorm, brand names, etc.)
- **drug_interactions**: Known drug-drug interactions with severity levels
- **genes**: Pharmacogenomic genes (CYP2D6, CYP2C19, etc.)
- **gene_drug_interactions**: Gene-drug interactions for personalized medicine
- **cpic_guidelines**: CPIC guideline recommendations

### Clinical Tables

- **oncology_protocols**: Standardized treatment regimens
- **clinical_trials**: Trial information for patient matching
- **patient_cases**: Educational cases and scenarios

### Audit & Tracking

- **interaction_checks**: Log of all interaction checks performed
- **sync_logs**: Track data synchronization from external APIs
- **user_pgx_profiles**: User pharmacogenomic profiles

## Data Sources

The platform integrates data from:

1. **RxNorm**: Drug terminology and basic interaction data
2. **CPIC**: Pharmacogenomic guidelines
3. **FDA DailyMed**: Drug labeling information
4. **ClinicalTrials.gov**: Clinical trial data
5. **Curated Database**: Manually verified interactions

## Security Features

- Row Level Security (RLS) enabled for user data
- Role-based access control
- Audit trails for all interactions
- Data encryption at rest and in transit

## Maintenance

### Regular Tasks

1. **Data Synchronization**: Update drug databases monthly
2. **Performance Monitoring**: Check query performance
3. **Backup Verification**: Ensure backups are working
4. **Security Audits**: Review access patterns

### Monitoring Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Monitor interaction check volume
SELECT DATE(created_at), COUNT(*) 
FROM interaction_checks 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);

-- Review slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Connection Issues**: Check Supabase URL and keys
2. **Permission Errors**: Verify RLS policies
3. **Performance Issues**: Check indexes and query plans
4. **Data Inconsistency**: Run data validation scripts

### Support

For technical issues:
1. Check Supabase logs
2. Review application logs
3. Contact development team with error details