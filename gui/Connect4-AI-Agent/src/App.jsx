import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameConfig from "./components/GameConfig";
import GameBoard from "./components/GameBoard";
import TreeFlow from "./pages/TreeFlow";
import "./App.css";

function App() {
  const [gameConfig, setGameConfig] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameStarted(true);
    setGameState(null); // Reset game state for new game
  };

  const handleBackToConfig = () => {
    setGameStarted(false);
    setGameConfig(null);
    setGameState(null);
  };

  const handleGameStateChange = (state) => {
    setGameState(state);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !gameStarted ? (
              <GameConfig onStartGame={handleStartGame} />
            ) : (
              <GameBoard
                config={gameConfig}
                onBack={handleBackToConfig}
                initialGameState={gameState}
                onGameStateChange={handleGameStateChange}
              />
            )
          }
        />
        <Route path="/tree" element={<TreeFlow />} />
      </Routes>
    </Router>
  );
}

export default App;
