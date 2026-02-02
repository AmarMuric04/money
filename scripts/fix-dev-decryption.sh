#!/bin/bash
# Quick fix script to delete dev passwords that can't be decrypted

echo "🔧 Fixing decryption issue in development..."
echo ""
echo "This will:"
echo "  1. Delete all passwords from your dev database"
echo "  2. Clear your browser storage"
echo "  3. Allow you to create fresh passwords"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Error: Development server is not running!"
    echo "Please start it with: cd apps/secure && npm run dev"
    exit 1
fi

echo "📡 Calling delete API endpoint..."
echo ""

# Delete all passwords (requires being logged in)
curl -X DELETE \
  http://localhost:3000/api/dev/delete-all-passwords \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

echo ""
echo ""
echo "✅ Done!"
echo ""
echo "📋 Next steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Open browser console (F12)"
echo "  3. Run: sessionStorage.clear(); localStorage.clear();"
echo "  4. Log out and log back in"
echo "  5. Create new passwords - they'll work perfectly!"
echo ""

# Clean up
rm -f cookies.txt
