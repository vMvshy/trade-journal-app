// Importamos hooks de React y herramientas de navegación.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  // Datos del formulario de registro.
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para controlar errores y carga.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Esta función limpia el username para mantenerlo en minúsculas.
  const handleUsernameChange = (value) => {
    setUsername(value.toLowerCase());
  };

  // Función para registrar usuario usando Supabase Auth.
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validamos que las contraseñas coincidan.
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validamos el username antes de enviarlo a Supabase.
    const usernameRegex = /^[a-z0-9._]{3,20}$/;

    if (!usernameRegex.test(username)) {
      setError(
        "Username must be 3-20 characters, lowercase only, no spaces, only letters, numbers, dots and underscores."
      );
      return;
    }

    setLoading(true);

    // Creamos el usuario y enviamos full_name y username como metadata.
    // El trigger de Supabase crea automáticamente el perfil en la tabla profiles.
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

    // Si Supabase permite login automático, mandamos al dashboard.
    // Si tiene email confirmation activo, mandamos al login.
    if (data.session) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card large">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Create your private trading journal user</p>

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
            placeholder="example: trader.jorge"
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