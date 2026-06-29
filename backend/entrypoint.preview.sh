#!/bin/sh

PROJECT_PATH="/app/project"
PROJECT_DIR="/app/project"
REQUIRED_FILES="package.json tsconfig.json"
CHECKSUM_FILE="node_modules/.checksums.md5"
PRISMA_CHECKSUM_FILE=".prisma-checksums.md5"

SERVER_PID=""

get_checksum() {
    {
        find . -maxdepth 1 -name "package.json" -type f -exec openssl md5 -r {} \; 2>/dev/null
        find . -maxdepth 1 -name ".env*" -type f -exec openssl md5 -r {} \; 2>/dev/null
    } | awk '{print $1}' | sort | openssl md5 -r 2>/dev/null | awk '{print $1}' || echo ""
}

get_prisma_checksum() {
    {
        find . -maxdepth 1 -name "prisma.config.ts" -type f -exec openssl md5 -r {} \; 2>/dev/null
        find ./src/prisma -name "*.prisma" -type f -exec openssl md5 -r {} \; 2>/dev/null
        find ./src/prisma -name "seed.ts" -type f -exec openssl md5 -r {} \; 2>/dev/null
        find ./src/prisma/migrations -type f -exec openssl md5 -r {} \; 2>/dev/null
        find . -maxdepth 1 -name ".env*" -type f -exec openssl md5 -r {} \; 2>/dev/null
    } | awk '{print $1}' | sort | openssl md5 -r 2>/dev/null | awk '{print $1}' || echo ""
}

get_stored_checksum() {
    if [ -f "$CHECKSUM_FILE" ]; then
        cat "$CHECKSUM_FILE" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

update_checksum() {
    checksum_value=$1
    mkdir -p node_modules 2>/dev/null || true
    echo "$checksum_value" > "$CHECKSUM_FILE" 2>/dev/null || true
}

get_stored_prisma_checksum() {
    if [ -f "$PRISMA_CHECKSUM_FILE" ]; then
        cat "$PRISMA_CHECKSUM_FILE" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

update_prisma_checksum() {
    checksum_value=$1
    echo "$checksum_value" > "$PRISMA_CHECKSUM_FILE" 2>/dev/null || true
}

run_prisma_commands() {
    echo "Running Prisma database commands..."

    # Only run dbGenerate if prisma.config.ts exists
    if [ -f "prisma.config.ts" ]; then
        echo "Running dbGenerate..."
        pnpm dbGenerate || echo "Warning: dbGenerate failed, but continuing..."
    else
        echo "Skipping dbGenerate — prisma.config.ts not found."
    fi

    echo "Running db:push..."
    pnpm db:push || echo "Warning: db:push failed, but continuing..."

    echo "Running db:seed..."
    pnpm db:seed || echo "Warning: db:seed failed, but continuing..."

    echo "Prisma database commands completed."
}

kill_children() {
    parent_pid=$1
    signal=${2:-TERM}
    ps -o pid,ppid | awk -v ppid="$parent_pid" '$2 == ppid {print $1}' | while read -r child_pid; do
        kill -$signal "$child_pid" 2>/dev/null || true
    done
}

kill_port() {
    port=$1
    pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "Found processes still using port $port, killing..."
        for pid in $pids; do
            kill -KILL $pid 2>/dev/null || true
        done
    fi
}

stop_server() {
    if [ -z "$SERVER_PID" ]; then
        return
    fi

    echo "Stopping server process (PID: $SERVER_PID)..."
    KILLED_PID=$SERVER_PID

    kill_children "$SERVER_PID" "TERM"
    kill -TERM $SERVER_PID 2>/dev/null || true

    timeout=10
    count=0
    while kill -0 $SERVER_PID 2>/dev/null && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
    done

    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "Force killing process..."
        kill_children "$SERVER_PID" "KILL"
        kill -KILL $SERVER_PID 2>/dev/null || true
        sleep 1
    fi

    # Kill anything still holding the port
    kill_port "$PORT"
    echo "Server process (PID: $KILLED_PID) stopped."
}

start_server() {
    should_run_prisma_commands=$1

    echo "Installing dependencies..."
    pnpm install || echo "Warning: pnpm install failed, but continuing..."

    if [ "$should_run_prisma_commands" = "true" ]; then
        run_prisma_commands
    fi

    stop_server

    echo "Starting server on 0.0.0.0:${PORT}..."
    if [ -n "$START_COMMAND" ]; then
        echo "Running START_COMMAND: $START_COMMAND"
        eval "$START_COMMAND" &
    else
        echo "Running pnpm dev"
        pnpm dev &
    fi

    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
}

# ── Main ───────────────────────────────────────────────────────────────────────

# Ensure PORT is set — Render injects this automatically, fallback to 9000
export PORT="${PORT:-9000}"

echo "Using PORT: $PORT"

cd "$PROJECT_DIR" || {
    echo "Error: Failed to change directory to $PROJECT_DIR"
    exit 1
}

# Validate required files are present (baked in at build time via COPY . .)
echo "Checking required files in $PROJECT_DIR..."
for file in $REQUIRED_FILES; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo "ERROR: Required file '$file' not found in $PROJECT_DIR."
        echo "Make sure your Dockerfile includes: COPY . ."
        exit 1
    fi
done
echo "All required files found."

# Initial startup — always run Prisma on first boot
start_server "true"
update_checksum "$(get_checksum)"
update_prisma_checksum "$(get_prisma_checksum)"

# Watch loop — restart on file changes (e.g. mounted volumes or git sync)
while true; do
    sleep 10

    OLD_CHECKSUM=$(get_stored_checksum)
    NEW_CHECKSUM=$(get_checksum)
    OLD_PRISMA_CHECKSUM=$(get_stored_prisma_checksum)
    NEW_PRISMA_CHECKSUM=$(get_prisma_checksum)

    SHOULD_RESTART=false
    SHOULD_RUN_PRISMA=false

    if [ -n "$NEW_CHECKSUM" ] && [ "$OLD_CHECKSUM" != "$NEW_CHECKSUM" ]; then
        echo "Package or environment files changed — will restart."
        SHOULD_RESTART=true
        update_checksum "$NEW_CHECKSUM"
    fi

    if [ -n "$NEW_PRISMA_CHECKSUM" ] && [ "$OLD_PRISMA_CHECKSUM" != "$NEW_PRISMA_CHECKSUM" ]; then
        echo "Prisma files changed — will restart with migrations."
        SHOULD_RESTART=true
        SHOULD_RUN_PRISMA=true
        update_prisma_checksum "$NEW_PRISMA_CHECKSUM"
    fi

    if [ "$SHOULD_RESTART" = true ]; then
        start_server "$SHOULD_RUN_PRISMA"
    fi
done