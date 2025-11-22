import { useState } from "react";
import "./GameConfig.css";

function GameConfig({ onStartGame }) {
  const [algorithm, setAlgorithm] = useState("minimax");
  const [useAlphaBeta, setUseAlphaBeta] = useState(true);
  const [firstPlayer, setFirstPlayer] = useState("human");
  const [k, setK] = useState(4);
  const [error, setError] = useState("");

  const handleStartGame = () => {
    // Validate K value
    if (k < 4) {
      setError("K must be at least 4");
      return;
    }
    setError("");

    onStartGame({
      algorithm,
      useAlphaBeta,
      firstPlayer,
      boardWidth: 7,
      boardHeight: 6,
      k: parseInt(k),
    });
  };

  return (
    <div className="game-config">
      <div className="config-container">
        <div className="config-header">
          <h1 className="game-title">🎮 Connect 4 AI</h1>
          <p className="game-subtitle">
            Configure your ultimate game experience
          </p>
        </div>

        <div className="config-grid">
          {/* K Value Section */}
          <div className="config-section board-size-section">
            <h3>🎯 K Value</h3>
            <div className="size-inputs">
              <div className="input-group">
                <label>K (≥4)</label>
                <input
                  type="number"
                  min="4"
                  value={k}
                  onChange={(e) => setK(e.target.value)}
                  className="size-input"
                />
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Algorithm Section */}
          <div className="config-section">
            <h3>🧠 Algorithm</h3>
            <div className="option-group horizontal">
              <label
                className={`option-card compact ${
                  algorithm === "minimax" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  value="minimax"
                  checked={algorithm === "minimax"}
                  onChange={(e) => setAlgorithm(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">🎯</div>
                  <div className="option-text">
                    <div className="option-title">Minimax</div>
                  </div>
                </div>
              </label>

              <label
                className={`option-card compact ${
                  algorithm === "expectiminimax" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  value="expectiminimax"
                  checked={algorithm === "expectiminimax"}
                  onChange={(e) => setAlgorithm(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">🎲</div>
                  <div className="option-text">
                    <div className="option-title">Expectiminimax</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Alpha-Beta Section */}
          <div className="config-section">
            <h3>⚡ Optimization</h3>
            <label
              className={`option-card compact checkbox-card ${
                useAlphaBeta ? "selected" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={useAlphaBeta}
                onChange={(e) => setUseAlphaBeta(e.target.checked)}
              />
              <div className="option-content">
                <div className="option-icon">⚡</div>
                <div className="option-text">
                  <div className="option-title">Alpha-Beta Pruning</div>
                </div>
              </div>
            </label>
          </div>

          {/* Who Starts Section */}
          <div className="config-section">
            <h3>🎲 First Move</h3>
            <div className="option-group horizontal">
              <label
                className={`option-card compact ${
                  firstPlayer === "ai" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="firstPlayer"
                  value="ai"
                  checked={firstPlayer === "ai"}
                  onChange={(e) => setFirstPlayer(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">🤖</div>
                  <div className="option-text">
                    <div className="option-title">AI First</div>
                  </div>
                </div>
              </label>

              <label
                className={`option-card compact ${
                  firstPlayer === "human" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="firstPlayer"
                  value="human"
                  checked={firstPlayer === "human"}
                  onChange={(e) => setFirstPlayer(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">👤</div>
                  <div className="option-text">
                    <div className="option-title">Human First</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button className="start-button" onClick={handleStartGame}>
          <span className="button-icon">🚀</span>
          <span>Launch Game</span>
        </button>
      </div>
    </div>
  );
}

export default GameConfig;
