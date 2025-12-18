#!/bin/bash
# VoyageNest Start Script

cd "$(dirname "$0")"

echo "=== Starting VoyageNest ==="
echo ""

# Check if tmux is available
if command -v tmux &> /dev/null; then
    # Kill existing session if any
    tmux kill-session -t voyagenest 2>/dev/null || true
    
    # Create new tmux session
    tmux new-session -d -s voyagenest -n backend
    tmux send-keys -t voyagenest:backend "cd backend && php artisan serve --host=0.0.0.0 --port=7000" Enter
    
    tmux new-window -t voyagenest -n web
    tmux send-keys -t voyagenest:web "cd frontend/web && npm run dev" Enter
    
    tmux new-window -t voyagenest -n admin
    tmux send-keys -t voyagenest:admin "cd frontend/admin && npm run dev" Enter
    
    echo "✅ Services started in tmux session 'voyagenest'"
    echo ""
    echo "Attach to session: tmux attach -t voyagenest"
    echo ""
else
    # Run without tmux
    echo "Starting services (use Ctrl+C to stop all)..."
    echo ""
    
    # Start backend
    cd backend
    php artisan serve --host=0.0.0.0 --port=7000 &
    BACKEND_PID=$!
    cd ..
    
    # Start web frontend
    cd frontend/web
    npm run dev &
    WEB_PID=$!
    cd ../..
    
    # Start admin frontend
    cd frontend/admin
    npm run dev -- --port 5174 &
    ADMIN_PID=$!
    cd ../..
    
    echo ""
    echo "✅ Services started!"
    echo ""
    
    # Wait for any process to exit
    wait
fi

echo ""
echo "🌐 URLs:"
echo "   API:   http://localhost:8000"
echo "   Web:   http://localhost:5173"
echo "   Admin: http://localhost:5174"
echo ""
echo "📝 Admin Login:"
echo "   Username: beetlejuice"
echo "   Password: Makatussin911#"

