import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function hashPasswords() {
  console.log('🚀 Starting password hashing script...\n');

  // 1. Process Students
  const { data: students, error: sError } = await supabase.from('students').select('id, password');
  if (sError) console.error('Error fetching students:', sError);
  else {
    for (const student of students) {
      if (student.password && !student.password.startsWith('$2a$')) {
        const hashed = await bcrypt.hash(student.password, 10);
        await supabase.from('students').update({ password: hashed }).eq('id', student.id);
        console.log(`✅ Hashed password for student ID: ${student.id}`);
      }
    }
  }

  // 2. Process Mentors
  const { data: mentors, error: mError } = await supabase.from('mentors').select('id, password');
  if (mError) console.error('Error fetching mentors:', mError);
  else {
    for (const mentor of mentors) {
      if (mentor.password && !mentor.password.startsWith('$2a$')) {
        const hashed = await bcrypt.hash(mentor.password, 10);
        await supabase.from('mentors').update({ password: hashed }).eq('id', mentor.id);
        console.log(`✅ Hashed password for mentor ID: ${mentor.id}`);
      }
    }
  }

  console.log('\n✨ Password hashing complete!');
}

hashPasswords().catch(console.error);
