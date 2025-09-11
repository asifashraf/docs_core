#!/usr/bin/env bash

# Set your commit message here (not a script parameter)
COMMIT_MSG="Initial commit"

if [ -z "$COMMIT_MSG" ]; then
    echo "Git commit message is empty. Please set COMMIT_MSG at the top of the script."
    exit 1
fi

git pull

git add .
git commit -m "$COMMIT_MSG"
git push

echo "All done"
