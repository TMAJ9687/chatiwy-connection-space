// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ldcbhpkreeiywogrnsom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkY2JocGtyZWVpeXdvZ3Juc29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjM0OTksImV4cCI6MjA1NjkzOTQ5OX0.Pk7OT2raoZ7aV7gEdyA-QB0qIItXZNZPLJGxGVGUtz0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);