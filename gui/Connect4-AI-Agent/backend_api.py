"""
Flask Backend API for Connect 4 AI Game

This file contains the API endpoints structure for the Connect 4 game.
The frontend will communicate with these endpoints to get AI moves and game trees.

SETUP INSTRUCTIONS:
1. Install Flask: pip install flask flask-cors
2. Run the server: python backend_api.py
3. The server will run on http://localhost:5000

FRONTEND INTEGRATION:
Update the fetch calls in GameBoard.jsx by uncommenting the backend integration sections.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ============================================================================
# API ENDPOINT 1: Get AI Move
# ============================================================================


@app.route('/api/move', methods=['POST'])
def get_ai_move():
    """
    Get the AI's next move based on the current board state.

    Request Body:
    {
        "board": [[null, null, ...], ...],  // 6x7 board matrix
        "algorithm": "minimax" | "expectiminimax",
        "useAlphaBeta": true | false,
        "player": "ai" | "human"
    }

    Response:
    {
        "column": 3,  // The column where AI wants to place the piece (0-6)
        "tree": {     // The game tree generated during search
            "value": 5,
            "player": "MAX",
            "depth": 0,
            "move": null,
            "children": [...]
        }
    }
    """
    data = request.json
    board = data.get('board')
    algorithm = data.get('algorithm')
    use_alpha_beta = data.get('useAlphaBeta')
    player = data.get('player')

    # TODO: Implement your minimax/expectiminimax algorithm here
    # For now, returning a mock response

    # Example implementation structure:
    # if algorithm == 'minimax':
    #     if use_alpha_beta:
    #         column, tree = minimax_alpha_beta(board, player)
    #     else:
    #         column, tree = minimax(board, player)
    # else:
    #     if use_alpha_beta:
    #         column, tree = expectiminimax_alpha_beta(board, player)
    #     else:
    #         column, tree = expectiminimax(board, player)

    # Mock response - replace with actual algorithm
    mock_response = {
        "column": 3,
        "tree": {
            "value": 5,
            "player": "MAX",
            "depth": 0,
            "move": None,
            "children": []
        }
    }

    return jsonify(mock_response)


# ============================================================================
# API ENDPOINT 2: Check Game Status
# ============================================================================
@app.route('/api/game-status', methods=['POST'])
def check_game_status():
    """
    Check if the game has ended and calculate the final score.

    Request Body:
    {
        "board": [[null, null, ...], ...]  // 6x7 board matrix
    }

    Response:
    {
        "gameOver": true | false,
        "winner": "human" | "ai" | "draw" | null,
        "winningCells": [[row, col], ...] | null  // Optional: cells that form the winning line
    }
    """
    data = request.json
    board = data.get('board')

    # TODO: Implement win detection logic
    # Check horizontal, vertical, and diagonal connections
    # Return the winner and optionally the winning cells

    # Mock response - replace with actual logic
    mock_response = {
        "gameOver": False,
        "winner": None,
        "winningCells": None
    }

    return jsonify(mock_response)


# ============================================================================
# API ENDPOINT 3: Get Tree Visualization (Alternative to embedding in move)
# ============================================================================
@app.route('/api/get-tree', methods=['POST'])
def get_tree():
    """
    Get the game tree for the current board state.
    This can be called separately when user clicks "View Tree" button.

    Request Body:
    {
        "board": [[null, null, ...], ...],
        "algorithm": "minimax" | "expectiminimax",
        "useAlphaBeta": true | false,
        "player": "ai" | "human"
    }

    Response:
    {
        "tree": {
            "value": 5,
            "player": "MAX",
            "depth": 0,
            "move": null,
            "children": [...]
        }
    }
    """
    data = request.json
    board = data.get('board')
    algorithm = data.get('algorithm')
    use_alpha_beta = data.get('useAlphaBeta')
    player = data.get('player')

    # TODO: Implement tree generation
    # This might be the same tree generated during move calculation
    # Or you can generate it on-demand

    # Mock tree response
    mock_tree = {
        "tree": {
            "value": 5,
            "player": "MAX",
            "depth": 0,
            "move": None,
            "children": []
        }
    }

    return jsonify(mock_tree)


# ============================================================================
# HELPER FUNCTIONS (TO BE IMPLEMENTED)
# ============================================================================

def minimax(board, player, depth=0, max_depth=5):
    """
    Implement the Minimax algorithm.

    Args:
        board: Current game board state
        player: Current player ('ai' or 'human')
        depth: Current depth in the tree
        max_depth: Maximum depth to search

    Returns:
        tuple: (best_column, game_tree)
    """
    # TODO: Implement minimax algorithm
    pass


def minimax_alpha_beta(board, player, alpha=float('-inf'), beta=float('inf'), depth=0, max_depth=5):
    """
    Implement Minimax with Alpha-Beta pruning.

    Args:
        board: Current game board state
        player: Current player ('ai' or 'human')
        alpha: Alpha value for pruning
        beta: Beta value for pruning
        depth: Current depth in the tree
        max_depth: Maximum depth to search

    Returns:
        tuple: (best_column, game_tree)
    """
    # TODO: Implement minimax with alpha-beta pruning
    pass


def expectiminimax(board, player, depth=0, max_depth=5):
    """
    Implement the Expectiminimax algorithm.

    Args:
        board: Current game board state
        player: Current player ('ai' or 'human')
        depth: Current depth in the tree
        max_depth: Maximum depth to search

    Returns:
        tuple: (best_column, game_tree)
    """
    # TODO: Implement expectiminimax algorithm
    pass


def expectiminimax_alpha_beta(board, player, alpha=float('-inf'), beta=float('inf'), depth=0, max_depth=5):
    """
    Implement Expectiminimax with Alpha-Beta pruning.

    Args:
        board: Current game board state
        player: Current player ('ai' or 'human')
        alpha: Alpha value for pruning
        beta: Beta value for pruning
        depth: Current depth in the tree
        max_depth: Maximum depth to search

    Returns:
        tuple: (best_column, game_tree)
    """
    # TODO: Implement expectiminimax with alpha-beta pruning
    pass


def evaluate_board(board, player):
    """
    Evaluate the current board state and return a score.

    Args:
        board: Current game board state
        player: Player to evaluate for

    Returns:
        float: Evaluation score
    """
    # TODO: Implement board evaluation heuristic
    # Consider:
    # - Winning positions (4 in a row)
    # - Potential winning positions (3 in a row with empty space)
    # - Center column control
    # - Blocking opponent's winning moves
    pass


def check_winner(board):
    """
    Check if there's a winner on the board.

    Args:
        board: Current game board state

    Returns:
        str | None: 'ai', 'human', 'draw', or None
    """
    # TODO: Implement win detection
    # Check horizontal, vertical, and diagonal lines
    pass


def get_valid_moves(board):
    """
    Get all valid column indices where a piece can be placed.

    Args:
        board: Current game board state

    Returns:
        list: List of valid column indices (0-6)
    """
    # TODO: Implement valid moves detection
    valid_moves = []
    for col in range(7):
        if board[0][col] is None:
            valid_moves.append(col)
    return valid_moves


def make_move(board, column, player):
    """
    Make a move on the board (returns a new board, doesn't modify original).

    Args:
        board: Current game board state
        column: Column to place the piece (0-6)
        player: Player making the move ('ai' or 'human')

    Returns:
        list: New board state after the move
    """
    # TODO: Implement move execution
    # Create a deep copy of the board and place the piece
    pass


# ============================================================================
# Run the Flask server
# ============================================================================
if __name__ == '__main__':
    print("=" * 60)
    print("Connect 4 AI Backend Server")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  POST /api/move          - Get AI move")
    print("  POST /api/game-status   - Check game status")
    print("  POST /api/get-tree      - Get game tree")
    print("\nMake sure to implement the TODO sections before testing!")
    print("=" * 60)

    app.run(debug=True, port=5000)
