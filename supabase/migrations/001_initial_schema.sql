-- Create enum for user skill types
CREATE TYPE skill_type AS ENUM ('offering', 'seeking');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_skills table
CREATE TABLE public.user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  type skill_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_id, type)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status match_status DEFAULT 'pending'::match_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user1_id, user2_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Skills Policies
CREATE POLICY "Skills are viewable by everyone."
  ON public.skills FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create skills."
  ON public.skills FOR INSERT TO authenticated WITH CHECK (true);

-- User Skills Policies
CREATE POLICY "User skills are viewable by everyone."
  ON public.user_skills FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills."
  ON public.user_skills FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Matches Policies
CREATE POLICY "Users can view their own matches."
  ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches."
  ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own matches."
  ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create a trigger to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Pre-populate some skills
INSERT INTO public.skills (name, category) VALUES 
  ('React', 'Programming'),
  ('TypeScript', 'Programming'),
  ('UI Design', 'Design'),
  ('Conversational Spanish', 'Languages'),
  ('Piano', 'Music'),
  ('Watercolor Painting', 'Art'),
  ('Sourdough Baking', 'Cooking'),
  ('Vinyasa Yoga', 'Fitness')
ON CONFLICT (name) DO NOTHING;
