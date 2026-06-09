// Importamos React y Supabase.
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Creamos el contexto de autenticación.
const AuthContext = createContext(null);

// Este provider guarda el usuario actual y su perfil.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el perfil del usuario desde la tabla profiles.
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(data);
    }
  };

  useEffect(() => {
    // Revisamos si ya hay una sesión iniciada.
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      }

      setLoading(false);
    };

    getSession();

    // Escuchamos cambios de login/logout.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cerrar sesión.
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar auth fácilmente en cualquier componente.
export function useAuth() {
  return useContext(AuthContext);
}