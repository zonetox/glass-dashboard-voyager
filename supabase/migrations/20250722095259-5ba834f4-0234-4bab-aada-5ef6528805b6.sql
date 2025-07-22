-- Tạo admin user đầu tiên
-- Vì không thể tạo user trực tiếp trong migration, ta sẽ tạo function để promote user thành admin

-- Function để promote user thành admin bằng email
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Tìm user_id từ bảng user_profiles dựa trên email
  -- (Giả sử email được lưu trong metadata hoặc có table riêng)
  
  -- Thêm admin role cho user (nếu user tồn tại)
  -- Lưu ý: Cần user đăng ký trước, sau đó run function này
  
  -- Tạm thời return false, sẽ cần manual update sau
  RETURN false;
END;
$$;

-- Tạo một admin user mặc định với thông tin cơ bản
-- Email: admin@seoanalyzer.com 
-- Role: admin
-- Lưu ý: Cần tạo user qua auth.users trước, sau đó chạy lệnh SQL sau:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@seoanalyzer.com');

-- Thêm default admin settings nếu chưa có
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('smtp_host', '', 'SMTP Host for sending emails'),
('smtp_port', '587', 'SMTP Port'),
('smtp_user', '', 'SMTP Username'),
('smtp_password', '', 'SMTP Password')
ON CONFLICT (setting_key) DO NOTHING;