#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PATH="$ROOT_DIR/venv"
BACKEND_CMD=("$VENV_PATH/bin/python" -m uvicorn main:app --reload)
FRONTEND_CMD=(npm run start)
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  local exit_code=$?

  if [[ -n "$FRONTEND_PID" ]] && ps -p "$FRONTEND_PID" >/dev/null 2>&1; then
    echo "Stopping frontend (PID: $FRONTEND_PID)"
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$BACKEND_PID" ]] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    echo "Stopping backend (PID: $BACKEND_PID)"
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  wait >/dev/null 2>&1 || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

if [[ ! -x "$VENV_PATH/bin/python" ]]; then
  echo "Python virtualenv not found at $VENV_PATH/bin/python."
  echo "Create it with: python3 -m venv venv && ./venv/bin/pip install -r requirements.txt"
  exit 1
fi

if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo "Frontend dependencies missing. Run: (cd frontend && npm install)"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not found in PATH."
  exit 1
fi

if ! "$VENV_PATH/bin/python" -m uvicorn --help >/dev/null 2>&1; then
  echo "uvicorn not available in the virtualenv. Run: ./venv/bin/pip install -r requirements.txt"
  exit 1
fi

if ! command -v lsof >/dev/null 2>&1; then
  echo "Warning: lsof not available; skipping port availability check."
else
  if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port 8000 already in use. Free it before running this script."
    exit 1
  fi

  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port 3000 already in use. Free it before running this script."
    exit 1
  fi
fi

echo "Starting backend server..."
("${BACKEND_CMD[@]}") &
BACKEND_PID=$!

echo "Starting frontend development server..."
(
  cd "$ROOT_DIR/frontend"
  "${FRONTEND_CMD[@]}"
) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "Servers are running. Press Ctrl+C to stop both."
wait -n "$BACKEND_PID" "$FRONTEND_PID"
FIRST_EXIT=$?

wait || true
exit "$FIRST_EXIT"
