-- Remove the dangerous execute_admin_query function that has SQL injection vulnerability
-- This function allowed authenticated admins to execute arbitrary SELECT queries with string concatenation
-- which could be exploited via semicolons, UNION clauses, and SQL comments

DROP FUNCTION IF EXISTS public.execute_admin_query(text);

-- Note: If admin query functionality is needed in the future, implement it using:
-- 1. An allowlist of specific pre-approved queries with query_name parameter
-- 2. Prepared statements with proper parameter binding
-- 3. Comprehensive audit logging of all query executions
-- 4. Strict validation and query parsing before execution