import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleMentors() {
  try {
    // Generate a proper UUID
    const creatorId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    
    // First, create a sample profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: creatorId,
        email: 'creator@example.com',
        name: 'Sample Creator',
        is_creator: true
      })
      .select()
      .single();

    if (profileError && profileError.code !== '23505') { // 23505 is unique violation
      console.error('Error creating profile:', profileError);
      return;
    }

    // Now add sample mentors
    const sampleMentors = [
      {
        creator_id: creatorId,
        name: 'AI Business Coach',
        title: 'Entrepreneurship & Strategy Expert',
        description: 'I help entrepreneurs build successful businesses with proven strategies and insights from 10+ years of experience.',
        price: 49,
        expertise: ['Business Strategy', 'Entrepreneurship', 'Marketing'],
        status: 'active'
      },
      {
        creator_id: creatorId,
        name: 'Code Mentor Pro',
        title: 'Senior Software Engineer',
        description: 'Learn modern web development, best practices, and career advancement tips from a seasoned developer.',
        price: 39,
        expertise: ['JavaScript', 'React', 'Node.js', 'Career Development'],
        status: 'active'
      },
      {
        creator_id: creatorId,
        name: 'Fitness Guru AI',
        title: 'Personal Trainer & Nutritionist',
        description: 'Transform your body and mind with personalized fitness plans and nutrition guidance.',
        price: 29,
        expertise: ['Fitness', 'Nutrition', 'Weight Loss', 'Muscle Building'],
        status: 'active'
      }
    ];

    const { data, error } = await supabase
      .from('mentors')
      .insert(sampleMentors)
      .select();

    if (error) {
      console.error('Error adding mentors:', error);
    } else {
      console.log('Sample mentors added successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addSampleMentors();
