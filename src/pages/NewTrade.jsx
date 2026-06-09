// Página para crear una nueva entrada del journal.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";
import { createTrade } from "../services/tradeService";
import { uploadTradeImage } from "../services/imageService";

export default function NewTrade() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado principal del formulario.
  const [form, setForm] = useState({
    title: "",
    symbol: "",
    trade_type: "buy",
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    exit_price: "",
    lot_size: "",
    risk_amount: "",
    reward_amount: "",
    profit_loss: "",
    result: "win",
    strategy: "",
    setup_type: "",
    timeframe: "",
    emotion_before: "",
    emotion_after: "",
    mistakes: "",
    did_well: "",
    lesson_learned: "",
    notes: "",
    pre_trade_analysis: "",
    trade_execution: "",
    trade_management: "",
    post_trade_reflection: "",
    tags: "",
    trade_date: "",
  });

  // Estados para la imagen del trade.
  const [tradeImageFile, setTradeImageFile] = useState(null);
  const [tradeImagePreview, setTradeImagePreview] = useState(null);
  const [tradeImageCaption, setTradeImageCaption] = useState("");
  const [tradeImageType, setTradeImageType] = useState("setup");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Actualiza cualquier campo del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Maneja la imagen seleccionada y crea una vista previa.
  const handleTradeImageChange = (e) => {
    const file = e.target.files[0];

    setTradeImageFile(file || null);

    if (file) {
      setTradeImagePreview(URL.createObjectURL(file));
    } else {
      setTradeImagePreview(null);
    }
  };

  // Convierte campos numéricos vacíos en null.
  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  };

  // Guarda el trade en Supabase.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const entry = toNumberOrNull(form.entry_price);
      const stop = toNumberOrNull(form.stop_loss);
      const take = toNumberOrNull(form.take_profit);

      // Calculamos el risk/reward ratio si los datos están disponibles.
      let rr = null;

      if (entry && stop && take) {
        const risk = Math.abs(entry - stop);
        const reward = Math.abs(take - entry);
        rr = risk > 0 ? Number((reward / risk).toFixed(2)) : null;
      }

      const tradeData = {
        user_id: user.id,
        title: form.title,
        symbol: form.symbol,
        trade_type: form.trade_type,
        entry_price: toNumberOrNull(form.entry_price),
        stop_loss: toNumberOrNull(form.stop_loss),
        take_profit: toNumberOrNull(form.take_profit),
        exit_price: toNumberOrNull(form.exit_price),
        lot_size: toNumberOrNull(form.lot_size),
        risk_amount: toNumberOrNull(form.risk_amount),
        reward_amount: toNumberOrNull(form.reward_amount),
        profit_loss: toNumberOrNull(form.profit_loss),
        risk_reward_ratio: rr,
        result: form.result,
        strategy: form.strategy,
        setup_type: form.setup_type,
        timeframe: form.timeframe,
        emotion_before: form.emotion_before,
        emotion_after: form.emotion_after,
        mistakes: form.mistakes,
        did_well: form.did_well,
        lesson_learned: form.lesson_learned,
        notes: form.notes,
        pre_trade_analysis: form.pre_trade_analysis,
        trade_execution: form.trade_execution,
        trade_management: form.trade_management,
        post_trade_reflection: form.post_trade_reflection,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        trade_date: form.trade_date || new Date().toISOString(),
      };

      // Primero creamos el trade.
      const createdTrade = await createTrade(tradeData);

      // Si el usuario agregó una imagen, la subimos y la conectamos con este trade.
      if (tradeImageFile) {
        await uploadTradeImage({
          file: tradeImageFile,
          userId: user.id,
          tradeId: createdTrade.id,
          caption: tradeImageCaption,
          imageType: tradeImageType,
        });
      }

      navigate("/journal");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>New Trade Entry</h1>
            <p>Create a new page inside your trading book.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="trade-form">
          <section className="form-section">
            <h2>Trade Details</h2>

            <div className="form-grid">
              <div>
                <label>Trade title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: EUR/USD London Session"
                  required
                />
              </div>

              <div>
                <label>Symbol / Pair</label>
                <input
                  name="symbol"
                  value={form.symbol}
                  onChange={handleChange}
                  placeholder="EUR/USD, BTC/USD, NAS100..."
                />
              </div>

              <div>
                <label>Trade type</label>
                <select
                  name="trade_type"
                  value={form.trade_type}
                  onChange={handleChange}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label>Result</label>
                <select name="result" value={form.result} onChange={handleChange}>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Break-even</option>
                </select>
              </div>

              <div>
                <label>Trade date</label>
                <input
                  type="datetime-local"
                  name="trade_date"
                  value={form.trade_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Timeframe</label>
                <input
                  name="timeframe"
                  value={form.timeframe}
                  onChange={handleChange}
                  placeholder="1m, 5m, 15m, 1H, 4H..."
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Prices & Risk</h2>

            <div className="form-grid">
              <div>
                <label>Entry price</label>
                <input
                  type="number"
                  step="any"
                  name="entry_price"
                  value={form.entry_price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Stop loss</label>
                <input
                  type="number"
                  step="any"
                  name="stop_loss"
                  value={form.stop_loss}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Take profit</label>
                <input
                  type="number"
                  step="any"
                  name="take_profit"
                  value={form.take_profit}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Exit price</label>
                <input
                  type="number"
                  step="any"
                  name="exit_price"
                  value={form.exit_price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Lot size</label>
                <input
                  type="number"
                  step="any"
                  name="lot_size"
                  value={form.lot_size}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Profit / Loss</label>
                <input
                  type="number"
                  step="any"
                  name="profit_loss"
                  value={form.profit_loss}
                  onChange={handleChange}
                  placeholder="Example: 25 or -15"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Strategy & Psychology</h2>

            <div className="form-grid">
              <div>
                <label>Strategy used</label>
                <input
                  name="strategy"
                  value={form.strategy}
                  onChange={handleChange}
                  placeholder="Breakout, reversal, liquidity sweep..."
                />
              </div>

              <div>
                <label>Setup type</label>
                <input
                  name="setup_type"
                  value={form.setup_type}
                  onChange={handleChange}
                  placeholder="Continuation, pullback, news..."
                />
              </div>

              <div>
                <label>Emotion before</label>
                <input
                  name="emotion_before"
                  value={form.emotion_before}
                  onChange={handleChange}
                  placeholder="Calm, anxious, confident..."
                />
              </div>

              <div>
                <label>Emotion after</label>
                <input
                  name="emotion_after"
                  value={form.emotion_after}
                  onChange={handleChange}
                  placeholder="Happy, frustrated, neutral..."
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Notebook Page</h2>

            <label>Pre-trade analysis</label>
            <textarea
              name="pre_trade_analysis"
              value={form.pre_trade_analysis}
              onChange={handleChange}
              placeholder="What did you see before entering?"
            />

            <label>Trade execution</label>
            <textarea
              name="trade_execution"
              value={form.trade_execution}
              onChange={handleChange}
              placeholder="How did you enter the trade?"
            />

            <label>Trade management</label>
            <textarea
              name="trade_management"
              value={form.trade_management}
              onChange={handleChange}
              placeholder="How did you manage the trade while it was open?"
            />

            <label>Post-trade reflection</label>
            <textarea
              name="post_trade_reflection"
              value={form.post_trade_reflection}
              onChange={handleChange}
              placeholder="What happened after the trade?"
            />

            <label>Mistakes made</label>
            <textarea
              name="mistakes"
              value={form.mistakes}
              onChange={handleChange}
              placeholder="What mistakes did you make?"
            />

            <label>What I did well</label>
            <textarea
              name="did_well"
              value={form.did_well}
              onChange={handleChange}
              placeholder="What did you do correctly?"
            />

            <label>Lesson learned</label>
            <textarea
              name="lesson_learned"
              value={form.lesson_learned}
              onChange={handleChange}
              placeholder="What lesson are you taking from this trade?"
            />

            <label>Extra notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Write anything else here..."
            />

            <label>Tags</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="fomo, breakout, good entry, bad exit"
            />
          </section>

          <section className="form-section">
            <h2>Trade Screenshot</h2>
            <p className="section-helper">
              Upload the chart screenshot for this trade. You can use it as setup,
              entry, exit or result evidence.
            </p>

            <div className="form-grid">
              <div>
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTradeImageChange}
                />
              </div>

              <div>
                <label>Image type</label>
                <select
                  value={tradeImageType}
                  onChange={(e) => setTradeImageType(e.target.value)}
                >
                  <option value="setup">Setup</option>
                  <option value="entry">Entry</option>
                  <option value="exit">Exit</option>
                  <option value="result">Result</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label>Caption</label>
                <input
                  value={tradeImageCaption}
                  onChange={(e) => setTradeImageCaption(e.target.value)}
                  placeholder="Example: Entry confirmation screenshot"
                />
              </div>
            </div>

            {tradeImagePreview && (
              <div className="trade-image-preview">
                <img src={tradeImagePreview} alt="Trade preview" />
              </div>
            )}
          </section>

          {error && <p className="error-message">{error}</p>}

          <button className="save-trade-button" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Trade Entry"}
          </button>
        </form>
      </main>
    </div>
  );
}