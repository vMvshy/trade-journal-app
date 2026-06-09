// Página de detalle completo de un trade.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../auth/AuthProvider";
import { deleteTrade, getTradeById } from "../services/tradeService";
import { getSignedImageUrl } from "../services/imageService";

export default function TradeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trade, setTrade] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrade = async () => {
      try {
        const data = await getTradeById(id, user.id);

        const imagesWithUrls = await Promise.all(
          (data.trade_images || []).map(async (image) => {
            const signedUrl = await getSignedImageUrl(
              "trade-images",
              image.image_path
            );

            return {
              ...image,
              signedUrl,
            };
          })
        );

        setTrade(data);
        setImages(imagesWithUrls);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    loadTrade();
  }, [id, user.id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trade? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeleting(true);

    try {
      await deleteTrade(id, user.id);
      navigate("/journal");
    } catch (err) {
      alert(err.message);
    }

    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="dashboard">
          <p>Loading trade...</p>
        </main>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="dashboard">
          <section className="empty-state">
            <h2>Trade not found</h2>
            <p>{error || "This trade does not exist."}</p>
            <Link className="primary-link-button" to="/journal">
              Back to Journal
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="trade-detail-top">
          <Link to="/journal" className="back-link">
            ← Back to Journal
          </Link>

          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Trade"}
          </button>
        </div>

        <section className="trade-book-page">
          <div className="trade-book-header">
            <div>
              <span className={`result-badge ${trade.result}`}>
                {trade.result}
              </span>

              <h1>{trade.title}</h1>

              <p>
                {trade.symbol || "No symbol"} •{" "}
                {trade.timeframe || "No timeframe"} •{" "}
                {trade.trade_type || "No type"}
              </p>
            </div>

            <div className="trade-detail-profit">
              <span>Profit / Loss</span>
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
          </div>

          {images.length > 0 && (
            <div className="trade-detail-images">
              {images.map((image) => (
                <figure key={image.id} className="trade-detail-image-card">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage({
                        url: image.signedUrl,
                        caption: image.caption,
                      })
                    }
                  >
                    <img
                      src={image.signedUrl}
                      alt={image.caption || "Trade screenshot"}
                    />
                  </button>

                  <figcaption>
                    <strong>{image.image_type}</strong>
                    {image.caption ? ` • ${image.caption}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <div className="trade-detail-grid">
            <div>
              <span>Entry</span>
              <strong>{trade.entry_price || "-"}</strong>
            </div>

            <div>
              <span>Stop Loss</span>
              <strong>{trade.stop_loss || "-"}</strong>
            </div>

            <div>
              <span>Take Profit</span>
              <strong>{trade.take_profit || "-"}</strong>
            </div>

            <div>
              <span>Exit</span>
              <strong>{trade.exit_price || "-"}</strong>
            </div>

            <div>
              <span>Lot Size</span>
              <strong>{trade.lot_size || "-"}</strong>
            </div>

            <div>
              <span>R:R</span>
              <strong>{trade.risk_reward_ratio || "-"}</strong>
            </div>

            <div>
              <span>Strategy</span>
              <strong>{trade.strategy || "-"}</strong>
            </div>

            <div>
              <span>Setup Type</span>
              <strong>{trade.setup_type || "-"}</strong>
            </div>
          </div>

          <section className="trade-journal-section">
            <h2>Notebook Page</h2>

            <div className="trade-notes-grid">
              <article>
                <h3>Pre-trade Analysis</h3>
                <p>{trade.pre_trade_analysis || "No notes added."}</p>
              </article>

              <article>
                <h3>Trade Execution</h3>
                <p>{trade.trade_execution || "No notes added."}</p>
              </article>

              <article>
                <h3>Trade Management</h3>
                <p>{trade.trade_management || "No notes added."}</p>
              </article>

              <article>
                <h3>Post-trade Reflection</h3>
                <p>{trade.post_trade_reflection || "No notes added."}</p>
              </article>

              <article>
                <h3>Mistakes Made</h3>
                <p>{trade.mistakes || "No mistakes added."}</p>
              </article>

              <article>
                <h3>What I Did Well</h3>
                <p>{trade.did_well || "No notes added."}</p>
              </article>

              <article>
                <h3>Lesson Learned</h3>
                <p>{trade.lesson_learned || "No lesson added."}</p>
              </article>

              <article>
                <h3>Extra Notes</h3>
                <p>{trade.notes || "No extra notes added."}</p>
              </article>
            </div>
          </section>

          <section className="trade-journal-section">
            <h2>Psychology</h2>

            <div className="trade-detail-grid">
              <div>
                <span>Emotion Before</span>
                <strong>{trade.emotion_before || "-"}</strong>
              </div>

              <div>
                <span>Emotion After</span>
                <strong>{trade.emotion_after || "-"}</strong>
              </div>
            </div>
          </section>

          {trade.tags?.length > 0 && (
            <div className="tag-row">
              {trade.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </section>

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