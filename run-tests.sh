#!/bin/bash

# Kill any existing server on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Start the server
echo "Starting local server on port 8080..."
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open test runner in browser
echo "Opening test runner in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080/tests/test-runner.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080/tests/test-runner.html 2>/dev/null || echo "Please open http://localhost:8080/tests/test-runner.html in your browser"
fi

echo "Server running with PID: $SERVER_PID"
echo "Test runner available at: http://localhost:8080/tests/test-runner.html"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for Ctrl+C
trap "kill $SERVER_PID 2>/dev/null; echo 'Server stopped'; exit" INT
wait $SERVER_PID