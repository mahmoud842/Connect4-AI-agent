# Connect4 AI - Backend Integration Summary

## Overview

This document summarizes the complete integration between the React frontend and Python backend for the Connect4 AI game. The integration was designed to use existing backend algorithms **without modifying any backend files**.

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│  React Frontend │  HTTP   │  Flask Backend   │ Calls   │  Backend Algorithms │
│   (Port 5173)   │ ◄─────► │   (Port 5000)    │ ──────► │   (Unchanged)       │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
        │                            │                             │
    Display UI              Convert Formats              Game Logic
    Handle Input            Route Requests               Minimax/Alpha-Beta
    Tree Visualization      Build JSON Tree              State Management
```

---

## Files Structure

### Created Files

- **`backend_server.py`** - Flask integration layer (NEW)
- **`HOW_TO_RUN.md`** - Simple setup instructions (NEW)

### Modified Files

- **`src/components/GameBoard.jsx`** - Backend API integration
- **`src/pages/TreeFlow.jsx`** - Load tree from backend
- **`src/components/GameBoard.css`** - Close button styling

### Unchanged Backend Files (NOT MODIFIED)

- **`src/minimax.py`** - Minimax algorithm
- **`src/alpha_beta.py`** - Minimax with alpha-beta pruning
- **`src/state.py`** - Game state and heuristic functions

### Not Implemented

- ~~`src/expected_minimax.py`~~ - Expectiminimax (not tested/integrated)
- ~~`src/expected_alpha_beta.py`~~ - Expectiminimax with pruning (not tested/integrated)

---

## Implementation Details

### 1. Data Format Conversion

The frontend and backend use different board representations that must be converted:

#### Board Format

| Aspect           | Frontend          | Backend        | Conversion                   |
| ---------------- | ----------------- | -------------- | ---------------------------- |
| **Empty Cell**   | `null`            | `0`            | `board_to_internal_format()` |
| **Human Player** | `"human"`         | `-1` (MIN)     | `board_to_internal_format()` |
| **AI Player**    | `"ai"`            | `1` (MAX)      | `board_to_internal_format()` |
| **Direction**    | Send: `reverse()` | Row 0 = Bottom | Receive: `reverse()`         |

**Why Reverse?**

- Frontend: Row 0 = TOP (standard array indexing)
- Backend: Row 0 = BOTTOM (like physical Connect4 board)
- Solution: `[...board].reverse()` when sending/receiving

#### Tree Format

| Backend State Object     | Frontend JSON                 |
| ------------------------ | ----------------------------- |
| `state.value`            | `value` (numeric)             |
| `state.player` (1/-1)    | `player` ("MAX"/"MIN"/"LEAF") |
| `state.action`           | `move` (column 0-6)           |
| `state.children` (array) | `children` (array)            |

---

### 2. Game Flow

#### Human Move Flow

```
1. User clicks column
2. Frontend animates piece drop
3. Frontend reverses board and sends to /api/move
   Request: { board, column, player: "human", ... }
4. Backend validates move using state.available_actions()
5. Backend applies move via state.transition(column)
6. Backend checks if game over using check_game_over(state)
7. Backend reverses and returns updated board
8. Frontend reverses again and displays result
```

#### AI Move Flow

```
1. Frontend detects AI's turn
2. Frontend reverses board and sends to /api/move
   Request: { board, player: "ai", algorithm, useAlphaBeta, k, ... }
