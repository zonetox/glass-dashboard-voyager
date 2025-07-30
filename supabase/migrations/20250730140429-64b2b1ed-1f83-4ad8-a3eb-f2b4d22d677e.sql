-- Create function for admin query execution (SELECT only)
CREATE OR REPLACE FUNCTION execute_admin_query(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow SELECT queries for security
  IF NOT (query ILIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  -- Execute the query and return as JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permission to authenticated users with admin role
REVOKE ALL ON FUNCTION execute_admin_query(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_admin_query(text) TO authenticated;