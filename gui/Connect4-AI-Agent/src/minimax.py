from state import Connect4State

INF = 1e18
K = 10

def minimax(board, depth = K):
    
    state = Connect4State(board, 1, None, None)
    value, action = max_value(state, depth)
    return value, action, state

def max_value(state: Connect4State, depth):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None
    
    rv = -INF
    best_action = None

    for c in state.available_actions():
        v2, _ = min_value(state.transition(c), depth-1)
        if rv < v2:
            rv, best_action = v2, c

    return rv, best_action

def min_value(state: Connect4State, depth):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None
    
    rv = INF
    best_action = None

    for c in state.available_actions():
        v2, _ = max_value(state.transition(c), depth-1)
        if rv > v2:
            rv, best_action = v2, c

    return rv, best_action