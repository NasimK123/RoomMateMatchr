import { createClient } from '@supabase/supabase-js'

// You’ll get these keys from your Supabase dashboard
const supabaseUrl = 'https://fkfsuglsbexqyllmufak.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZnN1Z2xzYmV4cXlsbG11ZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzQ1MzQsImV4cCI6MjA2MzM1MDUzNH0.zpgg6TlJaTp7bs0xXDdsyvsAconNWIlibphUmCzZM9I'

export const supabase = createClient(supabaseUrl, supabaseKey)
