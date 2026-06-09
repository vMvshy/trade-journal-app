// Importamos el hook de autenticación y el sidebar.
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Welcome, {profile?.full_name || "Trader"}</h1>
            <p>Your private trading book is ready.</p>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Trades</p>
            <h2>0</h2>
          </div>

          <div className="stat-card">
            <p>Win Rate</p>
            <h2>0%</h2>
          </div>

          <div className="stat-card">
            <p>Total P/L</p>
            <h2>$0.00</h2>
          </div>

          <div className="stat-card">
            <p>Average R:R</p>
            <h2>0.00</h2>
          </div>
        </section>

        <section className="book-preview">
          <h2>Your Trading Book</h2>
          <p>
            Here we will add your journal pages, screenshots, notes, mistakes,
            emotions, strategies and lessons learned.
          </p>

          <a className="primary-link-button" href="/new-trade">
            Start New Trade Entry
          </a>
        </section>
      </main>
    </div>
  );
}