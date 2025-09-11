#!/bin/bash


# Dynamically find all directories starting with r-
repos=(r-*/)


for repo in "${repos[@]}"; do
    echo "Found repository: $repo"
    repo="${repo%/}"
    if [ -d "$repo" ]; then
        echo "--- Processing: $repo ---"
        cd "$repo" || { echo "Failed to enter $repo"; exit 1; }

        # your command goes here

        git pull

        # your command ends here

        cd ..
        echo
    else
        echo "Directory '$repo' not found, skipping"
    fi
done

echo "All done"
