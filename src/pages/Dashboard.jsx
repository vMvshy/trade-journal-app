// Dashboard principal con estadísticas reales del usuario.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";
import { getUserTrades } from "../services/tradeService";

export default function Dashboard() {
  const { user, profile } = useAuth();

  // Guardamos los trades y el estado de carga.
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargamos los trades del usuario desde Supabase.
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const data = await getUserTrades(user.id);
        setTrades(data || []);
      } catch (error) {
        console.error(error.message);
      }

      setLoading(false);
    };

    loadTrades();
  }, [user.id]);

  // Calculamos estadísticas reales.
  const totalTrades = trades.length;

  const winningTrades = trades.filter((trade) => trade.result === "win").length;

  const losingTrades = trades.filter((trade) => trade.result === "loss").length;

  const winRate =
    totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0.0";

  const totalProfitLoss = trades.reduce((total, trade) => {
    return total + Number(trade.profit_loss || 0);
  }, 0);

  const tradesWithRR = trades.filter((trade) => trade.risk_reward_ratio);

  const averageRR =
    tradesWithRR.length > 0
      ? (
          tradesWithRR.reduce((total, trade) => {
            return total + Number(trade.risk_reward_ratio || 0);
          }, 0) / tradesWithRR.length
        ).toFixed(2)
      : "0.00";

  // Tomamos los últimos 3 trades para mostrarlos en el dashboard.
  const recentTrades = trades.slice(0, 3);

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
            <h2>{loading ? "..." : totalTrades}</h2>
          </div>

          <div className="stat-card">
            <p>Win Rate</p>
            <h2>{loading ? "..." : `${winRate}%`}</h2>
          </div>

          <div className="stat-card">
            <p>Total P/L</p>
            <h2 className={totalProfitLoss >= 0 ? "profit-text" : "loss-text"}>
              {loading
                ? "..."
                : `$${totalProfitLoss.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </h2>
          </div>

          <div className="stat-card">
            <p>Average R:R</p>
            <h2>{loading ? "..." : averageRR}</h2>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="book-preview">
            <h2>Your Trading Book</h2>
            <p>
              Here you can add trades, screenshots, notes, mistakes, emotions,
              strategies and lessons learned.
            </p>

            <Link className="primary-link-button" to="/new-trade">
              Start New Trade Entry
            </Link>
          </div>

          <div className="dashboard-panel">
            <h2>Quick Summary</h2>

            <div className="summary-list">
              <div>
                <span>Winning Trades</span>
                <strong>{winningTrades}</strong>
              </div>

              <div>
                <span>Losing Trades</span>
                <strong>{losingTrades}</strong>
              </div>

              <div>
                <span>Break-even Trades</span>
                <strong>
                  {trades.filter((trade) => trade.result === "breakeven").length}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel recent-panel">
          <div className="panel-header">
            <h2>Recent Trades</h2>
            <Link to="/journal">View all</Link>
          </div>

          {loading ? (
            <p>Loading recent trades...</p>
          ) : recentTrades.length === 0 ? (
            <p>No trades yet. Create your first trade entry.</p>
          ) : (
            <div className="recent-trades-list">
              {recentTrades.map((trade) => (
                <article key={trade.id} className="recent-trade-item">
                  <div>
                    <h3>{trade.title}</h3>
                    <p>
                      {trade.symbol || "No symbol"} •{" "}
                      {trade.strategy || "No strategy"}
                    </p>
                  </div>

                  <div className="recent-trade-right">
                    <span className={`result-badge ${trade.result}`}>
                      {trade.result}
                    </span>

                    <strong
                      className={
                        Number(trade.profit_loss || 0) >= 0
                          ? "profit-text"
                          : "loss-text"
                      }
                    >
                      ${Number(trade.profit_loss || 0).toFixed(2)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}