3. Backend calls minimax.minimax() or alpha_beta.minimax()
4. Backend generates full game tree with state.children
5. Backend converts tree: state_to_tree_json()
6. Backend checks game over status
7. Backend returns: { column, board, tree, gameOver, winner, score }
8. Frontend reverses board, stores tree in sessionStorage
9. Frontend animates AI move and displays result
```

---

### 3. Backend Functions

#### `board_to_internal_format(board)`

Converts frontend board to backend format:

- `null` → `0`
- `"human"` → `-1`
- `"ai"` → `1`

#### `board_to_frontend_format(board)`

Converts backend board to frontend format:

- `0` → `null`
- `-1` → `"human"`
- `1` → `"ai"`

#### `state_to_tree_json(state, is_expectiminimax=False)`

Recursively converts backend State tree to frontend JSON:

- Extracts `state.value` (or calls `state.heuristic()` if not set)
- Maps `state.player` to "MAX"/"MIN"/"LEAF"
- Copies `state.action` to `move`
- Recursively processes `state.children`

**Note:** `is_expectiminimax=False` always used (expectiminimax not implemented)

#### `check_game_over(state)`

Determines game status:

1. Checks if board is full using `state.is_terminal()`
2. If full, calls `state.terminal_score()` to count 4-in-a-rows
3. Compares scores:
   - More AI 4-in-a-rows → AI wins
   - More Human 4-in-a-rows → Human wins
   - Equal → Draw
4. Returns: `(game_over, winner, score)`

---

### 4. API Endpoints

#### `POST /api/move`

**Purpose:** Handle both human and AI moves

**Request Body:**

```json
{
  "board": [[null, "human", "ai", ...], ...],  // 6x7 array
  "player": "human" | "ai",
  "column": 0-6,  // Required only for human moves
  "algorithm": "minimax",  // "expectiminimax" not supported
  "useAlphaBeta": true | false,
  "k": 4,
  "firstPlayer": "human" | "ai"
}
```

**Response:**

```json
{
  "board": [[null, "human", "ai", ...], ...],
  "column": 3,
  "gameOver": true | false,
  "winner": "human" | "ai" | "draw" | null,
  "score": { "human": 2, "ai": 1 },  // Count of 4-in-a-rows
  "tree": { /* tree structure */ },  // Only for AI moves
  "value": 150  // Only for AI moves (heuristic value)
}
```

**Logic:**

- **Human moves:** Validate only, check terminal state
- **AI moves:** Run full minimax search, generate tree

#### `POST /api/game-status`

Check current game status without making a move

#### `GET /api/health`

Health check endpoint: `{"status": "ok", "message": "Backend server is running"}`

---

### 5. Algorithm Integration

#### Minimax (Implemented ✓)

```python
# In backend_server.py
if use_alpha_beta:
    value, action, root_state = alpha_beta.minimax(internal_board, k)
else:
    value, action, root_state = minimax.minimax(internal_board, k)
