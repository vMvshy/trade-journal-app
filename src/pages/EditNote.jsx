// Página para editar una nota guardada.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { getNoteById, updateNote } from "../services/noteService";

export default function EditNote() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargamos la nota actual.
  useEffect(() => {
    const loadNote = async () => {
      try {
        const note = await getNoteById(id, user.id);

        setTitle(note.title || "");
        setContent(note.content || "");
        setTags(note.tags?.join(", ") || "");
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    loadNote();
  }, [id, user.id]);

  // Guarda cambios.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateNote(id, user.id, {
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      navigate("/notes");
    } catch (err) {
      setError(err.message);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="dashboard">
          <p>Loading note...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="trade-detail-top">
          <Link to="/notes" className="back-link">
            ← Back to Notes
          </Link>
        </div>

        <header className="dashboard-header">
          <div>
            <h1>Edit Note</h1>
            <p>Update your saved learning note.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="note-book-form">
          <h2>Note Details</h2>

          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Note</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <label>Tags</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="entries, psychology, risk management"
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}