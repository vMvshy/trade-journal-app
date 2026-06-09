// Página de analíticas del journal.
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { getUserTrades } from "../services/tradeService";

export default function Analytics() {
  const { user } = useAuth();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargamos los trades del usuario.
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

  // Función para encontrar el valor más repetido.
  const getMostCommon = (items) => {
    const filtered = items.filter(Boolean);

    if (filtered.length === 0) return "No data";

    const countMap = filtered.reduce((acc, item) => {
      const key = item.trim() || "No data";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
  };

  // Calculamos todas las estadísticas.
  const analytics = useMemo(() => {
    const totalTrades = trades.length;

    const wins = trades.filter((trade) => trade.result === "win").length;
    const losses = trades.filter((trade) => trade.result === "loss").length;
    const breakevens = trades.filter((trade) => trade.result === "breakeven").length;

    const winRate =
      totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";

    const totalPL = trades.reduce((sum, trade) => {
      return sum + Number(trade.profit_loss || 0);
    }, 0);

    const averagePL =
      totalTrades > 0 ? (totalPL / totalTrades).toFixed(2) : "0.00";

    const tradesWithRR = trades.filter((trade) => trade.risk_reward_ratio);

    const averageRR =
      tradesWithRR.length > 0
        ? (
            tradesWithRR.reduce((sum, trade) => {
              return sum + Number(trade.risk_reward_ratio || 0);
            }, 0) / tradesWithRR.length
          ).toFixed(2)
        : "0.00";

    // Agrupamos por estrategia.
    const strategyMap = trades.reduce((acc, trade) => {
      const strategy = trade.strategy?.trim() || "No strategy";

      if (!acc[strategy]) {
        acc[strategy] = {
          name: strategy,
          trades: 0,
          wins: 0,
          losses: 0,
          breakevens: 0,
          totalPL: 0,
        };
      }

      acc[strategy].trades += 1;
      acc[strategy].totalPL += Number(trade.profit_loss || 0);

      if (trade.result === "win") acc[strategy].wins += 1;
      if (trade.result === "loss") acc[strategy].losses += 1;
      if (trade.result === "breakeven") acc[strategy].breakevens += 1;

      return acc;
    }, {});

    const strategies = Object.values(strategyMap)
      .map((strategy) => ({
        ...strategy,
        winRate:
          strategy.trades > 0
            ? ((strategy.wins / strategy.trades) * 100).toFixed(1)
            : "0.0",
      }))
      .sort((a, b) => b.totalPL - a.totalPL);

    const bestStrategy = strategies.length > 0 ? strategies[0] : null;
    const worstStrategy =
      strategies.length > 0 ? strategies[strategies.length - 1] : null;

    const mostTradedSymbol = getMostCommon(trades.map((trade) => trade.symbol));
    const mostCommonEmotionBefore = getMostCommon(
      trades.map((trade) => trade.emotion_before)
    );
    const mostCommonEmotionAfter = getMostCommon(
      trades.map((trade) => trade.emotion_after)
    );

    return {
      totalTrades,
      wins,
      losses,
      breakevens,
      winRate,
      totalPL,
      averagePL,
      averageRR,
      strategies,
      bestStrategy,
      worstStrategy,
      mostTradedSymbol,
      mostCommonEmotionBefore,
      mostCommonEmotionAfter,
    };
  }, [trades]);

  // Porcentaje para las barras visuales.
  const winPercent =
    analytics.totalTrades > 0
      ? (analytics.wins / analytics.totalTrades) * 100
      : 0;

  const lossPercent =
    analytics.totalTrades > 0
      ? (analytics.losses / analytics.totalTrades) * 100
      : 0;

  const breakevenPercent =
    analytics.totalTrades > 0
      ? (analytics.breakevens / analytics.totalTrades) * 100
      : 0;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Analytics</h1>
            <p>Review your performance, strategies, mistakes and trading patterns.</p>
          </div>
        </header>

        {loading ? (
          <p>Loading analytics...</p>
        ) : analytics.totalTrades === 0 ? (
          <section className="empty-state">
            <h2>No analytics yet</h2>
            <p>Create trades first so the app can calculate your performance.</p>
          </section>
        ) : (
          <>
            <section className="analytics-grid">
              <div className="analytics-card">
                <p>Total Trades</p>
                <h2>{analytics.totalTrades}</h2>
              </div>

              <div className="analytics-card">
                <p>Win Rate</p>
                <h2>{analytics.winRate}%</h2>
              </div>

              <div className="analytics-card">
                <p>Total P/L</p>
                <h2 className={analytics.totalPL >= 0 ? "profit-text" : "loss-text"}>
                  ${analytics.totalPL.toFixed(2)}
                </h2>
              </div>

              <div className="analytics-card">
                <p>Average P/L</p>
                <h2
                  className={
                    Number(analytics.averagePL) >= 0 ? "profit-text" : "loss-text"
                  }
                >
                  ${analytics.averagePL}
                </h2>
              </div>

              <div className="analytics-card">
                <p>Average R:R</p>
                <h2>{analytics.averageRR}</h2>
              </div>

              <div className="analytics-card">
                <p>Most Traded Symbol</p>
                <h2>{analytics.mostTradedSymbol}</h2>
              </div>
            </section>

            <section className="analytics-panel">
              <h2>Trade Results</h2>

              <div className="result-bars">
                <div>
                  <div className="bar-label">
                    <span>Wins</span>
                    <strong>{analytics.wins}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill win-bar" style={{ width: `${winPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="bar-label">
                    <span>Losses</span>
                    <strong>{analytics.losses}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill loss-bar"
                      style={{ width: `${lossPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="bar-label">
                    <span>Break-even</span>
                    <strong>{analytics.breakevens}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill breakeven-bar"
                      style={{ width: `${breakevenPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="analytics-grid two-columns">
              <div className="analytics-panel">
                <h2>Best Strategy</h2>

                {analytics.bestStrategy ? (
                  <div className="strategy-highlight">
                    <h3>{analytics.bestStrategy.name}</h3>
                    <p>Total P/L</p>
                    <strong
                      className={
                        analytics.bestStrategy.totalPL >= 0 ? "profit-text" : "loss-text"
                      }
                    >
                      ${analytics.bestStrategy.totalPL.toFixed(2)}
                    </strong>
                    <span>{analytics.bestStrategy.winRate}% win rate</span>
                  </div>
                ) : (
                  <p>No strategy data yet.</p>
                )}
              </div>

              <div className="analytics-panel">
                <h2>Worst Strategy</h2>

                {analytics.worstStrategy ? (
                  <div className="strategy-highlight">
                    <h3>{analytics.worstStrategy.name}</h3>
                    <p>Total P/L</p>
                    <strong
                      className={
                        analytics.worstStrategy.totalPL >= 0
                          ? "profit-text"
                          : "loss-text"
                      }
                    >
                      ${analytics.worstStrategy.totalPL.toFixed(2)}
                    </strong>
                    <span>{analytics.worstStrategy.winRate}% win rate</span>
                  </div>
                ) : (
                  <p>No strategy data yet.</p>
                )}
              </div>
            </section>

            <section className="analytics-grid two-columns">
              <div className="analytics-panel">
                <h2>Emotional Pattern Before Trade</h2>
                <p className="big-insight">{analytics.mostCommonEmotionBefore}</p>
              </div>

              <div className="analytics-panel">
                <h2>Emotional Pattern After Trade</h2>
                <p className="big-insight">{analytics.mostCommonEmotionAfter}</p>
              </div>
            </section>

            <section className="analytics-panel">
              <h2>Strategy Breakdown</h2>

              <div className="strategy-table">
                <div className="strategy-row strategy-head">
                  <span>Strategy</span>
                  <span>Trades</span>
                  <span>Wins</span>
                  <span>Losses</span>
                  <span>Win Rate</span>
                  <span>Total P/L</span>
                </div>

                {analytics.strategies.map((strategy) => (
                  <div key={strategy.name} className="strategy-row">
                    <span>{strategy.name}</span>
                    <span>{strategy.trades}</span>
                    <span>{strategy.wins}</span>
                    <span>{strategy.losses}</span>
                    <span>{strategy.winRate}%</span>
                    <span
                      className={
                        strategy.totalPL >= 0 ? "profit-text" : "loss-text"
                      }
                    >
                      ${strategy.totalPL.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}