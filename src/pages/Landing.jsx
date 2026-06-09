// Landing pública de Exora.
// Esta página se muestra antes del login y puede verla cualquiera.

import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="landing-page">
      {/* Fondos decorativos */}
      <div className="landing-glow landing-glow-left"></div>
      <div className="landing-glow landing-glow-right"></div>

      {/* Navbar */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-logo">
          <img
            src="/exora-brand-lockup-transparent.png"
            alt="Exora Trading OS"
          />
        </Link>

        <div className="landing-navbar-actions">
          {user ? (
            <Link to="/dashboard" className="landing-small-button">
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-nav-link">
                Login
              </Link>

              <Link to="/register" className="landing-small-button">
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero principal */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <span className="landing-badge">Private Trading OS</span>

          <h1>
            Trade with memory.
            <br />
            Improve with clarity.
          </h1>

          <p>
            A private trading operating system built to help you document every
            decision, review every setup, and improve with real performance
            insights.
          </p>

          <div className="landing-hero-buttons">
            {user ? (
              <Link to="/dashboard" className="landing-primary-button">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-primary-button">
                  Start Journaling
                </Link>

                <Link to="/login" className="landing-secondary-button">
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="landing-trust-row">
            <div>
              <strong>Journal</strong>
              <span>Track your trades</span>
            </div>

            <div>
              <strong>Notes</strong>
              <span>Document lessons</span>
            </div>

            <div>
              <strong>Analytics</strong>
              <span>Review performance</span>
            </div>
          </div>
        </div>

        {/* Preview falso de dashboard */}
        <div className="landing-dashboard-preview">
          <div className="preview-window-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="preview-header">
            <div>
              <span>Exora Overview</span>
              <h3>Performance Review</h3>
            </div>

            <p>Live</p>
          </div>

          <div className="preview-stat-grid">
            <div className="preview-stat-card">
              <span>Total Trades</span>
              <strong>124</strong>
              <small>Logged entries</small>
            </div>

            <div className="preview-stat-card">
              <span>Win Rate</span>
              <strong>62%</strong>
              <small>Strategy performance</small>
            </div>

            <div className="preview-stat-card">
              <span>Total P/L</span>
              <strong>$4,280</strong>
              <small>Tracked results</small>
            </div>

            <div className="preview-stat-card">
              <span>Avg R:R</span>
              <strong>2.4R</strong>
              <small>Risk discipline</small>
            </div>
          </div>

          <div className="preview-chart">
            <div style={{ height: "40%" }}></div>
            <div style={{ height: "62%" }}></div>
            <div style={{ height: "48%" }}></div>
            <div style={{ height: "78%" }}></div>
            <div style={{ height: "66%" }}></div>
            <div style={{ height: "92%" }}></div>
            <div style={{ height: "72%" }}></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features-section">
        <div className="landing-section-heading">
          <span>Built for better reviews</span>
          <h2>Everything you need to understand your trading.</h2>
        </div>

        <div className="landing-features-grid">
          <article className="landing-feature-card">
            <span>01</span>
            <h3>Structured Journal</h3>
            <p>
              Save entries with symbol, setup, result, risk/reward, notes and
              trade context.
            </p>
          </article>

          <article className="landing-feature-card">
            <span>02</span>
            <h3>Trade Visuals</h3>
            <p>
              Keep chart images connected to each trade so every setup is easy
              to review later.
            </p>
          </article>

          <article className="landing-feature-card">
            <span>03</span>
            <h3>Strategy Notes</h3>
            <p>
              Organize lessons, mistakes, ideas and personal rules in a clean
              trading notebook.
            </p>
          </article>

          <article className="landing-feature-card">
            <span>04</span>
            <h3>Performance Analytics</h3>
            <p>
              Review win rate, P/L, strategies, emotional patterns and your
              most important trading data.
            </p>
          </article>
        </div>
      </section>

      {/* Privacy */}
      <section className="landing-privacy-section">
        <div>
          <span>Private workspace</span>
          <h2>Your trading data stays protected.</h2>
          <p>
            Exora is designed as a private workspace. Your journal, notes,
            images and performance data stay behind your account.
          </p>
        </div>

        {user ? (
          <Link to="/dashboard" className="landing-primary-button">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/register" className="landing-primary-button">
            Create Account
          </Link>
        )}
      </section>
    </main>
  );
}