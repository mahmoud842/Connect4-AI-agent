ROWS = 6
COLS = 7
INF = 1e18

class Connect4State:
    def __init__(self, board=None, player=1, action=None, parent=None, alpha = None, beta = None):
        if board is None:
            self.board = [[0] * COLS for _ in range(ROWS)]
        else:
            self.board = [row.copy() for row in board]

        self.player = player
        self.action = action
        self.parent = parent

        self.alpha = alpha
        self.beta = beta
        self.value = None
        self.expected_value = None
        self.children = []

    def copy(self):
        return Connect4State(board=self.board, player=self.player, action=self.action, parent=self.parent)

    def available_actions(self):
        return [c for c in range(COLS) if self.board[ROWS - 1][c] == 0]

    def _next_open_row(self, col):
        for r in range(ROWS):
            if self.board[r][col] == 0:
                return r
        raise IndexError("Column full")

    def transition(self, action, alpha = None, beta = None):
        r = self._next_open_row(action)
        child = Connect4State(self.board, -self.player, action, self, alpha, beta)
        child.board[r][action] = self.player
        self.children.append(child)
        return child

    def neighbors(self):
        children = []
        for c in self.available_actions():
            r = self._next_open_row(c)
            child = Connect4State(board=self.board, player=-self.player, action=c, parent=self)
            child.board[r][c] = self.player
            children.append(child)
        return children

    def is_terminal(self):
        for i in range(COLS):
            if (self.board[ROWS - 1][i] == 0):
                return False
        return True

    def _get_window(self, r, c, dr, dc):
        return [self.board[r + i*dr][c + i*dc] for i in range(4)]

    def _all_windows(self):
        windows = []

        # horizontal
        for r in range(ROWS):
            for c in range(COLS - 3):
                windows.append(self._get_window(r, c, 0, 1))

        # vertical
        for r in range(ROWS - 3):
            for c in range(COLS):
                windows.append(self._get_window(r, c, 1, 0))

        # diag up-right
        for r in range(ROWS - 3):
            for c in range(COLS - 3):
                windows.append(self._get_window(r, c, 1, 1))

        # diag down-right
        for r in range(3, ROWS):
            for c in range(COLS - 3):
                windows.append(self._get_window(r, c, -1, 1))

        return windows

    def count_windows(self, player):
        four = three = two = possible = 0
        opp = -player
        for w in self._all_windows():
            if opp in w:
                continue
            cnt = w.count(player)
            if cnt == 4:
                four += 1
            elif cnt == 3 and w.count(0) == 1:
                three += 1
            elif cnt == 2 and w.count(0) == 2:
                two += 1
            if cnt >= 1:
                possible += 1
        return four, three, two, possible

    def terminal_score(self):
        ai_four, _, _, _ = self.count_windows(1)
        opp_four, _, _, _ = self.count_windows(-1)
        return {1: ai_four, -1: opp_four}

    def heuristic(self):
        ai = 1
        opp = -1

        ai_four, ai_three, ai_two, ai_pos = self.count_windows(ai)
        op_four, op_three, op_two, op_pos = self.count_windows(opp)

        score = 0

        score += 5000 * ai_four
        score -= 5000 * op_four

        score += 100 * ai_three
        score -= 100 * op_three

        score += 10 * ai_two
        score -= 10 * op_two

        score += 1 * ai_pos
        score -= 1 * op_pos

        # center column preference
        # center = COLS // 2
        # center_count = sum(1 for r in range(ROWS) if self.board[r][center] == ai)
        # score += center_count * 3

        self.value = score

        return score
    def calulate_value(self):
        if self.value is not None:
            return self.value
        bestMove = None
        if self.player == 1:
            rv = -INF
            for c in self.children:
                c.calulate_value()
            for c in self.children:
                v = self.calculate_child_expected(c,self.children)
                if rv < v:
                    rv = v
                    bestMove = c.action
            self.value = rv
            if self.parent is None:
                self.expected_value = rv
            return rv ,bestMove  
        else:
            rv = INF
            for c in self.children:
                c.calulate_value()
            for c in self.children:
                c.calulate_value()
                v = self.calculate_child_expected(c,self.children)
                if rv > v:
                    rv = v
                    bestMove = c.action
            self.value = rv
            if self.parent is None:
                self.expected_value = rv
            return rv , bestMove
        
    def calculate_child_expected(self, child,children):
        if child.value is not None:
            if child.is_terminal():
                child.value = child.heuristic()
            else:
                child.calulate_value()    
        
        left = self.get_child(children,child.action-1)
        right = self.get_child(children,child.action+1)
        
        if left is None and right is None:
                child.expected_value = child.value
                return child.value
        elif left is None:
                child.expected_value = right.value * 0.4 + 0.6 * child.value
                return child.expected_value
        elif right is None:
                child.expected_value = left.value * 0.4 + 0.6 * child.value
                return child.expected_value
        else:
                child.expected_value = left.value * 0.2 + 0.2 * right.value + 0.6 * child.value
                return child.expected_value
           
        
    def get_child(self,children,action):
        for child in children:
            if child.action == action:
                return child
        return None
