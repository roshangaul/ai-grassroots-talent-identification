import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ueccldbdknshvwgkfksh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlY2NsZGJka25zaHZ3Z2tma3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNzQyMjIsImV4cCI6MjEwMjY1MDIyMn0.UXZySm1cHovU8GAmo01Rd1PHj_9On2iIW7GBjyQJuho'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)