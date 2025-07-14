import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fypojidkqslwpswwgiga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cG9qaWRrcXNsd3Bzd3dnaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjMzMDEsImV4cCI6MjA2Nzk5OTMwMX0.6hiMBjeOnfCkBnmyO261j4nBbKyl6yQOCmJDK_lCwO4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 