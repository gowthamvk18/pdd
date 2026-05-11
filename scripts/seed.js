import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars manually since we might not have dotenv
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_USERS = [
  {
    email: 'alice@example.com',
    password: 'password123',
    profile: {
      full_name: 'Alice Cooper',
      bio: 'Senior React Developer with 5 years of experience. I love helping beginners find their footing in the React ecosystem!',
      location: 'San Francisco, CA'
    },
    offers: ['React', 'TypeScript'],
    seeks: ['UI Design']
  },
  {
    email: 'carlos@example.com',
    password: 'password123',
    profile: {
      full_name: 'Carlos Ruiz',
      bio: 'Native Spanish speaker from Madrid. Passionate about languages and currently diving into frontend development.',
      location: 'Madrid, Spain'
    },
    offers: ['Conversational Spanish'],
    seeks: ['React', 'TypeScript']
  },
  {
    email: 'maya@example.com',
    password: 'password123',
    profile: {
      full_name: 'Maya Patel',
      bio: 'UI/UX Designer by day, aspiring sourdough baker by night. Let us trade design tips for baking secrets!',
      location: 'London, UK'
    },
    offers: ['UI Design', 'Watercolor Painting'],
    seeks: ['Sourdough Baking'],
    portfolio: [
      { title: 'Modern SaaS Dashboard', description: 'A clean, dark-themed dashboard for a fintech startup.', project_url: 'https://behance.net' },
      { title: 'Nature in Watercolor', description: 'A series of landscapes painted during my trip to the Alps.', project_url: 'https://instagram.com' }
    ]
  },
  {
    email: 'sarah@example.com',
    password: 'password123',
    profile: {
      full_name: 'Sarah Jenkins',
      bio: 'Digital Marketing Strategist. I can help you with SEO, SEM, and Content Strategy.',
      location: 'New York, NY'
    },
    offers: ['Digital Marketing', 'SEO'],
    seeks: ['Photography'],
    portfolio: [
      { title: 'E-commerce Growth Hack', description: 'Increased sales by 40% for a boutique clothing brand using targeted ads.', project_url: 'https://sarahjenkins.me' }
    ]
  },
  {
    email: 'kenji@example.com',
    password: 'password123',
    profile: {
      full_name: 'Kenji Sato',
      bio: 'Professional Photographer specialized in urban landscapes and street photography.',
      location: 'Tokyo, Japan'
    },
    offers: ['Photography', 'Photo Editing'],
    seeks: ['Digital Marketing'],
    portfolio: [
      { title: 'Shibuya at Midnight', description: 'A photo essay capturing the energy of Tokyo after dark.', project_url: 'https://flickr.com' }
    ]
  }
];

async function seed() {
  console.log("Starting database seeding...");

  // Fetch all skills to map names to IDs
  const { data: skills, error: skillsError } = await supabase.from('skills').select('*');
  if (skillsError) {
    console.error("Failed to fetch skills:", skillsError);
    return;
  }
  
  const skillMap = {};
  skills.forEach(s => skillMap[s.name] = s.id);

  for (const mock of MOCK_USERS) {
    console.log(`Processing ${mock.profile.full_name}...`);
    
    // 1. Sign up the user (this creates the auth record and triggers the profile creation)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: mock.email,
      password: mock.password,
      options: {
        data: {
          full_name: mock.profile.full_name
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`  User ${mock.email} already exists. Skipping...`);
        continue;
      }
      console.error(`  Auth Error for ${mock.email}:`, authError);
      continue;
    }

    const userId = authData.user.id;
    console.log(`  Created auth user with ID: ${userId}`);

    // Wait a moment for the database trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Update Profile with bio and location
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        bio: mock.profile.bio,
        location: mock.profile.location
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error(`  Failed to update profile:`, profileError);
    } else {
      console.log(`  Updated profile details.`);
    }

    // 3. Assign Offering Skills
    for (const skillName of mock.offers) {
      const skillId = skillMap[skillName];
      if (skillId) {
        await supabase.from('user_skills').insert({
          user_id: userId,
          skill_id: skillId,
          type: 'offering'
        });
      }
    }

    // 4. Assign Seeking Skills
    for (const skillName of mock.seeks) {
      const skillId = skillMap[skillName];
      if (skillId) {
        await supabase.from('user_skills').insert({
          user_id: userId,
          skill_id: skillId,
          type: 'seeking'
        });
      }
    }
    
    }
    
    // 5. Add Portfolio Items
    if (mock.portfolio) {
      for (const item of mock.portfolio) {
        await supabase.from('portfolio_items').insert({
          user_id: userId,
          ...item
        });
      }
      console.log(`  Added portfolio projects.`);
    }
    
    console.log(`  Added user data successfully.`);
  }

  console.log("Seeding complete! You can now log in with the test accounts (password: password123) or your own account.");
}

seed().catch(console.error);
