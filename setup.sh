#!/bin/bash
# setup.sh — Initialize and push Poker Solver to GitHub
# Usage: ./setup.sh <github-username> [repo-name]

set -e

GITHUB_USER=${1:?"Usage: ./setup.sh <github-username> [repo-name]"}
REPO_NAME=${2:-"poker-solver"}

echo "🃏 Poker Solver — GitHub Setup"
echo "================================"
echo "Repo: github.com/$GITHUB_USER/$REPO_NAME"
echo ""

# Init git
git init
git add .
git commit -m "feat: initial scaffold — Phase 1 ready for Claude Flow"

# Create GitHub repo (requires gh CLI — https://cli.github.com)
if command -v gh &> /dev/null; then
  echo "Creating GitHub repo via gh CLI..."
  gh repo create "$REPO_NAME" \
    --public \
    --description "Poker equity calculator SaaS — NLHE, PLO, range vs range" \
    --push \
    --source=.
  echo ""
  echo "✅ Repo created and pushed:"
  echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
else
  echo "gh CLI not found. Pushing manually..."
  echo ""
  echo "1. Go to https://github.com/new"
  echo "2. Create a repo named: $REPO_NAME"
  echo "3. Then run:"
  echo ""
  echo "   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
  echo "   git branch -M main"
  echo "   git push -u origin main"
fi

echo ""
echo "Next steps:"
echo "  1. Open the repo in VS Code"
echo "  2. Install Claude Code extension"
echo "  3. Open a new Claude Code instance"
echo "  4. Say: 'Read CLAUDE.md and activate Claude Flow. You are the Orchestrator. Begin Phase 1.'"
