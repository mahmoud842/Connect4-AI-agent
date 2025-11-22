from state import Connect4State

INF = 1e18
K = 10

def minimax(board, depth = K):
    state = Connect4State(board, 1, None, None, -INF, INF)
    value, action = max_value(state, depth, -INF, INF)
    return value, action, state

def max_value(state: Connect4State, depth, alpha, beta):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None
    
    rv = -INF
    best_action = None

    for c in state.available_actions():
        v2, _ = min_value(state.transition(c, alpha, beta), depth-1, alpha, beta)
        if rv < v2:
            rv, best_action = v2, c
            alpha = max(alpha, rv)

        if (alpha >= beta):
            return rv, best_action

    return rv, best_action

def min_value(state: Connect4State, depth, alpha, beta):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None
    
    rv = INF
    best_action = None

    for c in state.available_actions():
        v2, _ = max_value(state.transition(c, alpha, beta), depth-1, alpha, beta)
        if rv > v2:
            rv, best_action = v2, c
            beta = min(beta, rv)

        if (alpha >= beta):
            return rv, best_action

    return rv, best_action