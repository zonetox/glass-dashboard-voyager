-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run autopilot cycle every day at 2 AM UTC
-- This will check users and run autopilot for those who are due
SELECT cron.schedule(
  'autopilot-daily-check',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://ycjdrqyztzweddtcodjo.supabase.co/functions/v1/run-autopilot-cycle',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljamRycXl6dHp3ZWRkdGNvZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc4MTQsImV4cCI6MjA2NzA5MzgxNH0.1hVFiDBUwBVrU8RnA4cBXDixt4-EQnNF6qtET7ruWXo"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Also enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;