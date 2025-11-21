#!/bin/bash

echo "=========================================="
echo "Guardian Earth AI - Quick Start"
echo "=========================================="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip3 install -r requirements.txt

# Train models
echo ""
echo "Training AI models (this may take 10-25 minutes)..."
python3 train_models.py

# Start server
echo ""
echo "Starting prediction server..."
python3 prediction_server.py
