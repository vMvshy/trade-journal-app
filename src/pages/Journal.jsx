// Página donde mostramos las entradas guardadas del journal.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";
import { deleteTrade, getUserTrades } from "../services/tradeService";
import { getSignedImageUrl } from "../services/imageService";

export default function Journal() {
  const { user } = useAuth();

  const [trades, setTrades] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Cargamos los trades del usuario cuando abre la página.
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const data = await getUserTrades(user.id);

        // Convertimos las imágenes privadas en URLs temporales.
        const tradesWithImages = await Promise.all(
          data.map(async (trade) => {
            const imagesWithUrls = await Promise.all(
              (trade.trade_images || []).map(async (image) => {
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

            return {
              ...trade,
              images: imagesWithUrls,
            };
          })
        );

        setTrades(tradesWithImages);
      } catch (error) {
        console.error(error.message);
      }

      setLoading(false);
    };

    loadTrades();
  }, [user.id]);

  // Filtramos los trades por título, símbolo o estrategia.
  const filteredTrades = trades.filter((trade) => {
    const text = `${trade.title} ${trade.symbol} ${trade.strategy}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Borra un trade guardado.
  const handleDeleteTrade = async (tradeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trade? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeletingId(tradeId);

    try {
      await deleteTrade(tradeId, user.id);

      // Quitamos el trade de la pantalla sin recargar.
      setTrades((prevTrades) =>
        prevTrades.filter((trade) => trade.id !== tradeId)
      );
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
            <h1>Journal</h1>
            <p>Every trade saved as a page in your trading book.</p>
          </div>
        </header>

        <div className="journal-toolbar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, symbol or strategy..."
          />
        </div>

        {loading ? (
          <p>Loading trades...</p>
        ) : filteredTrades.length === 0 ? (
          <section className="empty-state">
            <h2>No trades yet</h2>
            <p>Create your first trade entry from the New Trade page.</p>
          </section>
        ) : (
          <section className="trade-list">
            {filteredTrades.map((trade) => (
              <article key={trade.id} className="trade-card">
                <div className="trade-card-header">
                  <div>
                    <h2>{trade.title}</h2>
                    <p>
                      {trade.symbol || "No symbol"} •{" "}
                      {trade.timeframe || "No timeframe"}
                    </p>
                  </div>

                  <div className="card-actions">
                    <span className={`result-badge ${trade.result}`}>
                      {trade.result}
                    </span>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteTrade(trade.id)}
                      disabled={deletingId === trade.id}
                    >
                      {deletingId === trade.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="trade-card-grid">
                  <div>
                    <span>Type</span>
                    <strong>{trade.trade_type}</strong>
                  </div>

                  <div>
                    <span>Entry</span>
                    <strong>{trade.entry_price || "-"}</strong>
                  </div>

                  <div>
                    <span>Exit</span>
                    <strong>{trade.exit_price || "-"}</strong>
                  </div>

                  <div>
                    <span>P/L</span>
                    <strong>{trade.profit_loss ?? "$0"}</strong>
                  </div>

                  <div>
                    <span>R:R</span>
                    <strong>{trade.risk_reward_ratio || "-"}</strong>
                  </div>

                  <div>
                    <span>Strategy</span>
                    <strong>{trade.strategy || "-"}</strong>
                  </div>
                </div>

                {trade.lesson_learned && (
                  <p className="trade-lesson">
                    <strong>Lesson:</strong> {trade.lesson_learned}
                  </p>
                )}

                {trade.images?.length > 0 && (
                  <div className="trade-images-row">
                    {trade.images.map((image) => (
                      <figure key={image.id} className="trade-image-card">
                        <button
                          type="button"
                          className="trade-image-button"
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

                <Link className="view-trade-button" to={`/trade/${trade.id}`}>
                  View Details
                </Link>

                {trade.tags?.length > 0 && (
                  <div className="tag-row">
                    {trade.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

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