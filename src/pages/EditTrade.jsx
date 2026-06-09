// Página para editar una entrada guardada del journal.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Sidebar from "../components/Sidebar";
import { getTradeById, updateTrade } from "../services/tradeService";

export default function EditTrade() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Convierte fecha de Supabase a formato compatible con datetime-local.
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  // Carga el trade actual.
  useEffect(() => {
    const loadTrade = async () => {
      try {
        const trade = await getTradeById(id, user.id);

        setForm({
          title: trade.title || "",
          symbol: trade.symbol || "",
          trade_type: trade.trade_type || "buy",
          entry_price: trade.entry_price || "",
          stop_loss: trade.stop_loss || "",
          take_profit: trade.take_profit || "",
          exit_price: trade.exit_price || "",
          lot_size: trade.lot_size || "",
          risk_amount: trade.risk_amount || "",
          reward_amount: trade.reward_amount || "",
          profit_loss: trade.profit_loss || "",
          result: trade.result || "win",
          strategy: trade.strategy || "",
          setup_type: trade.setup_type || "",
          timeframe: trade.timeframe || "",
          emotion_before: trade.emotion_before || "",
          emotion_after: trade.emotion_after || "",
          mistakes: trade.mistakes || "",
          did_well: trade.did_well || "",
          lesson_learned: trade.lesson_learned || "",
          notes: trade.notes || "",
          pre_trade_analysis: trade.pre_trade_analysis || "",
          trade_execution: trade.trade_execution || "",
          trade_management: trade.trade_management || "",
          post_trade_reflection: trade.post_trade_reflection || "",
          tags: trade.tags?.join(", ") || "",
          trade_date: formatDateForInput(trade.trade_date),
        });
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    loadTrade();
  }, [id, user.id]);

  // Actualiza cualquier campo del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convierte campos numéricos vacíos en null.
  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  };

  // Guarda los cambios del trade.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const entry = toNumberOrNull(form.entry_price);
      const stop = toNumberOrNull(form.stop_loss);
      const take = toNumberOrNull(form.take_profit);

      let rr = null;

      if (entry && stop && take) {
        const risk = Math.abs(entry - stop);
        const reward = Math.abs(take - entry);
        rr = risk > 0 ? Number((reward / risk).toFixed(2)) : null;
      }

      const updatedTrade = {
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
        trade_date: form.trade_date
          ? new Date(form.trade_date).toISOString()
          : new Date().toISOString(),
      };

      await updateTrade(id, user.id, updatedTrade);

      navigate(`/trade/${id}`);
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
          <p>Loading trade...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard">
        <div className="trade-detail-top">
          <Link to={`/trade/${id}`} className="back-link">
            ← Back to Trade
          </Link>
        </div>

        <header className="dashboard-header">
          <div>
            <h1>Edit Trade</h1>
            <p>Update your saved trade entry.</p>
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
                  required
                />
              </div>

              <div>
                <label>Symbol / Pair</label>
                <input
                  name="symbol"
                  value={form.symbol}
                  onChange={handleChange}
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
                />
              </div>

              <div>
                <label>Setup type</label>
                <input
                  name="setup_type"
                  value={form.setup_type}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Emotion before</label>
                <input
                  name="emotion_before"
                  value={form.emotion_before}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Emotion after</label>
                <input
                  name="emotion_after"
                  value={form.emotion_after}
                  onChange={handleChange}
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
            />

            <label>Trade execution</label>
            <textarea
              name="trade_execution"
              value={form.trade_execution}
              onChange={handleChange}
            />

            <label>Trade management</label>
            <textarea
              name="trade_management"
              value={form.trade_management}
              onChange={handleChange}
            />

            <label>Post-trade reflection</label>
            <textarea
              name="post_trade_reflection"
              value={form.post_trade_reflection}
              onChange={handleChange}
            />

            <label>Mistakes made</label>
            <textarea
              name="mistakes"
              value={form.mistakes}
              onChange={handleChange}
            />

            <label>What I did well</label>
            <textarea
              name="did_well"
              value={form.did_well}
              onChange={handleChange}
            />

            <label>Lesson learned</label>
            <textarea
              name="lesson_learned"
              value={form.lesson_learned}
              onChange={handleChange}
            />

            <label>Extra notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />

            <label>Tags</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="fomo, breakout, good entry"
            />
          </section>

          {error && <p className="error-message">{error}</p>}

          <button className="save-trade-button" type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}