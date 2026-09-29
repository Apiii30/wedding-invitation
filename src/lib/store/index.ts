import "server-only";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";

export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY;

export const store = isDemoMode ? memoryStore : supabaseStore;
