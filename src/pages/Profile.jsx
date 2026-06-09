// Página de perfil del usuario.
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";
import { getSignedImageUrl, uploadProfileImage } from "../services/imageService";

export default function Profile() {
  const { user, profile, logout, refreshProfile } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Carga la foto de perfil privada como URL temporal.
  useEffect(() => {
    const loadAvatar = async () => {
      if (!profile?.avatar_path) {
        setAvatarUrl("");
        return;
      }

      try {
        const url = await getSignedImageUrl("profile-images", profile.avatar_path);
        setAvatarUrl(url);
      } catch (err) {
        console.error(err.message);
      }
    };

    loadAvatar();
  }, [profile?.avatar_path]);

  // Sube nueva foto de perfil.
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await uploadProfileImage({
        file,
        userId: user.id,
        oldAvatarPath: profile?.avatar_path,
      });

      await refreshProfile();
    } catch (err) {
      setError(err.message);
    }

    setUploading(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Profile</h1>
            <p>Manage your Exora trading account.</p>
          </div>
        </header>

        <section className="profile-card exora-profile-card">
          <div className="profile-header premium-profile-header">
            <div className="profile-avatar-wrapper">
              {avatarUrl ? (
                <img className="profile-avatar-image" src={avatarUrl} alt="Profile" />
              ) : (
                <div className="profile-avatar">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "T"}
                </div>
              )}

              <label className="avatar-upload-button">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  hidden
                />
              </label>
            </div>

            <div>
              <div className="profile-name-row">
                <h2>{profile?.full_name || "Trader"}</h2>
                <span className="online-pill">Online</span>
              </div>

              <p>@{profile?.username || "username"}</p>

              {uploading && <small className="uploading-text">Uploading avatar...</small>}
              {error && <small className="profile-error">{error}</small>}
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Full Name</span>
              <strong>{profile?.full_name || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Username</span>
              <strong>@{profile?.username || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Email</span>
              <strong>{profile?.email || user?.email || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>User ID</span>
              <strong className="profile-user-id">{user?.id}</strong>
            </div>
          </div>

          <div className="profile-actions">
            <button className="logout-profile-button" onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        <section className="profile-note-card">
          <h2>Private by design</h2>
          <p>
            Your trades, notes, screenshots and analytics are connected only to
            your user account. Other users cannot access your data.
          </p>
        </section>
      </main>
    </div>
  );
}