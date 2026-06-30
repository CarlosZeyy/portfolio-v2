import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY muse be a valid value"),
  })

const envVars = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY,
});

export const env = envVars;

