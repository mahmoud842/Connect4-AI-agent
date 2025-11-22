import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameBoard.css";

function GameBoard({ config, onBack, initialGameState, onGameStateChange }) {
  const navigate = useNavigate();
  const ROWS = config.boardHeight || 6;
  const COLS = config.boardWidth || 7;
  const K = config.k || 4; // Get K from config

  const [board, setBoard] = useState(
    initialGameState?.board ||
      Array(ROWS)
        .fill()
        .map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(
    initialGameState?.currentPlayer ||
      (config.firstPlayer === "human" ? "human" : "ai")
  );
  const [gameOver, setGameOver] = useState(initialGameState?.gameOver || false);
  const [winner, setWinner] = useState(initialGameState?.winner || null);
  const [score, setScore] = useState(
    initialGameState?.score || { human: 0, ai: 0 }
  );
  const [animatingColumn, setAnimatingColumn] = useState(null);
  const [animatingRow, setAnimatingRow] = useState(null);
  const [lastMove, setLastMove] = useState(initialGameState?.lastMove || null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Show modal when game ends
  useEffect(() => {
    if (gameOver) {
      setShowGameOverModal(true);
    }
  }, [gameOver]);

  // Save game state whenever it changes
  useEffect(() => {
    if (onGameStateChange) {
      onGameStateChange({
        board,
        currentPlayer,
        gameOver,
        winner,
        score,
        lastMove,
      });
    }
  }, [board, currentPlayer, gameOver, winner, score, lastMove]);

  // Play drop sound - clean plastic click
  const playDropSound = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const now = audioContext.currentTime;

    // Short burst of filtered noise for plastic "click"
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    // High-pass filter to remove sandy low frequencies
    const highpass = audioContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 3000;
    highpass.Q.value = 0.5;

    // Sharp envelope for crisp plastic click
    const envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0.4, now);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    noise.connect(highpass);
    highpass.connect(envelope);
    envelope.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.05);
  };

  // Handle column click - Backend Integration
  const handleColumnClick = (col) => {
    if (gameOver || currentPlayer === "ai" || animatingColumn !== null) return;

    // Check if column is full
    if (board[0][col]) return;

    // Animate drop first
    setAnimatingColumn(col);

    // Find the row where piece will land
    let landingRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        landingRow = row;
        break;
      }
    }

    if (landingRow === -1) return;

    setAnimatingRow(landingRow);
    playDropSound();

    setTimeout(() => {
      setAnimatingColumn(null);
      setAnimatingRow(null);

      // Send human move to backend for validation and game state update
      const requestData = {
        board: [...board].reverse(), // Reverse for backend (backend: row 0 = bottom)
        column: col,
        player: "human",
        algorithm: config.algorithm,
        useAlphaBeta: config.useAlphaBeta,
        k: config.k,
        firstPlayer: config.firstPlayer,
      };

      console.log("🎮 Sending HUMAN move request:", requestData);

      fetch("http://127.0.0.1:5000/api/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Received HUMAN move response:", data);

          // Backend returns board with row 0 = bottom, reverse it for frontend
          const newBoard = [...data.board].reverse();
          setBoard(newBoard);
          setLastMove({ row: landingRow, col });

          if (data.gameOver) {
            setGameOver(true);
            setWinner(data.winner);
            setScore(data.score);
          } else {
            setCurrentPlayer("ai");
          }
        })
        .catch((error) => {
          console.error("Error making move:", error);
          alert(
            "Failed to connect to backend server. Please ensure it is running."
          );
        });
    }, 500);
  };

  // AI move - Backend Integration
  const makeAIMove = () => {
    if (gameOver) return;

    // Send board state to backend
    const requestData = {
      board: [...board].reverse(), // Reverse for backend (backend: row 0 = bottom)
      algorithm: config.algorithm,
      useAlphaBeta: config.useAlphaBeta,
      k: config.k,
      player: "ai",
      firstPlayer: config.firstPlayer,
    };

    console.log("🤖 Sending AI move request:", requestData);

    fetch("http://127.0.0.1:5000/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Received AI move response:", data);

        // Animate AI move
        setAnimatingColumn(data.column);

        // Find landing row
        let landingRow = -1;
        for (let row = ROWS - 1; row >= 0; row--) {
          if (!board[row][data.column]) {
            landingRow = row;
            break;
          }
        }

        setAnimatingRow(landingRow);
        playDropSound();

        setTimeout(() => {
          // Backend returns board with row 0 = bottom, reverse it for frontend
          const newBoard = [...data.board].reverse();
          setBoard(newBoard);
          setAnimatingColumn(null);
          setAnimatingRow(null);
          setLastMove({ row: landingRow, col: data.column });

          // Backend determines game state
          if (data.gameOver) {
            setGameOver(true);
            setWinner(data.winner);
            setScore(data.score);
          } else {
            setCurrentPlayer("human");
          }

          // Store tree for visualization
          if (data.tree) {
            sessionStorage.setItem("currentTree", JSON.stringify(data.tree));
            sessionStorage.setItem("currentConfig", JSON.stringify(config));
          }
        }, 500);
      })
      .catch((error) => {
        console.error("Error making AI move:", error);
        alert(
          "Failed to connect to backend server. Please ensure it is running."
        );
        setCurrentPlayer("human"); // Fallback to human turn
      });
  };

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (currentPlayer === "ai" && !gameOver && animatingColumn === null) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, animatingColumn]);

  // Reset game
  const resetGame = () => {
    setBoard(
      Array(ROWS)
        .fill()
        .map(() => Array(COLS).fill(null))
    );
    setCurrentPlayer(config.firstPlayer === "human" ? "human" : "ai");
    setGameOver(false);
    setWinner(null);
    setAnimatingColumn(null);
    setAnimatingRow(null);
    setLastMove(null);
    setShowGameOverModal(false);
  };

  // Show tree visualization
  const showTree = () => {
    navigate("/tree", {
      state: {
        config,
        board,
        currentPlayer,
        gameOver,
        winner,
        score,
        lastMove,
      },
    });
  };

  return (
    <div className="game-board-container">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Config
        </button>
        <div className="game-info">
          <h2>Connect 4 AI</h2>
          <div className="algorithm-info">
            {config.algorithm === "minimax"
              ? "🎯 Minimax"
              : "🎲 Expectiminimax"}
            {config.useAlphaBeta && " ⚡ Alpha-Beta"}
          </div>
        </div>
        <button className="tree-button" onClick={showTree}>
          View Tree 🌳
        </button>
      </div>

      <div className="score-board">
        <div className="score-item human">
          <div className="score-icon">👤</div>
          <div className="score-label">You</div>
          <div className="score-value">{score.human}</div>
        </div>
        <div className="score-divider">VS</div>
        <div className="score-item ai">
          <div className="score-icon">🤖</div>
          <div className="score-label">AI</div>
          <div className="score-value">{score.ai}</div>
        </div>
      </div>

      <div className="turn-indicator">
        {!gameOver && (
          <div className={`turn-badge ${currentPlayer}`}>
            {currentPlayer === "human" ? "👤 Your Turn" : "🤖 AI Thinking..."}
          </div>
        )}
      </div>

      <div className="board-wrapper">
        <div className="connect4-board">
          {/* Columns */}
          <div className="board-columns" style={{ "--cols": COLS }}>
            {Array(COLS)
              .fill()
              .map((_, col) => (
                <div
                  key={col}
                  className={`board-column ${
                    currentPlayer === "human" && !gameOver ? "clickable" : ""
                  }`}
                  onClick={() => handleColumnClick(col)}
                >
                  {/* Drop zone indicator */}
                  {currentPlayer === "human" && !gameOver && !board[0][col] && (
                    <div className="drop-indicator human"></div>
                  )}

                  {/* Cells in this column */}
                  {Array(ROWS)
                    .fill()
                    .map((_, row) => (
                      <div
                        key={`${row}-${col}`}
                        className={`cell ${board[row][col] || ""} ${
                          lastMove &&
                          lastMove.row === row &&
                          lastMove.col === col
                            ? "last-move"
                            : ""
                        }`}
                      >
                        <div className="cell-hole">
                          {board[row][col] && (
                            <div className={`piece ${board[row][col]}`}></div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>

      {gameOver && showGameOverModal && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <button
              className="close-modal-button"
              onClick={() => setShowGameOverModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="game-over-content">
              {winner === "draw" ? (
                <>
                  <div className="game-over-icon">🤝</div>
                  <h2>It's a Draw!</h2>
                  <p>Well played by both sides</p>
                </>
              ) : (
                <>
                  <div className={`game-over-icon ${winner}`}>
                    {winner === "human" ? "🎉" : "🤖"}
                  </div>
                  <h2>{winner === "human" ? "You Win!" : "AI Wins!"}</h2>
                  <p>
                    {winner === "human"
                      ? "Congratulations!"
                      : "Better luck next time!"}
                  </p>
                </>
              )}

              <div className="final-score">
                <div className="score-display">
                  <span className="score-label">Final Score</span>
                  <span className="score-numbers">
                    {score.human} - {score.ai}
                  </span>
                </div>
              </div>

              <div className="game-over-actions">
                <button className="play-again-button" onClick={resetGame}>
                  Play Again
                </button>
                <button className="view-tree-button" onClick={showTree}>
                  View Game Tree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="game-controls">
        <button className="reset-button" onClick={resetGame}>
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
}

export default GameBoard;
