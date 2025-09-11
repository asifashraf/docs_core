#!/usr/bin/env bash

# Set your commit message here (not a script parameter)
<<<<<<< HEAD
COMMIT_MSG="push all win"
=======
COMMIT_MSG="push all with msg"
>>>>>>> a3015cab4cbad7f73c3e2175c222ba2fb6d73b6b

if [ -z "$COMMIT_MSG" ]; then
    echo "Git commit message is empty. Please set COMMIT_MSG at the top of the script."
    exit 1
fi

# List of repositories (relative paths)
repos=(concept doc skid)

for repo in "${repos[@]}"; do
    if [ -d "$repo" ]; then
        echo "--- Processing: $repo ---"
        cd "$repo" || { echo "Failed to enter $repo"; exit 1; }

        git add .
        # Commit if there are changes; git commit returns non-zero when there's nothing to commit
        if git commit -m "$COMMIT_MSG"; then
            echo "Committed in $repo"
        else
            echo "No commit made in $repo (no changes or commit failed)"
        fi

        # Use rebase to keep a cleaner history
        git pull --rebase
        git push

        cd ..
        echo
    else
        echo "Directory '$repo' not found, skipping"
    fi
done

echo "All done"
