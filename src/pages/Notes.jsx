// Página de notas tipo cuaderno/libro.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { createNote, deleteNote, getUserNotes } from "../services/noteService";
import { getSignedImageUrl, uploadNoteImage } from "../services/imageService";

export default function Notes() {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Carga las notas del usuario.
  const loadNotes = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getUserNotes(user.id);

      // Convertimos las imágenes privadas en URLs temporales.
      const notesWithImages = await Promise.all(
        data.map(async (note) => {
          const imagesWithUrls = await Promise.all(
            (note.notebook_images || []).map(async (image) => {
              const signedUrl = await getSignedImageUrl(
                "note-images",
                image.image_path
              );

              return {
                ...image,
                signedUrl,
              };
            })
          );

          return {
            ...note,
            images: imagesWithUrls,
          };
        })
      );

      setNotes(notesWithImages);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, [user.id]);

  // Guarda una nota nueva con imagen opcional.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const note = await createNote({
        user_id: user.id,
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      if (imageFile) {
        await uploadNoteImage({
          file: imageFile,
          userId: user.id,
          noteId: note.id,
          caption: imageCaption,
        });
      }

      setTitle("");
      setContent("");
      setTags("");
      setImageFile(null);
      setImageCaption("");

      await loadNotes();
    } catch (err) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Borra una nota guardada.
  const handleDeleteNote = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeletingId(noteId);

    try {
      await deleteNote(noteId, user.id);

      // Quitamos la nota de la pantalla sin recargar.
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      alert(error.message);
    }

    setDeletingId(null);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Notes</h1>
            <p>Your notebook for lessons, ideas, screenshots and study notes.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="note-book-form">
          <h2>New Note</h2>

          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Liquidity sweep lesson"
            required
          />

          <label>Note</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write what you are learning here..."
            required
          />

          <label>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          <label>Image caption</label>
          <input
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            placeholder="Example: Chart screenshot"
          />

          <label>Tags</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="entries, psychology, risk management"
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Note"}
          </button>
        </form>

        <section className="notes-list">
          {loading ? (
            <p>Loading notes...</p>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <h2>No notes yet</h2>
              <p>Create your first learning note above.</p>
            </div>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="note-page">
                <div
                  className={`note-page-layout ${
                    note.images?.length > 0 ? "" : "no-image"
                  }`}
                >
                  {/* Lado izquierdo: texto de la nota */}
                  <div className="note-text-side">
                    <div className="note-title-row">
                      <h2>{note.title}</h2>

                      <div className="note-actions">
                        <Link
                          className="edit-trade-button"
                          to={`/notes/${note.id}/edit`}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingId === note.id}
                        >
                          {deletingId === note.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="note-content">{note.content}</p>

                    {note.tags?.length > 0 && (
                      <div className="tag-row">
                        {note.tags.map((tag) => (
                          <span key={tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lado derecho: imagen pequeña */}
                  {note.images?.length > 0 && (
                    <div className="note-image-side">
                      {note.images.map((image) => (
                        <figure key={image.id} className="note-image-card">
                          <button
                            type="button"
                            className="note-image-button"
                            onClick={() =>
                              setSelectedImage({
                                url: image.signedUrl,
                                caption: image.caption,
                              })
                            }
                          >
                            <img
                              src={image.signedUrl}
                              alt={image.caption || "Note image"}
                            />
                          </button>

                          {image.caption && (
                            <figcaption>{image.caption}</figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        {/* Modal para abrir imagen grande tipo Discord */}
        {selectedImage && (
          <div
            className="image-modal-backdrop"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="image-modal-close"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>

              <img
                src={selectedImage.url}
                alt={selectedImage.caption || "Preview"}
              />

              {selectedImage.caption && (
                <p className="image-modal-caption">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}