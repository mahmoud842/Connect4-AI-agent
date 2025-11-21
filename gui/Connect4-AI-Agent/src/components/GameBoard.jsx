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

  // Count pieces for score calculation
  const countPieces = (board, player) => {
    let count = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === player) count++;
      }
    }
    return count;
  };

  // Check for winner (using K from config)
  const checkWinner = (board) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - K; col++) {
        if (board[row][col]) {
          let match = true;
          for (let i = 1; i < K; i++) {
            if (board[row][col] !== board[row][col + i]) {
              match = false;
              break;
            }
          }
          if (match) return board[row][col];
        }
      }
    }

    // Check vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row <= ROWS - K; row++) {
        if (board[row][col]) {
          let match = true;
          for (let i = 1; i < K; i++) {
            if (board[row][col] !== board[row + i][col]) {
              match = false;
              break;
            }
          }
          if (match) return board[row][col];
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row <= ROWS - K; row++) {
      for (let col = 0; col <= COLS - K; col++) {
        if (board[row][col]) {
          let match = true;
          for (let i = 1; i < K; i++) {
            if (board[row][col] !== board[row + i][col + i]) {
              match = false;
              break;
            }
          }
          if (match) return board[row][col];
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row <= ROWS - K; row++) {
      for (let col = K - 1; col < COLS; col++) {
        if (board[row][col]) {
          let match = true;
          for (let i = 1; i < K; i++) {
            if (board[row][col] !== board[row + i][col - i]) {
              match = false;
              break;
            }
          }
          if (match) return board[row][col];
        }
      }
    }

    // Check for draw (board is full)
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
            if (result === "draw") {
              // Calculate score based on number of pieces on board
              const humanPieces = countPieces(newBoard, "human");
              const aiPieces = countPieces(newBoard, "ai");
              setScore({ human: humanPieces, ai: aiPieces });
            } else if (result === "human") {
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

    // TEMPORARY: Frontend handles piece placement and win checking
    // In backend integration, only send move to backend
    dropPiece(col, "human");

    /* BACKEND INTEGRATION - REPLACE handleColumnClick LOGIC
    // Send human move to backend for validation and game state update
    fetch('http://localhost:5000/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: board,
        column: col,
        player: 'human',
        algorithm: config.algorithm,
        useAlphaBeta: config.useAlphaBeta,
        k: config.k
      })
    })
    .then(res => res.json())
    .then(data => {
      // Backend returns updated game state
      // Frontend just displays the result
      const newBoard = data.board;
      setBoard(newBoard);
      setLastMove(data.lastMove);
      
      if (data.gameOver) {
        setGameOver(true);
        setWinner(data.winner);
        // Update score based on backend response
      } else {
        setCurrentPlayer('ai');
      }
    });
    */
  };

  // AI move - will be replaced with backend call
  const makeAIMove = () => {
    if (gameOver) return;

    // TEMPORARY: Mock AI move for simulation only
    // This entire logic will be replaced by backend integration
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

    /* BACKEND INTEGRATION - REPLACE ENTIRE makeAIMove FUNCTION
    // Send board state to backend
    fetch('http://localhost:5000/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: board,
        algorithm: config.algorithm,
        useAlphaBeta: config.useAlphaBeta,
        k: config.k,
        player: 'ai'
      })
    })
    .then(res => res.json())
    .then(data => {
      // Backend returns: { column: number, tree: object, gameOver: boolean, winner: string|null }
      const newBoard = board.map(row => [...row]);
      
      // Find empty row in the column returned by backend
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!newBoard[row][data.column]) {
          newBoard[row][data.column] = 'ai';
          setLastMove({ row, col: data.column });
          playDropSound();
          
          setTimeout(() => {
            setBoard(newBoard);
            
            // Backend determines game state
            if (data.gameOver) {
              setGameOver(true);
              setWinner(data.winner);
              if (data.winner === "draw") {
                const humanPieces = countPieces(newBoard, "human");
                const aiPieces = countPieces(newBoard, "ai");
                setScore({ human: humanPieces, ai: aiPieces });
              } else if (data.winner === "human") {
                setScore((prev) => ({ ...prev, human: prev.human + 1 }));
              } else if (data.winner === "ai") {
                setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
              }
            } else {
              setCurrentPlayer("human");
            }
          }, 500);
          break;
        }
      }
      
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
