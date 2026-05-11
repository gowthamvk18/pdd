-- Run this in your Supabase SQL Editor to bypass email rate limits and create mock users!

DO $$
DECLARE
  alice_id UUID := gen_random_uuid();
  carlos_id UUID := gen_random_uuid();
  maya_id UUID := gen_random_uuid();
  
  skill_react UUID;
  skill_typescript UUID;
  skill_uidesign UUID;
  skill_spanish UUID;
  skill_painting UUID;
  skill_baking UUID;
BEGIN
  -- Insert Auth Users (Password for all is 'password123')
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (alice_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alice Cooper"}', now(), now()),
    (carlos_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Ruiz"}', now(), now()),
    (maya_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maya Patel"}', now(), now());

  -- The profiles were automatically created by the trigger. Now update them.
  UPDATE public.profiles SET bio = 'Senior React Developer with 5 years of experience. I love helping beginners find their footing in the React ecosystem!', location = 'San Francisco, CA' WHERE id = alice_id;
  UPDATE public.profiles SET bio = 'Native Spanish speaker from Madrid. Passionate about languages and currently diving into frontend development.', location = 'Madrid, Spain' WHERE id = carlos_id;
  UPDATE public.profiles SET bio = 'UI/UX Designer by day, aspiring sourdough baker by night. Let us trade design tips for baking secrets!', location = 'London, UK' WHERE id = maya_id;

  -- Get Skill IDs
  SELECT id INTO skill_react FROM public.skills WHERE name = 'React';
  SELECT id INTO skill_typescript FROM public.skills WHERE name = 'TypeScript';
  SELECT id INTO skill_uidesign FROM public.skills WHERE name = 'UI Design';
  SELECT id INTO skill_spanish FROM public.skills WHERE name = 'Conversational Spanish';
  SELECT id INTO skill_painting FROM public.skills WHERE name = 'Watercolor Painting';
  SELECT id INTO skill_baking FROM public.skills WHERE name = 'Sourdough Baking';

  -- Insert User Skills
  INSERT INTO public.user_skills (user_id, skill_id, type) VALUES
    (alice_id, skill_react, 'offering'),
    (alice_id, skill_typescript, 'offering'),
    (alice_id, skill_uidesign, 'seeking'),
    
    (carlos_id, skill_spanish, 'offering'),
    (carlos_id, skill_react, 'seeking'),
    (carlos_id, skill_typescript, 'seeking'),
    
    (maya_id, skill_uidesign, 'offering'),
    (maya_id, skill_painting, 'offering'),
    (maya_id, skill_baking, 'seeking');

END $$;
