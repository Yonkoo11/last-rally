#!/bin/bash
# Auto-commit and deploy script for Last Rally
# Usage: ./scripts/deploy.sh

set -e

echo "🔍 Checking for uncommitted changes..."

# Check if there are any changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Found uncommitted changes. Auto-committing..."

    # Stage all changes
    git add -A

    # Create commit with timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    git commit -m "Auto-commit before deploy - $TIMESTAMP"

    echo "✅ Changes committed"
else
    echo "✅ Working directory clean"
fi

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deploy complete!"
