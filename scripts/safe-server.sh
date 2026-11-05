#!/usr/bin/env bash
# Doorstep Hub - Safe Process Management Script
# Gracefully identifies and manages Next.js server processes on ports 3000 & 3001
set -eo pipefail

TARGET_PORT="${1:-3000}"
EXPECTED_DIR="Doorstep-Hub-Website"

get_listening_pid() {
  local port="$1"
  lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
}

is_doorstep_process() {
  local pid="$1"
  if [ -z "$pid" ]; then return 1; fi
  # Verify process command line or working directory
  local cmd
  cmd=$(ps -p "$pid" -o args= 2>/dev/null || true)
  if echo "$cmd" | grep -qiE "(next|Doorstep-Hub|node)"; then
    return 0
  fi
  return 1
}

safe_stop_port() {
  local port="$1"
  local pid
  pid=$(get_listening_pid "$port")

  if [ -z "$pid" ]; then
    echo "ℹ️  No process listening on port $port."
    return 0
  fi

  echo "🔍 Found process on port $port with PID: $pid"
  local proc_owner proc_cmd
  proc_owner=$(ps -p "$pid" -o user= 2>/dev/null || echo "unknown")
  proc_cmd=$(ps -p "$pid" -o args= 2>/dev/null || echo "unknown")
  echo "   Owner:   $proc_owner"
  echo "   Command: $proc_cmd"

  if ! is_doorstep_process "$pid"; then
    echo "⚠️  WARNING: Process PID $pid does not appear to be a Next.js / Doorstep Hub process!"
    echo "   Refusing to terminate unrelated process."
    return 1
  fi

  echo "🛑 Sending graceful termination (SIGTERM) to PID $pid..."
  kill -15 "$pid" 2>/dev/null || true

  # Wait up to 5 seconds for graceful exit
  local count=0
  while [ $count -lt 5 ]; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "✅ Process PID $pid on port $port terminated gracefully."
      return 0
    fi
    sleep 1
    count=$((count + 1))
  done

  # Force termination if still active
  if kill -0 "$pid" 2>/dev/null; then
    echo "⚠️  Process did not exit after 5s. Sending SIGKILL to PID $pid..."
    kill -9 "$pid" 2>/dev/null || true
    sleep 1
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "✅ Process PID $pid terminated."
    else
      echo "❌ Failed to terminate process PID $pid."
      return 1
    fi
  fi
}

case "$1" in
  stop)
    safe_stop_port "${2:-3000}"
    ;;
  status)
    echo "📊 Port 3000 (Production Preview):"
    P3000=$(get_listening_pid 3000)
    if [ -n "$P3000" ]; then
      ps -p "$P3000" -o pid,user,args
    else
      echo "   Not running."
    fi

    echo "📊 Port 3001 (Isolated Dev Server):"
    P3001=$(get_listening_pid 3001)
    if [ -n "$P3001" ]; then
      ps -p "$P3001" -o pid,user,args
    else
      echo "   Not running."
    fi
    ;;
  *)
    safe_stop_port "$TARGET_PORT"
    ;;
esac
