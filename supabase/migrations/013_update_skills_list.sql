-- Clear existing pre-populated skills (will cascade delete user_skills associations)
DELETE FROM public.skills;

-- Insert new B.Tech technical skills and general educational topics
INSERT INTO public.skills (name, category) VALUES
  -- B.Tech Technical Skills (Programming & CSE)
  ('Python', 'Programming'),
  ('Java', 'Programming'),
  ('C++', 'Programming'),
  ('JavaScript', 'Programming'),
  ('HTML & CSS', 'Web Development'),
  ('React.js', 'Web Development'),
  ('SQL & Databases', 'Databases'),
  ('Data Structures & Algorithms', 'Computer Science'),
  ('Machine Learning', 'Artificial Intelligence'),
  ('Operating Systems', 'Computer Science'),
  ('Computer Networks', 'Computer Science'),
  ('Git & GitHub', 'Tools'),

  -- Educational Topics
  ('Geography', 'Social Sciences'),
  ('World History', 'Social Sciences'),
  ('Mathematics (Calculus)', 'Basic Sciences'),
  ('Physics (Electromagnetism)', 'Basic Sciences'),
  ('Organic Chemistry', 'Basic Sciences'),
  ('English Literature', 'Humanities'),
  ('Economics', 'Social Sciences')
ON CONFLICT (name) DO NOTHING;
