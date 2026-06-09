import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Sidebar() {
  const { profile, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <h2>Trade Journal</h2>
        <p className="sidebar-user">@{profile?.username || "trader"}</p>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/new-trade">New Trade</NavLink>
          <NavLink to="/notes">Notes</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}