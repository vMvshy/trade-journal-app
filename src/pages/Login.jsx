// Página de login de Exora.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Función para iniciar sesión con Supabase Auth.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-page exora-auth-page">
      <div className="stars-layer"></div>
      <div className="grid-layer"></div>

      <div className="auth-hero-copy">
        <div className="auth-brand">
          <div className="brand-icon big">
            <Sparkles size={26} />
          </div>
          <span>Exora</span>
        </div>

        <h1>Trade with memory.</h1>
        <p>
          Your private trading journal for screenshots, notes, emotions,
          strategies and performance.
        </p>
      </div>

      <div className="auth-card exora-auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Login to your Exora trading space</p>

        <form onSubmit={handleLogin} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}