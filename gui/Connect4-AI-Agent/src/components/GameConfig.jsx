import { useState } from "react";
import "./GameConfig.css";

function GameConfig({ onStartGame }) {
  const [algorithm, setAlgorithm] = useState("minimax");
  const [useAlphaBeta, setUseAlphaBeta] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState("ai");

  const handleStartGame = () => {
    onStartGame({
      algorithm,
      useAlphaBeta,
      firstPlayer,
    });
  };

  return (
    <div className="game-config">
      <div className="config-container">
        <h1 className="game-title">Connect 4 AI</h1>
        <p className="game-subtitle">Configure Your Game</p>

        <div className="config-options">
          <div className="config-section">
            <h3>Algorithm</h3>
            <div className="option-group">
              <label
                className={`option-card ${
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
                    <div className="option-description">
                      Classic game tree search
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`option-card ${
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
                    <div className="option-description">
                      Handles probabilistic outcomes
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="config-section">
            <h3>Optimization</h3>
            <label
              className={`option-card checkbox-card ${
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
                  <div className="option-description">
                    Optimize search by pruning branches
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="config-section">
            <h3>Who Starts?</h3>
            <div className="option-group">
              <label
                className={`option-card ${
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
                    <div className="option-description">
                      AI makes the first move
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`option-card ${
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
                    <div className="option-description">
                      You make the first move
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button className="start-button" onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
}

export default GameConfig;
