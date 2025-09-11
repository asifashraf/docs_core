#!/bin/bash

while true; do
    if [ -z "$1" ]; then
        echo "Error: Commit message is required."
        exit 1
    fi

    echo "Running auto-push..."
    
    git add .
    git commit -m "$1"
    git pull
    git push

    echo "Waiting 60 seconds before next push..."
    sleep 60
done
