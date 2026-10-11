#!/usr/bin/env bash

# Research Opportunity Portal Startup Script

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

echo "=== Research Opportunity Portal ==="

# Check virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment in backend/venv..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Ensure .env exists
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
fi

# Check if MySQL/MariaDB service is active
if ! systemctl is-active --quiet mariadb && ! systemctl is-active --quiet mysql; then
    echo "⚠️  Warning: Neither mariadb nor mysql service is currently active."
    echo "   If your database is not running, API calls to the database will fail."
    echo "   Start MariaDB with: sudo systemctl start mariadb"
    echo ""
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend
echo "🚀 Starting backend Flask server on http://127.0.0.1:5000..."
backend/venv/bin/python backend/app.py &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 1

# Start frontend
echo "🌐 Starting frontend HTTP server on http://localhost:8000..."
python3 -m http.server 8000 --directory frontend &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   - Frontend: http://localhost:8000"
echo "   - Backend API: http://127.0.0.1:5000"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
