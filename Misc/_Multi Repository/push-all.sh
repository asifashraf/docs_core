
# Get commit message from first argument
message="scan all repos - $(date +'%Y-%m-%d %H:%M:%S')"

# Check if commit message is provided
if [ -z "$message" ]; then
    echo "Git commit message is empty"
    exit 1
else

# Dynamically find all directories starting with r-
repos=(r-*/)


for repo in "${repos[@]}"; do
    echo "Found repository: $repo"
    repo="${repo%/}"
    if [ -d "$repo" ]; then
        echo "--- Processing: $repo ---"
        cd "$repo" || { echo "Failed to enter $repo"; exit 1; }

        # your command goes here


            git add .
            git commit -m "$message"
            git pull
            git push

        # your command ends here

        cd ..
        echo
    else
        echo "Directory '$repo' not found, skipping"
    fi
done

echo "All done"
fi