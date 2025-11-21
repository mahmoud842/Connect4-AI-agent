# Connect 4 AI Game

A beautiful Connect 4 game with AI powered by Minimax and Expectiminimax algorithms with optional Alpha-Beta pruning.

## Features

✨ **Game Features:**

- 🎮 Interactive Connect 4 board with realistic styling
- 🤖 AI opponent using Minimax or Expectiminimax algorithms
- ⚡ Optional Alpha-Beta pruning optimization
- 🎯 Choose who starts first (AI or Human)
- 🔄 Reset game functionality
- 📊 Score tracking
- 🎵 Sound effects for piece drops
- 🎨 Beautiful animations and gradients

🌳 **Tree Visualization:**

- View game tree for Minimax algorithm
- View game tree for Expectiminimax algorithm
- Color-coded nodes (MAX, MIN, CHANCE)
- Navigate between game and tree view
- Mock data for demonstration

## Project Structure

```
Connect4-AI-Agent/
├── src/
│   ├── components/
│   │   ├── GameConfig.jsx       # Game configuration screen
│   │   ├── GameConfig.css
│   │   ├── GameBoard.jsx        # Main game board
│   │   └── GameBoard.css
│   ├── pages/
│   │   ├── TreeVisualization.jsx # Tree view page
│   │   └── TreeVisualization.css
│   ├── App.jsx                   # Main app with routing
│   ├── App.css
│   └── main.jsx
├── backend_api.py                # Flask backend (TODO: implement algorithms)
├── package.json
└── README.md
```

## Getting Started

### Frontend Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Backend Setup (Optional - for future integration)

1. **Install Flask and dependencies:**

   ```bash
   pip install flask flask-cors
   ```

2. **Run the Flask server:**

   ```bash
   python backend_api.py
   ```

3. **The backend will run on:**
   `http://localhost:5000`

## How to Play

1. **Configure Game:**

   - Choose algorithm: Minimax or Expectiminimax
   - Enable/disable Alpha-Beta pruning
   - Select who starts first (AI or Human)
   - Click "Start Game"

2. **Play the Game:**

   - Click on any column to drop your piece (red)
   - AI will automatically make its move (yellow)
   - Try to connect 4 pieces horizontally, vertically, or diagonally

3. **View Game Tree:**

   - Click "View Tree 🌳" button during the game
   - See the decision tree used by the AI
   - Click "Back to Game" to return

4. **Reset or Play Again:**
   - Use "Reset Game" button to restart current game
   - When game ends, choose "Play Again" to restart

## Game Controls

- **Back to Config:** Return to configuration screen
- **View Tree:** Navigate to tree visualization page
- **Reset Game:** Clear the board and start over
- **Play Again:** (After game ends) Start a new game

## Backend Integration

The frontend is ready to integrate with the Flask backend. To connect them:

1. Implement the TODO sections in `backend_api.py`:

   - `minimax()` function
   - `minimax_alpha_beta()` function
   - `expectiminimax()` function
   - `expectiminimax_alpha_beta()` function
   - `evaluate_board()` function
   - Helper functions

2. In `src/components/GameBoard.jsx`, uncomment the backend integration section in the `makeAIMove()` function

3. Make sure both frontend and backend servers are running

## API Endpoints (Backend)

### POST `/api/move`

Get AI's next move based on current board state.

**Request:**

```json
{
  "board": [[null, null, ...], ...],
  "algorithm": "minimax" | "expectiminimax",
  "useAlphaBeta": true | false,
  "player": "ai" | "human"
}
```

**Response:**

```json
{
  "column": 3,
  "tree": { ... }
}
```

### POST `/api/game-status`

Check if game has ended.

**Request:**

```json
{
  "board": [[null, null, ...], ...]
}
```

**Response:**

```json
{
  "gameOver": true | false,
  "winner": "human" | "ai" | "draw" | null,
  "winningCells": [[row, col], ...] | null
}
```

### POST `/api/get-tree`

Get game tree visualization data.

**Request:**

```json
{
  "board": [[null, null, ...], ...],
  "algorithm": "minimax" | "expectiminimax",
  "useAlphaBeta": true | false,
  "player": "ai" | "human"
}
```

**Response:**

```json
{
  "tree": { ... }
}
```

## Technologies Used

- **Frontend:**

  - React 19
  - React Router DOM
  - Vite
  - CSS3 (Gradients, Animations, Flexbox/Grid)

- **Backend (To be implemented):**
  - Flask
  - Flask-CORS

## Current Status

✅ **Completed:**

- Game configuration UI
- Connect 4 board with animations
- Score tracking
- Game logic (win detection, moves)
- Tree visualization (with mock data)
- Routing between pages
- Sound effects
- Game over screen
- Reset functionality

⏳ **To Do:**

- Implement Minimax algorithm in backend
- Implement Expectiminimax algorithm in backend
- Implement Alpha-Beta pruning
- Connect frontend to backend API
- Replace mock tree data with real algorithm trees

## Styling Highlights

- Gradient backgrounds
- Smooth animations (piece drops, glows, pulses)
- Hover effects
- Responsive design
- Glass-morphism effects
- Color-coded elements (players, nodes)

## Notes

- The game currently uses mock AI moves (random valid column)
- Tree visualization uses mock data
- Backend API structure is provided but needs algorithm implementation
- Sound effects are generated using Web Audio API

Enjoy playing Connect 4! 🎮
