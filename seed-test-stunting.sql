-- ============================================================
-- TEST DATA: Anak Stunting untuk Orang Tua "Budi Santoso"
-- ============================================================
-- Akun Login:
--   Email    : budi.santoso@test.com
--   Password : password123
--
-- Data Anak: Ahmad Fajar Santoso (Laki-laki, 18 bulan)
--   BB: 8.5 kg  → 78% dari standar WHO → KURANG → Badge: Butuh Kalori
--   TB: 73.0 cm → 88.7% dari standar WHO → KURANG
--   LK: 44.0 cm → 93% dari standar WHO → KURANG → Badge: Fokus Nutrisi Otak
-- ============================================================

-- HAPUS DATA LAMA JIKA ADA (agar bisa re-run tanpa error)
DO $$ 
DECLARE 
  old_id uuid;
BEGIN
  SELECT id INTO old_id FROM auth.users WHERE email = 'budi.santoso@test.com';
  IF old_id IS NOT NULL THEN
    DELETE FROM public.histori_perkembangan WHERE child_id IN (SELECT id FROM public.children WHERE user_id = old_id);
    DELETE FROM public.children WHERE user_id = old_id;
    DELETE FROM public.profiles WHERE id = old_id;
    DELETE FROM auth.identities WHERE user_id = old_id;
    DELETE FROM auth.users WHERE id = old_id;
    RAISE NOTICE 'Data lama dihapus.';
  END IF;
END $$;

-- BUAT USER BARU
DO $$ 
DECLARE 
  user_id uuid := gen_random_uuid();
  child_id uuid := gen_random_uuid();
BEGIN
  -- 1. BUAT AKUN AUTH
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    user_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated', 
    'authenticated', 
    'budi.santoso@test.com', 
    crypt('password123', gen_salt('bf')), 
    now(),
    '{"provider":"email","providers":["email"]}', 
    '{"full_name":"Budi Santoso"}', 
    now(), 
    now(),
    '', '', '', ''
  );

  -- 2. BUAT IDENTITY (WAJIB untuk Supabase v2 agar login bisa berhasil!)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    json_build_object('sub', user_id::text, 'email', 'budi.santoso@test.com')::jsonb,
    'email',
    user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. BUAT PROFIL
  INSERT INTO public.profiles (id, email, full_name, phone, address, role)
  VALUES (
    user_id, 
    'budi.santoso@test.com', 
    'Budi Santoso',
    '081234567890',
    'Jl. Melati No. 12, Surabaya',
    'user'
  );

  -- 4. BUAT DATA ANAK (STUNTING)
  INSERT INTO public.children (
    id, user_id, nama_anak, tanggal_lahir, jenis_kelamin,
    umur_bulan, berat_badan, tinggi_badan, 
    lingkar_lengan, lingkar_kepala,
    alergi, mikrobiota
  ) VALUES (
    child_id,
    user_id,
    'Ahmad Fajar Santoso',
    '2024-10-17',
    'Laki-laki',
    18,
    8.5,            -- BB: 78% standar (KURANG) → Badge: Butuh Kalori Tambahan
    73.0,           -- TB: 88.7% standar (KURANG)
    12.5,           -- LILA
    44.0,           -- LK: 93% standar (KURANG) → Badge: Fokus Nutrisi Otak
    'Susu Sapi',
    'Kurang'        -- Mikrobiota kurang → tambah rekomendasi probiotik
  );

  -- 5. HISTORI PERKEMBANGAN (6 titik data: bulan 6 → 18)
  INSERT INTO public.histori_perkembangan (child_id, berat_badan, tinggi_badan, lingkar_lengan, lingkar_kepala, umur_bulan, created_at)
  VALUES 
    (child_id, 6.8, 63.0, 12.0, 41.5, 6,  now() - interval '12 months'),
    (child_id, 7.2, 66.0, 12.1, 42.0, 9,  now() - interval '9 months'),
    (child_id, 7.8, 69.0, 12.2, 42.8, 12, now() - interval '6 months'),
    (child_id, 8.0, 70.5, 12.3, 43.2, 14, now() - interval '4 months'),
    (child_id, 8.2, 71.5, 12.4, 43.5, 16, now() - interval '2 months'),
    (child_id, 8.5, 73.0, 12.5, 44.0, 18, now());

  RAISE NOTICE '✅ Data test berhasil dibuat!';
  RAISE NOTICE 'Login: budi.santoso@test.com / password123';

END $$;
