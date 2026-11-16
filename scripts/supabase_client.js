import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';

// The anon key is safe to use in a browser. Database access is protected by RLS
// policies in database.sql; never put a Supabase service-role key here.
const supabaseUrl = 'https://fdyotcebddysmxfjvhjy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeW90Y2ViZGR5c214Zmp2aGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTA2ODksImV4cCI6MjA5OTUyNjY4OX0._42PWy8Z1wRe_FaPvbC-X5N9H9RTdPg1kGaZp0js3M4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
