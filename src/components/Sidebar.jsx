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
import { getSignedImageUrl } from "../services/imageService";

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const loadAvatar = async () => {
      if (!profile?.avatar_path) {
        setAvatarUrl("");
        return;
      }

      try {
        const url = await getSignedImageUrl("profile-images", profile.avatar_path);
        setAvatarUrl(url);
      } catch (error) {
        console.error(error.message);
      }
    };

    loadAvatar();
  }, [profile?.avatar_path]);

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
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" />
          ) : (
            <div className="sidebar-avatar-fallback">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "T"}
            </div>
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