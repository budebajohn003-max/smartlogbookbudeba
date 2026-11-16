import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';
import { supabaseAnonKey, supabaseUrl } from './config.js';

// Browser access must use the public anon key and rely on verified database RLS.
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project-id') ||
  supabaseAnonKey.includes('replace-with-your')
) {
  throw new Error('Configure Supabase in the ignored scripts/config.js file before using the application.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
