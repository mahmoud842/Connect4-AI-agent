import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameConfig from "./components/GameConfig";
import GameBoard from "./components/GameBoard";
import TreeFlow from "./pages/TreeFlow";
import "./App.css";

function App() {
  const [gameConfig, setGameConfig] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameStarted(true);
  };

  const handleBackToConfig = () => {
    setGameStarted(false);
    setGameConfig(null);
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
              <GameBoard config={gameConfig} onBack={handleBackToConfig} />
            )
          }
        />
        <Route path="/tree" element={<TreeFlow />} />
      </Routes>
    </Router>
  );
}

export default App;
