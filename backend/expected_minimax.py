from state import Connect4State

INF = 1e18
K = 10

def minimax(board, depth = K):
    state = Connect4State(board, 1, None, None)
    value, action, expanded = max_value(state, depth)
    return value, action, state, expanded

def max_value(state: Connect4State, depth):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None, 1
        
    
    rv = -INF
    best_action = None
    expanded = 0

    for c in state.available_actions():
        _, _, ex = min_value(state.transition(c), depth-1)
        expanded += ex
       
    rv, best_action = state.calulate_value()
    return rv, best_action, expanded

def min_value(state: Connect4State, depth):
    if (state.is_terminal() or depth == 0):
        return state.heuristic(), None, 1
    
    rv = INF
    best_action = None
    expanded = 0

    for c in state.available_actions():
        _, _, ex = max_value(state.transition(c), depth-1)
        expanded += ex
        
    rv , best_action = state.calulate_value()
    return rv, best_action, expanded