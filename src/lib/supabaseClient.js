// Importamos el cliente oficial de Supabase.
import { createClient } from "@supabase/supabase-js";

// Leemos las variables desde el archivo .env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el cliente de Supabase para usarlo en toda la app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);