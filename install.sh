#!/bin/bash

# HALO One-Click Install Script
# Like n8n, but for HALO automation platform!

set -e

# Download and run the interactive setup
echo "🚀 Installing HALO - Hyper-Automation & Logical Orchestration Platform"
echo "🎮 Port 2552 - HALO's signature port (Halo: Combat Evolved timeline)"
echo ""

# Check if we're in a git repository
if [ -d ".git" ]; then
    echo "✅ Running from existing HALO repository"
    chmod +x interactive-setup.sh
    ./interactive-setup.sh
else
    echo "📥 This will clone HALO repository and run interactive setup"
    echo "Enter your HALO repository URL, or press Enter to skip if already downloaded:"
    read -r REPO_URL
    
    if [[ -n "$REPO_URL" ]]; then
        git clone "$REPO_URL" halo
        cd halo
        chmod +x interactive-setup.sh
        ./interactive-setup.sh
    else
        echo "❌ Please run this script from the HALO repository directory"
        echo "Or provide the repository URL when prompted"
        exit 1
    fi
fi