```

**How it works:**

1. Backend calls `minimax.minimax(board, depth=K)`
2. Returns: `(value, action, root_state)`
   - `value`: Heuristic evaluation
   - `action`: Best column (0-6)
   - `root_state`: State tree with all children
3. Tree is converted to JSON and sent to frontend

#### Expectiminimax (NOT Implemented ✗)

```python
# Code exists but is NOT tested or integrated
# if algorithm == 'expectiminimax':
#     if use_alpha_beta:
#         value, action, root_state = expected_alpha_beta.minimax(...)
#     else:
#         value, action, root_state = expected_minimax.minimax(...)
```

**Status:**

- Backend code exists but disabled
- Frontend has option in UI but not functional
- Requires testing and verification
- Tree visualization would need CHANCE nodes support

---

### 6. Game Over Detection

#### When Does Game End?

Game ends **only when board is full** (`state.is_terminal()` returns `True`)

#### How is Winner Determined?

1. Call `state.terminal_score()`:

   ```python
   terminal_scores = state.terminal_score()
   ai_wins = terminal_scores[1]      # Count of AI's 4-in-a-rows
   human_wins = terminal_scores[-1]  # Count of Human's 4-in-a-rows
   ```

2. Compare counts:
   - `ai_wins > human_wins` → AI wins
   - `human_wins > ai_wins` → Human wins
   - `ai_wins == human_wins` → Draw

#### Score Display

- **Score numbers** = count of 4-in-a-row formations
- **Not** total pieces on board
- Example: Score 2-1 means AI has 2 four-in-a-rows, Human has 1

---

### 7. Tree Visualization

#### Data Flow

```
Backend State Tree → state_to_tree_json() → Frontend JSON → React Flow
```

#### Tree Structure

```json
{
  "value": 150,           // Heuristic value
  "player": "MAX",        // "MAX", "MIN", or "LEAF"
  "move": 3,              // Column index (0-6), null for root
  "children": [...]       // Array of child nodes
}
```

#### Node Colors

- **Red (🔴):** MAX nodes (AI's turn)
- **Yellow (🟡):** MIN nodes (Human's turn)
- **Green (🟢):** LEAF nodes (terminal states)
- **Purple (🟣):** CHANCE nodes (expectiminimax only - not implemented)

#### Storage

Tree is stored in browser `sessionStorage`:

```javascript
sessionStorage.setItem("currentTree", JSON.stringify(data.tree));
sessionStorage.setItem("currentConfig", JSON.stringify(config));
```

---

### 8. Frontend Features

#### Game Board

- **7x6 fixed board** (not configurable)
- **K value input** (4 or more in a row to win)
- **Algorithm selection:** Minimax only (expectiminimax disabled)
- **Alpha-Beta toggle:** Enable/disable pruning
- **First player selection:** Human or AI

#### Game Controls

- **Column click:** Human makes move
- **Automatic AI moves:** Triggered when AI's turn
- **Reset button:** Clear board and restart
- **View Tree button:** Navigate to tree visualization
- **Back to Config:** Return to setup screen

#### Game Over Modal

- **Displays winner** (AI/Human/Draw)
- **Shows final score** (count of 4-in-a-rows)
- **Close button (✕):** Dismiss modal, view final board
- **Board is frozen:** Cannot play after game ends
- **Play Again button:** Reset and start new game
- **View Game Tree button:** See decision tree

#### Sound Effects

- **Plastic drop sound** using Web Audio API
- **High-pass filtered white noise** for realistic click

---

### 9. Console Logging

#### Frontend Logs (Browser Console)

```javascript
🎮 Sending HUMAN move request: { board, column, player, ... }
✅ Received HUMAN move response: { board, gameOver, winner, ... }

🤖 Sending AI move request: { board, player, algorithm, ... }
✅ Received AI move response: { column, value, tree, ... }
```

#### Backend Logs (Terminal)

```
============================================================
📥 RECEIVED REQUEST:
Player: human
Column: 3
Algorithm: minimax
Alpha-Beta: True
K: 4
Board (first 2 rows): [[null, null, ...], ...]
============================================================

🔄 Converted internal board (first 2 rows): [[0, 0, ...], ...]

📤 SENDING HUMAN RESPONSE:
Column: 3
Game Over: False
Winner: None
Score: {'human': 0, 'ai': 0}
Board (first 2 rows): [[None, None, ...], ...]
============================================================
```

---

### 10. Key Design Decisions

#### 1. No Backend Modifications

- All existing backend files remain **unchanged**
- Integration layer (`backend_server.py`) acts as bridge
- Preserves original algorithm implementations

#### 2. Board Representation

- Frontend and backend use inverted row indices
- Solution: Reverse arrays during conversion
- Ensures pieces drop to bottom correctly

#### 3. Game Over Logic

- Backend determines all game state
- Frontend only displays results
- Single source of truth (backend)

#### 4. Tree Generation

- Only generated for AI moves
- Stored in browser sessionStorage
- Persists across navigation

#### 5. Score Calculation

- Only when board is full
- Based on count of 4-in-a-rows
- Not total pieces on board

#### 6. Modal Behavior

- Can be closed to view board
- Game remains frozen (no more moves)
- Must reset to play again

---

## Configuration & Settings

### K Value

- **Default:** 4
- **Minimum:** 4
- **Dynamically set** in backend before each algorithm call:
  ```python
  minimax.K = k
  alpha_beta.K = k
  ```

### Algorithm Selection

- **Minimax:** ✓ Implemented
- **Minimax + Alpha-Beta:** ✓ Implemented
- **Expectiminimax:** ✗ Not implemented
- **Expectiminimax + Alpha-Beta:** ✗ Not implemented

### Board Size

- **Fixed:** 7 columns × 6 rows
- **Not configurable** (hardcoded in state.py: `ROWS=6`, `COLS=7`)

---

## Running the Application

### Prerequisites

- Node.js 20+
- Python 3.8+
- Flask and flask-cors installed

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip3 install Flask flask-cors
```

