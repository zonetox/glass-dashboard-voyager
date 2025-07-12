-- Tạo admin user đầu tiên 
-- Lưu ý: Email và password sẽ cần được tạo qua Supabase Auth UI hoặc signUp
-- Sau đó update role thành admin bằng cách insert vào user_roles

-- Hướng dẫn:
-- 1. Đăng ký tài khoản admin qua /auth với email: admin@seoautotool.com  
-- 2. Sau khi tạo xong, chạy query này với user_id thực tế:

-- UPDATE user_roles 
-- SET role = 'admin' 
-- WHERE user_id = 'USER_ID_FROM_AUTH_USERS_TABLE';

-- Để tiện lợi, tạo function để promote user thành admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(_user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Tìm user theo email (cần query từ auth.users, chỉ admin mới được làm điều này)
  -- Vì không thể query trực tiếp auth.users từ public schema
  -- Nên cần manual update qua SQL editor trong Supabase dashboard
  
  RETURN FALSE; -- Placeholder function
END;
$$;

-- Thêm comment hướng dẫn
COMMENT ON FUNCTION public.promote_to_admin(TEXT) IS 'Function to promote user to admin role. Use Supabase dashboard to manually update user_roles table.';