import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://acfmhybvlbqotkjjxjjd.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjZm1oeWJ2bGJxb3Rramp4ampkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODA5OTEsImV4cCI6MjA2Mzc1Njk5MX0.5CNRnCmBD24k3ojVnxnE7TKfwIrmoen90wE9j68DqFc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
