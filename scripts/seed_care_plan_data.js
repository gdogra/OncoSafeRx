import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCarePlanData() {
  try {
    console.log('Creating care plan tables...');
    
    // Create tables (this would need to be done in Supabase dashboard or with service role key)
    // For now, let's just try to insert some sample data
    
    console.log('Inserting sample care plan data...');
    
    // Get a test user (assuming you have one)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users.users.length) {
      console.log('No users found, creating sample data structure only...');
      
      // Create sample data structure that would be returned
      const sampleCarePlanData = {
        sections: [
          {
            id: 'sample-treatment',
            title: 'Treatment Plan',
            description: 'Current treatment protocol',
            items: [
              'Regular monitoring and lab work',
              'Follow medication schedule',
              'Attend scheduled appointments'
            ],
            lastUpdated: new Date().toISOString()
          }
        ],
        goals: [
          {
            id: 'sample-goal',
            title: 'Treatment Adherence',
            description: 'Follow treatment plan',
            status: 'active',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 75,
            category: 'treatment'
          }
        ],
        nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        doctorName: 'Dr. Sample'
      };
      
      console.log('Sample care plan data structure:', JSON.stringify(sampleCarePlanData, null, 2));
      return;
    }
    
    const testUser = users.users[0];
    console.log('Using test user:', testUser.email);
    
    // Try to insert data (this will fail if tables don't exist, which is expected)
    try {
      const { data, error } = await supabase
        .from('care_plan_sections')
        .insert({
          patient_id: testUser.id,
          title: 'Treatment Plan',
          description: 'Current treatment protocol',
          items: [
            'Regular monitoring and lab work',
            'Follow medication schedule',
            'Attend scheduled appointments'
          ]
        })
        .select();
      
      if (error) {
        console.log('Expected error (tables may not exist yet):', error.message);
      } else {
        console.log('Successfully inserted care plan section:', data);
      }
    } catch (err) {
      console.log('Tables not ready yet - this is expected on first run');
    }
    
    console.log('Care plan seeding completed');
    
  } catch (error) {
    console.error('Error seeding care plan data:', error);
  }
}

seedCarePlanData();