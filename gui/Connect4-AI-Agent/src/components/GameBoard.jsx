import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameBoard.css";

function GameBoard({ config, onBack }) {
  const navigate = useNavigate();
  const ROWS = config.boardHeight || 6;
  const COLS = config.boardWidth || 7;

  const [board, setBoard] = useState(
    Array(ROWS)
      .fill()
      .map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState(
    config.firstPlayer === "human" ? "human" : "ai"
  );
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ human: 0, ai: 0 });
  const [animatingColumn, setAnimatingColumn] = useState(null);
  const [animatingRow, setAnimatingRow] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  // Play drop sound
  const playDropSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Check for winner
  const checkWinner = (board) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row][col + 1] &&
          board[row][col] === board[row][col + 2] &&
          board[row][col] === board[row][col + 3]
        ) {
          return board[row][col];
        }
      }
    }

    // Check vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col] &&
          board[row][col] === board[row + 2][col] &&
          board[row][col] === board[row + 3][col]
        ) {
          return board[row][col];
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col + 1] &&
          board[row][col] === board[row + 2][col + 2] &&
          board[row][col] === board[row + 3][col + 3]
        ) {
          return board[row][col];
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        if (
          board[row][col] &&
          board[row][col] === board[row + 1][col - 1] &&
          board[row][col] === board[row + 2][col - 2] &&
          board[row][col] === board[row + 3][col - 3]
        ) {
          return board[row][col];
        }
      }
    }

    // Check for draw
    if (board[0].every((cell) => cell !== null)) {
      return "draw";
    }

    return null;
  };

  // Drop piece in column
  const dropPiece = (col, player) => {
    const newBoard = board.map((row) => [...row]);

    // Find the lowest empty row in the column
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = player;

        // Animate the drop
        setAnimatingColumn(col);
        setAnimatingRow(row);
        setLastMove({ row, col });
        playDropSound();

        setTimeout(() => {
          setBoard(newBoard);
          setAnimatingColumn(null);
          setAnimatingRow(null);

          const result = checkWinner(newBoard);
          if (result) {
            setGameOver(true);
            setWinner(result);
            if (result === "human") {
              setScore((prev) => ({ ...prev, human: prev.human + 1 }));
            } else if (result === "ai") {
              setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
            }
          } else {
            setCurrentPlayer(player === "human" ? "ai" : "human");
          }
        }, 500);

        return true;
      }
    }
    return false;
  };

  // Handle column click
  const handleColumnClick = (col) => {
    if (gameOver || currentPlayer === "ai" || animatingColumn !== null) return;
    dropPiece(col, "human");
  };

  // AI move (mock - will be replaced with backend call)
  const makeAIMove = () => {
    if (gameOver) return;

    setTimeout(() => {
      // Mock AI move - pick random valid column
      const validColumns = [];
      for (let col = 0; col < COLS; col++) {
        if (!board[0][col]) {
          validColumns.push(col);
        }
      }

      if (validColumns.length > 0) {
        const randomCol =
          validColumns[Math.floor(Math.random() * validColumns.length)];
        dropPiece(randomCol, "ai");
      }
    }, 1000);

    /* BACKEND INTEGRATION - TO BE IMPLEMENTED
    // Send board state to backend
    fetch('http://localhost:5000/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: board,
        algorithm: config.algorithm,
        useAlphaBeta: config.useAlphaBeta,
        player: 'ai'
      })
    })
    .then(res => res.json())
    .then(data => {
      // data should contain: { column: number, tree: object }
      dropPiece(data.column, 'ai');
      // Store tree for visualization
      sessionStorage.setItem('currentTree', JSON.stringify(data.tree));
    });
    */
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
  };

  // Show tree visualization
  const showTree = () => {
    navigate("/tree", { state: { config, board } });
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

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
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