### Running

**Terminal 1 - Backend:**

```bash
python3 backend_server.py
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

**Then open:** http://localhost:5173

---

## Testing Checklist

### ✅ Implemented & Tested

- [x] Human moves validated by backend
- [x] AI moves use minimax algorithm
- [x] AI moves use alpha-beta pruning
- [x] Board reversal for correct piece placement
- [x] Game over detection (board full)
- [x] Score calculation (count 4-in-a-rows)
- [x] Winner determination (compare scores)
- [x] Tree generation from state.children
- [x] Tree visualization with React Flow
- [x] Tree node values from heuristic
- [x] Move labels on tree nodes (Col X)
- [x] Game state persistence across navigation
- [x] Sound effects on piece drop
- [x] Modal close button
- [x] Frozen board after game over
- [x] Console logging (frontend & backend)

### ❌ Not Implemented

- [ ] Expectiminimax algorithm integration
- [ ] Expectiminimax with alpha-beta pruning
- [ ] CHANCE nodes in tree visualization
- [ ] Probability display for expectiminimax
- [ ] Dynamic board size configuration
- [ ] Win detection before board is full
- [ ] Undo/redo moves
- [ ] Save/load game state
- [ ] AI difficulty levels

---

## Known Limitations

1. **Expectiminimax not integrated** - Code exists but untested
2. **Board size is fixed** - Cannot change 7×6 dimensions
3. **Game only ends when full** - Does not end immediately on 4-in-a-row
4. **No move history** - Cannot undo or replay moves
5. **No persistent storage** - Game state lost on page reload
6. **K value applies to score** - Uses 4-in-a-row for terminal_score regardless of K

---

## Troubleshooting

### Backend Won't Start

```bash
# Check if Flask is installed
pip3 list | grep Flask

# Install if missing
pip3 install Flask flask-cors
```

### Frontend Can't Connect

```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Backend server is running"}
```

### Pieces Not Dropping Correctly

- Check browser console for board data
- Verify board reversal in logs
- Backend logs show internal board format

### Tree Shows Zero Values

- Values are now loaded correctly
- If still zero, check that minimax ran successfully
- Backend logs show value returned by algorithm

### Game Won't End

- Game only ends when board is completely full
- Check `is_terminal()` in backend logs
- Winner determined by comparing 4-in-a-row counts

---

## Future Improvements

1. **Implement Expectiminimax**

   - Test expected_minimax.py and expected_alpha_beta.py
   - Add CHANCE node visualization
   - Display probabilities on chance nodes

2. **Early Win Detection**

   - Check for 4-in-a-row after each move
   - End game immediately when winner found
   - Don't wait for board to be full

3. **Configurable Board Size**

   - Allow 6×7, 7×8, or custom dimensions
   - Update ROWS and COLS in state.py
   - Adjust UI dynamically

4. **Move History**

   - Track all moves in sequence
   - Implement undo/redo
   - Replay game from history

5. **Difficulty Levels**
   - Vary K value (depth limit)
   - Adjust heuristic weights
   - Add random variation to AI

---

## Summary

The integration successfully connects the React frontend with the Python backend algorithms **without modifying any backend files**. The system uses:

- **Minimax and Alpha-Beta** algorithms (working ✓)
- **Board format conversion** with reversing for correct placement
- **Tree generation and visualization** with proper node values
- **Game over detection** based on board full + score comparison
- **Clean separation** between UI (frontend) and logic (backend)

The only unimplemented feature is **Expectiminimax**, which exists in the codebase but is not integrated or tested.
