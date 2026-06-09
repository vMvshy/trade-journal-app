// Importamos React y Supabase.
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getSignedImageUrl } from "../services/imageService";

// Creamos el contexto de autenticación.
const AuthContext = createContext(null);

// Este provider guarda el usuario actual, su perfil y la foto de perfil ya cargada.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Función para cargar el perfil del usuario desde la tabla profiles.
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      setProfile(null);
      setAvatarUrl("");
      return null;
    }

    setProfile(data);

    // Si el perfil tiene avatar, cargamos la URL firmada una sola vez.
    if (data?.avatar_path) {
      try {
        const url = await getSignedImageUrl("profile-images", data.avatar_path);
        setAvatarUrl(url);
      } catch (error) {
        console.error(error.message);
        setAvatarUrl("");
      }
    } else {
      setAvatarUrl("");
    }

    return data;
  };

  // Refresca el perfil después de actualizar nombre, username o avatar.
  const refreshProfile = async () => {
    if (!user?.id) return null;
    return await loadProfile(user.id);
  };

  useEffect(() => {
    // Revisamos si ya hay una sesión iniciada.
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setAvatarUrl("");
      }

      setLoading(false);
    };

    getSession();

    // Escuchamos cambios de login/logout.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);

        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setAvatarUrl("");
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
    setAvatarUrl("");
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, avatarUrl, loading, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar auth fácilmente en cualquier componente.
export function useAuth() {
  return useContext(AuthContext);
}