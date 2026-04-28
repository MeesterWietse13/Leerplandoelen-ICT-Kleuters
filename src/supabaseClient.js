import { createClient } from '@supabase/supabase-js';

// Supabase connectie
const supabaseUrl = 'https://iizfaivakjpbzstzngyk.supabase.co';
const supabaseAnonKey = 'sb_publishable_CI4o7DQivD14n7UmyfZnaQ_8XxKAc9_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
