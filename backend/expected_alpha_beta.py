from state import Connect4State

INF = 1e18
K = 10

def minimax(board, depth = K):
    state = Connect4State(board, 1, None, None, -INF, INF)
    value, action, expanded = max_value(state, depth, -INF, INF)
    return value, action, state, expanded

def max_value(state: Connect4State, depth, alpha, beta):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None, 1
    
    rv = -INF
    best_action = None
    expanded = 0

    for c in state.available_actions():
        v2, _, ex = min_value(state.transition(c, alpha, beta), depth-1, alpha, beta)
        expanded += ex

        if rv < v2:
            rv, best_action = v2, c
            alpha = max(alpha, rv)

        if (alpha >= beta):
            rv , best_action = state.calulate_value()
            return rv, best_action, expanded

    rv , best_action = state.calulate_value()
    return rv, best_action, expanded

def min_value(state: Connect4State, depth, alpha, beta):
    if (state.is_terminal() or depth == 0):
       return state.heuristic(), None, 1
    
    rv = INF
    best_action = None
    expanded = 0

    for c in state.available_actions():
        v2, _, ex = max_value(state.transition(c, alpha, beta), depth-1, alpha, beta)
        expanded += ex

        if rv > v2:
            rv, best_action = v2, c
            beta = min(beta, rv)

        if (alpha >= beta):
                rv , best_action = state.calulate_value()
                return rv, best_action, expanded

    rv , best_action = state.calulate_value()
    return rv, best_action, expanded