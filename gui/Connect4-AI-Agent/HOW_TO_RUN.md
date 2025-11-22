# How to Run Connect4 AI

## Simple 3-Step Setup

### Step 1: Install Dependencies (First Time Only)

```bash
# Install frontend
npm install

# Install backend
pip3 install Flask flask-cors
```

### Step 2: Start Backend Server (Terminal 1)

```bash
python3 backend_server.py
```

You should see:

```
🚀 Starting Connect4 AI Backend Server...
📡 Server running on http://localhost:5000
```

**Keep this terminal running!**

### Step 3: Start Frontend (Terminal 2 - New Terminal)

```bash
npm run dev
```

You should see:

```
➜ Local: http://localhost:5173/
```

**Open your browser to: http://localhost:5173**

---

## That's It!

Now you can:

1. Configure your game (Minimax/Expectiminimax, Alpha-Beta, K value)
2. Play against AI
3. View the decision tree

---

## Troubleshooting

**Problem: "Failed to connect to backend"**

- Make sure Terminal 1 is still running with `python3 backend_server.py`
- Check: `curl http://localhost:5000/api/health`

**Problem: Port 5000 already in use**

- Kill the process: `lsof -i :5000` then `kill -9 <PID>`

**Problem: Python can't find modules**

- Make sure you're in the correct directory
- Check that `src/minimax.py`, `src/state.py` etc. exist
