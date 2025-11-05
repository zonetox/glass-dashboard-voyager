-- Add DELETE policy for api_logs to allow users to delete their own logs
CREATE POLICY "Users can delete their own API logs"
ON public.api_logs
FOR DELETE
USING (auth.uid() = user_id);