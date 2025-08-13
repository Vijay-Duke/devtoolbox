#!/bin/bash

# Kill any existing servers
pkill -f "python3 -m http.server" 2>/dev/null

echo "🎨 Starting UI Test Server..."
echo "🌐 Server: http://localhost:8000"
echo ""
echo "📄 Available pages:"
echo "   🔐 Password Generator: http://localhost:8000/password-test.html"
echo "   📱 QR Code Generator: http://localhost:8000/qr-test.html"
echo "   🧪 UI Components: http://localhost:8000/ui-test.html"
echo "   🔧 Main App: http://localhost:8000/index.html"
echo ""
echo "✨ Test the new redesigns:"
echo "   🔐 Password Generator: Modern, gradient design"
echo "   📱 QR Generator: Professional layout like qr-code-generator.com"
echo "   - Perfect theme switching (light/dark)"
echo "   - Card-based layouts with beautiful animations"
echo "   - Mobile responsive design"
echo "   - Enhanced UX with larger touch targets"
echo ""
echo "Press Ctrl+C to stop"

# Start server
python3 -m http.server 8000