// Página de registro de Exora.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleUsernameChange = (value) => {
    setUsername(value.toLowerCase());
  };

  // Función para registrar usuario usando Supabase Auth.
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const usernameRegex = /^[a-z0-9._]{3,20}$/;

    if (!usernameRegex.test(username)) {
      setError(
        "Username must be 3-20 characters, lowercase only, no spaces, only letters, numbers, dots and underscores."
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="auth-page exora-auth-page">
      <div className="stars-layer"></div>
      <div className="grid-layer"></div>

      <div className="auth-hero-copy">
        <div className="auth-brand auth-brand-lockup">
          <img
            src="/exora-brand-lockup-transparent.png"
            alt="Exora Trading OS"
          />
        </div>

        <h1>Build your trading edge.</h1>
        <p>
          Create a private workspace to track trades, document decisions, save
          trade visuals, and turn every review into better execution.
        </p>
      </div>

      <div className="auth-card exora-auth-card large">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Create your private Exora workspace</p>

        <form onSubmit={handleRegister} className="auth-form">
          <label>Full name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>Username</label>
          <input
            type="text"
            placeholder="example: trader.edge"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            required
          />

          <small className="input-help">
            Lowercase only. No spaces. Letters, numbers, dots and underscores.
          </small>

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
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}