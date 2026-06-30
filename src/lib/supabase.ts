import { createBrowserClient } from "@supabase/ssr";
import { env } from "./envSchema";

export function createClient() {
    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY,
    )
}