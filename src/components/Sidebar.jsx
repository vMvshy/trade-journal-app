import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  NotebookText,
  PlusCircle,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Sidebar() {
  const { profile, avatarUrl, logout } = useAuth();

  // Esto evita que si una imagen falla, se quede rota visualmente.
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Cada vez que cambie la URL del avatar, reiniciamos el estado de error.
  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  const avatarFallback =
    profile?.full_name?.charAt(0)?.toUpperCase() ||
    profile?.username?.charAt(0)?.toUpperCase() ||
    "T";

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/journal", label: "Journal", icon: BookOpen },
    { to: "/new-trade", label: "New Trade", icon: PlusCircle },
    { to: "/notes", label: "Notes", icon: NotebookText },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="sidebar exora-sidebar">
      <div>
        <div className="brand-block brand-lockup-block">
          <img
            className="brand-lockup-img"
            src="/exora-brand-lockup-transparent.png"
            alt="Exora Trading OS"
          />
        </div>

        <div className="sidebar-profile-mini">
          {avatarUrl && !avatarFailed ? (
            <img
              src={avatarUrl}
              alt="Profile"
              loading="eager"
              decoding="async"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className="sidebar-avatar-fallback">{avatarFallback}</div>
          )}

          <div>
            <strong>{profile?.full_name || "Trader"}</strong>
            <span>@{profile?.username || "username"}</span>
          </div>
        </div>

        <nav className="premium-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <button className="logout-button premium-logout" onClick={logout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}