import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const SUPABASE_URL = 'https://kwgvedhtvmaurhejrtek.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bsOp99zOvYGDeApwqttQEg_1Nsw6kMI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);