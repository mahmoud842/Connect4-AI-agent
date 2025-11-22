"""
Flask Backend Server for Connect4 AI Integration
Connects React frontend with existing minimax/alpha-beta backend logic
Does NOT modify any backend files - only calls them

To run: python3 backend_server.py
Then in another terminal: npm run dev
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))

# Import backend modules (not modifying them)
from state import Connect4State
import minimax
import alpha_beta
import expected_minimax
import expected_alpha_beta

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend


def board_to_internal_format(board):
    """
    Convert frontend board format to backend format
    Frontend: null/\"human\"/\"ai\" 
    Backend: 0/-1/1 (0=empty, 1=AI/MAX, -1=Human/MIN)
    """
    internal_board = []
    for row in board:
        internal_row = []
        for cell in row:
            if cell is None or cell == 'null':
                internal_row.append(0)
            elif cell == 'ai':
                internal_row.append(1)
            elif cell == 'human':
                internal_row.append(-1)
            else:
                internal_row.append(0)
        internal_board.append(internal_row)
    return internal_board


def board_to_frontend_format(board):
    """
    Convert backend board format to frontend format
    Backend: 0/-1/1
    Frontend: null/\"human\"/\"ai\"
    """
    frontend_board = []
    for row in board:
        frontend_row = []
        for cell in row:
            if cell == 0:
                frontend_row.append(None)
            elif cell == 1:
                frontend_row.append('ai')
            elif cell == -1:
                frontend_row.append('human')
            else:
                frontend_row.append(None)
        frontend_board.append(frontend_row)
    return frontend_board


def state_to_tree_json(state, is_expectiminimax=False):
    """
    Convert backend state tree to frontend JSON format
    Backend: State object with children array and action property
    Frontend: { value, player, move, children: [...], probability? }
    """
    if state is None:
        return None

    # Determine player type based on state.player value
    # state.player = 1 means MAX (AI), -1 means MIN (Human)
    if is_expectiminimax:
        # For expectiminimax, we need to track MAX/MIN/CHANCE nodes
        # Chance nodes appear after MIN nodes (opponent's uncertain move)
        if hasattr(state, 'is_chance') and state.is_chance:
            player_type = 'CHANCE'
        elif state.player == 1:
            player_type = 'MAX'
        else:
            player_type = 'MIN'
    else:
        # For regular minimax, only MAX/MIN
        player_type = 'MAX' if state.player == 1 else 'MIN'

    # Check if terminal node (leaf)
    is_leaf = len(state.children) == 0 or state.is_terminal()
    if is_leaf:
        player_type = 'LEAF'

    # Get the value - use heuristic if value not set
    node_value = state.value if state.value is not None else 0

    node = {
        'value': node_value,
        'player': player_type,
        'move': state.action,  # Column index (0-6) or None for root
        'children': []
    }

    # Add expected_value for expectiminimax from state.expected_value
    if is_expectiminimax:
        if hasattr(state, 'expected_value') and state.expected_value is not None:
            node['expected'] = state.expected_value
        # Don't add expected key at all if it doesn't exist or is None

    # Add probability for chance nodes (if applicable)
    if is_expectiminimax and player_type == 'CHANCE':
        # Equal probability for each child in expectiminimax
        if len(state.children) > 0:
            node['probability'] = 1.0 / len(state.children)

    # Recursively convert children
    for child in state.children:
        child_node = state_to_tree_json(child, is_expectiminimax)
        if child_node:
            node['children'].append(child_node)

    return node


def check_game_over(state):
    """
    Check if game is over and who won
    Returns: (game_over, winner, score)
    winner can be 'ai', 'human', 'draw', or None
    """

     # Check if board is full (draw)
    if state.is_terminal():
        # Check for 4-in-a-row winner using terminal_score
        terminal_scores = state.terminal_score()# is_terminal checks if top row is full
        ai_wins = terminal_scores[1]  # AI (player 1) 4-in-a-rows
        human_wins = terminal_scores[-1]  # Human (player -1) 4-in-a-rows
        score = {'human': human_wins, 'ai': ai_wins}
        if ai_wins > human_wins:
            return True, 'ai', score
        if human_wins > ai_wins:
            return True, 'human', score
        return True, 'draw', score
    
    return False, None, {'human': 0, 'ai': 0}
        



@app.route('/api/move', methods=['POST'])
def make_move():
    """
    Handle both AI and human moves
    AI moves: Run minimax/alpha-beta and return best move + tree
    Human moves: Only validate and check terminal state
    """
    data = request.json
    
    print("\n" + "="*60)
    print("📥 RECEIVED REQUEST:")
    print(f"Player: {data.get('player')}")
    print(f"Column: {data.get('column')}")
    print(f"Algorithm: {data.get('algorithm')}")
    print(f"Alpha-Beta: {data.get('useAlphaBeta')}")
    print(f"K: {data.get('k')}")
    print(f"Board (first 2 rows): {data.get('board', [])[:2]}")
    print("="*60 + "\n")
    
    # Extract parameters
    frontend_board = data.get('board')
    player = data.get('player')  # 'ai' or 'human'
    algorithm = data.get('algorithm', 'minimax')
    use_alpha_beta = data.get('useAlphaBeta', False)
    k = data.get('k', 4)
    column = data.get('column', None)  # Only for human moves
    first_player = data.get('firstPlayer', 'human')

    # Convert board to internal format
    internal_board = board_to_internal_format(frontend_board)
    
    print(f"🔄 Converted internal board (first 2 rows): {internal_board[:2]}")
    print()    # Update K value in backend modules
    minimax.K = k
    alpha_beta.K = k
    expected_minimax.K = k
    expected_alpha_beta.K = k

    if player == 'human':
        # Human move - just validate and check terminal state
        if column is None:
            return jsonify({'error': 'Column required for human move'}), 400

        # Make the move
        state = Connect4State(internal_board, -1, None,
                              None)  # Human is MIN (-1)

        # Check if column is valid
        if column not in state.available_actions():
            return jsonify({'error': 'Invalid column'}), 400

        # Apply the move
        new_state = state.transition(column)
        new_board = new_state.board

        # Check if game is over using state's terminal_score
        game_over, winner, score = check_game_over(new_state)

        response = {
            'board': board_to_frontend_format(new_board),
            'column': column,
            'gameOver': game_over,
            'winner': winner,
            'score': score,
            'tree': None  # No tree for human moves
        }
        
        print(f"📤 SENDING HUMAN RESPONSE:")
        print(f"Column: {column}")
        print(f"Game Over: {game_over}")
        print(f"Winner: {winner}")
        print(f"Score: {score}")
        print(f"Board (first 2 rows): {response['board'][:2]}")
        print("="*60 + "\n")
        
        return jsonify(response)

    elif player == 'ai':
        # AI move - run minimax/alpha-beta
        is_expectiminimax = algorithm == 'expectiminimax'

        # Determine which player AI is (depends on who started)
        # If human started first, AI is player 1 (MAX)
        # If AI started first, AI is player 1 (MAX)
        # The key is: AI always uses MAX, but minimax can start from current state's player
        ai_player = 1  # AI is always MAX (player 1)

        # Select the appropriate algorithm
        if is_expectiminimax:
            if use_alpha_beta:
                value, action, root_state = expected_alpha_beta.minimax(
                    internal_board, k)
            else:
                value, action, root_state = expected_minimax.minimax(
                    internal_board, k)
        else:
            if use_alpha_beta:
                value, action, root_state = alpha_beta.minimax(
                    internal_board, k)
            else:
                value, action, root_state = minimax.minimax(internal_board, k)

        if action is None:
            return jsonify({'error': 'No valid moves available'}), 400

        # Print tree structure BEFORE any conversion
        print(f"\n🌳 TREE STRUCTURE FROM ALGORITHM:")
        print(f"Algorithm: {'Expectiminimax' if is_expectiminimax else 'Minimax'}")
        print(f"Root state children count: {len(root_state.children)}")
        
        def print_tree_structure(state, depth=0, max_depth=3):
            if depth > max_depth:
                return
            indent = "  " * depth
            print(f"{indent}Node: player={state.player}, children={len(state.children)}, is_terminal={state.is_terminal()}, action={state.action}")
            for i, child in enumerate(state.children[:3]):  # Only first 3 children
                print_tree_structure(child, depth + 1, max_depth)
            if len(state.children) > 3:
                print(f"{indent}  ... and {len(state.children) - 3} more children")
        
        print_tree_structure(root_state)
        print("="*60 + "\n")

        # Convert state tree to JSON BEFORE calling transition to avoid modifying root_state
        tree = state_to_tree_json(root_state, is_expectiminimax)

        # Apply the AI's chosen move to get the resulting board
        
        # Check if column is valid
        if action not in root_state.available_actions():
            return jsonify({'error': 'Invalid column'}), 400
        
        # Apply the move
        final_state = root_state.transition(action)

        new_board = final_state.board

        # Check if game is over using state's terminal_score
        game_over, winner, score = check_game_over(final_state)

        response = {
            'board': board_to_frontend_format(new_board),
            'column': action,
            'gameOver': game_over,
            'winner': winner,
            'score': score,
            'tree': tree,
            'value': value
        }
        
        print(f"📤 SENDING AI RESPONSE:")
        print(f"Column: {action}")
        print(f"Value: {value}")
        print(f"Game Over: {game_over}")
        print(f"Winner: {winner}")
        print(f"Score: {score}")
        print(f"Board (first 2 rows): {response['board'][:2]}")
        print(f"Tree nodes: {len(root_state.children)} children")
        print("="*60 + "\n")
        
        return jsonify(response)

    else:
        return jsonify({'error': 'Invalid player'}), 400


@app.route('/api/game-status', methods=['POST'])
def get_game_status():
    """
    Check current game status (terminal state, winner, score)
    """
    data = request.json
    frontend_board = data.get('board')
    k = data.get('k', 4)

    internal_board = board_to_internal_format(frontend_board)
    state = Connect4State(internal_board, 1, None, None)

    game_over, winner, score = check_game_over(state)

    return jsonify({
        'gameOver': game_over,
        'winner': winner,
        'score': score
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Backend server is running'})


if __name__ == '__main__':
    print("🚀 Starting Connect4 AI Backend Server...")
    print("📡 Server running on http://localhost:5000")
    print("🎮 Ready to receive requests from React frontend")
    app.run(debug=True, port=5000)
